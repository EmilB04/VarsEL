package emilb04.varsel.ElectricityServices;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

import org.json.JSONArray;
import org.json.JSONObject;

import emilb04.varsel.Components.JsonFormatter;
import emilb04.varsel.ElectricityRegions.ElectricityRegion;

public class ElectricityFetcher {

    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final int CACHE_MAX_ENTRIES = 256;
    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(4))
            .build();

    private record CacheEntry(String content, long fetchedAtNanos) {
        boolean isFresh() {
            return System.nanoTime() - fetchedAtNanos < CACHE_TTL.toNanos();
        }
    }

    // Lock only for cache reads and writes. Unrelated areas can load in parallel.
    private static final LinkedHashMap<String, CacheEntry> rawResponseCache =
            new LinkedHashMap<>(32, 0.75f, true);
    private static final ConcurrentHashMap<String, FutureTask<String>> inFlight = new ConcurrentHashMap<>();

    private static String loadDay(String area, LocalDate date) throws IOException, InterruptedException {
        URI uri = URI.create("https://www.hvakosterstrommen.no/api/v1/prices/%d/%02d-%02d_%s.json"
                .formatted(date.getYear(), date.getMonthValue(), date.getDayOfMonth(), area));
        HttpRequest request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(12)).GET().build();
        HttpResponse<String> response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IOException("Price provider returned HTTP " + response.statusCode());
        }
        String body = response.body().strip();
        if (!body.startsWith("[")) {
            throw new IOException("Price provider returned an unexpected response");
        }
        return body;
    }

    private static String cachedDay(String key) {
        synchronized (rawResponseCache) {
            CacheEntry cached = rawResponseCache.get(key);
            return cached != null && cached.isFresh() ? cached.content() : null;
        }
    }

    private static String fetchRawContentCached(ElectricityRegion.Region region, String date) throws IOException {
        String area = region.getRegionNumber();
        String key = area + ":" + date;
        String cached = cachedDay(key);
        if (cached != null) {
            return cached;
        }

        // City aliases share the same upstream prices. The response formatter
        // still receives the original region so the API keeps its city metadata.
        FutureTask<String> newRequest = new FutureTask<>(() -> {
            String latest = cachedDay(key);
            if (latest != null) {
                return latest;
            }
            String body = loadDay(area, LocalDate.parse(date));
            if (!new JSONArray(body).isEmpty()) {
                synchronized (rawResponseCache) {
                    rawResponseCache.put(key, new CacheEntry(body, System.nanoTime()));
                    if (rawResponseCache.size() > CACHE_MAX_ENTRIES) {
                        rawResponseCache.pollFirstEntry();
                    }
                }
            }
            return body;
        });
        FutureTask<String> activeRequest = inFlight.putIfAbsent(key, newRequest);
        try {
            if (activeRequest == null) {
                newRequest.run();
            }
            return (activeRequest == null ? newRequest : activeRequest).get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Price request interrupted", e);
        } catch (ExecutionException e) {
            throw new IOException("Could not load prices", e.getCause());
        } finally {
            if (activeRequest == null) {
                inFlight.remove(key, newRequest);
            }
        }
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
        return new JsonFormatter().format(region, content);
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

        if (startHour == 0 && endHour == 24) {
            return fetchPricesFromDay(region, date);
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
