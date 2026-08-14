package emilb04.varsel.ElectricityServices;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.Map;
import java.util.Scanner;
import java.util.concurrent.ConcurrentHashMap;

import org.json.JSONArray;
import org.json.JSONObject;

import emilb04.varsel.Components.DTFormatter;
import emilb04.varsel.Components.JsonFormatter;
import emilb04.varsel.ElectricityRegions.ElectricityRegion;

public class ElectricityFetcher {

    // Raw upstream responses rarely change once published, so a short in-memory
    // cache keyed by region+date avoids re-hitting hvakosterstrommen.no on
    // every request for the same day (e.g. switching cities within an area).
    private static final long CACHE_TTL_MILLIS = 10 * 60 * 1000; // 10 minutes

    // Upper bound on distinct region+date keys kept in memory. Without this the
    // map grows by one entry per (region, date) pair forever, since expired
    // entries were previously only skipped on read and never removed.
    private static final int CACHE_MAX_ENTRIES = 256;

    // Never let a slow or hanging upstream tie up a request thread indefinitely.
    private static final int CONNECT_TIMEOUT_MILLIS = 5_000;
    private static final int READ_TIMEOUT_MILLIS = 10_000;

    private record CacheEntry(String content, long fetchedAtMillis) {
        boolean isExpired() {
            return Instant.now().toEpochMilli() - fetchedAtMillis > CACHE_TTL_MILLIS;
        }
    }

    private static final ConcurrentHashMap<String, CacheEntry> rawResponseCache = new ConcurrentHashMap<>();

    /**
     * Henter strømpriser fra hvakosterstrommen.no sitt API for valgt region og
     * dato.
     * 
     * @param region Strømregion (NO1-NO5)
     * @param date   Dato (yyyy-MM-dd)
     * @return JSON-respons med priser
     * @throws IOException ved nettverksfeil
     */
    private static String constructUrl(ElectricityRegion.Region region, String date) {
        return String.format(
                "https://www.hvakosterstrommen.no/api/v1/prices/%d/%02d-%02d_%s.json",
                DTFormatter.getYear(date),
                DTFormatter.getMonthValue(date),
                DTFormatter.getDayOfMonth(date),
                region.getRegionNumber());
    }

    private static String makeApiRequest(String urlString) throws IOException {
        URL url = URI.create(urlString).toURL();
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        try {
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(CONNECT_TIMEOUT_MILLIS);
            connection.setReadTimeout(READ_TIMEOUT_MILLIS);

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("Failed to fetch data: HTTP error code " + responseCode);
            }

            StringBuilder content = new StringBuilder();
            try (Scanner scanner = new Scanner(connection.getInputStream(), StandardCharsets.UTF_8)) {
                while (scanner.hasNextLine()) {
                    content.append(scanner.nextLine());
                }
            }

            String body = content.toString().trim();
            if (body.isEmpty()) {
                throw new IOException("No data received from the API.");
            }
            // The upstream price endpoint always answers with a JSON array. Anything
            // else (an error object, an HTML error page) is treated as a failure.
            // Previously this was a `contains("error")` substring scan over the whole
            // payload, which could reject a perfectly valid response.
            if (body.charAt(0) != '[') {
                throw new IOException("Unexpected API response shape (expected a JSON array).");
            }
            return body;
        } finally {
            // Always release the connection, including on the error paths above.
            connection.disconnect();
        }
    }

    /**
     * Drops expired entries, and - if the cache is still at its ceiling - the
     * oldest remaining ones. Called before every insert so the map cannot grow
     * without bound over a long-running process.
     */
    private static void evictStaleCacheEntries() {
        rawResponseCache.values().removeIf(CacheEntry::isExpired);

        while (rawResponseCache.size() >= CACHE_MAX_ENTRIES) {
            String oldestKey = rawResponseCache.entrySet().stream()
                    .min(Comparator.comparingLong(entry -> entry.getValue().fetchedAtMillis()))
                    .map(Map.Entry::getKey)
                    .orElse(null);
            if (oldestKey == null) {
                break;
            }
            rawResponseCache.remove(oldestKey);
        }
    }

    private static String formatApiResponse(ElectricityRegion.Region region, String content) {
        return new JsonFormatter().format(region, content);
    }

    private static String fetchRawContentCached(ElectricityRegion.Region region, String date) throws IOException {
        String cacheKey = region.name() + ":" + date;
        CacheEntry cached = rawResponseCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.content();
        }

        String content = makeApiRequest(constructUrl(region, date));
        evictStaleCacheEntries();
        rawResponseCache.put(cacheKey, new CacheEntry(content, Instant.now().toEpochMilli()));
        return content;
    }

    /**
     * Henter strømpriser for en hel dag i valgt region.
     * 
     * @param region Strømregion (NO1-NO5)
     * @param date   Dato (yyyy-MM-dd)
     * @return JSON-respons med priser
     * @throws IOException ved nettverksfeil
     */
    public static String fetchPricesFromDay(ElectricityRegion.Region region, String date) throws IOException {
        String content = fetchRawContentCached(region, date);
        return formatApiResponse(region, content);
    }

    /**
     * Henter strømpriser for en spesifikk tidsperiode i valgt region.
     * 
     * @param region    Strømregion (NO1-NO5)
     * @param date      Dato (yyyy-MM-dd)
     * @param startHour Starttime (0-23), null for hele dagen
     * @param endHour   Sluttid (0-23), null for hele dagen
     * @return JSON-respons med priser for den spesifikke perioden
     * @throws IOException              ved nettverksfeil
     * @throws IllegalArgumentException ved ugyldige timer
     */
    public static String fetchPricesBetweenHours(ElectricityRegion.Region region, String date, Integer startHour,
            Integer endHour) throws IOException {
        // Sett standardverdier hvis mangler
        if ((startHour == null) && (endHour == null)) {
            return fetchPricesFromDay(region, date);
        }
        if (startHour == null && endHour != null) {
            // Midnight-to-01:00 is a real (and often the cheapest) hour, so an
            // open-ended start must include hour 0 rather than skipping it.
            startHour = 0;
        }
        if (endHour == null && startHour != null) {
            endHour = 24;
        }

        // Valider at tallene er fornuftige
        if (startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24 || startHour >= endHour) {
            throw new IllegalArgumentException("Ugyldige timer: " + startHour + " til " + endHour);
        }

        // Hent rådata
        String rawContent = fetchRawContentCached(region, date);
        JSONArray rawPrices = new JSONArray(rawContent);

        // Filtrer mellom start og end
        JSONArray filtered = new JSONArray();
        for (int i = 0; i < rawPrices.length(); i++) {
            JSONObject entry = rawPrices.getJSONObject(i);
            OffsetDateTime timeStart = OffsetDateTime.parse(entry.getString("time_start"));
            int hour = timeStart.getHour();
            if (hour >= startHour && hour < endHour) {
                filtered.put(entry);
            }
        }

        return new JsonFormatter().format(region, filtered.toString());
    }
}
