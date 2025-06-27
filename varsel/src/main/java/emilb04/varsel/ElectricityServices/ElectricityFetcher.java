package emilb04.varsel.ElectricityServices;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.time.OffsetDateTime;
import java.util.Scanner;

import org.json.JSONArray;
import org.json.JSONObject;

import emilb04.varsel.Components.DTFormatter;
import emilb04.varsel.Components.JsonFormatter;
import emilb04.varsel.ElectricityRegions.ElectricityRegion;

public class ElectricityFetcher {
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
        connection.setRequestMethod("GET");

        int responseCode = connection.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new IOException("Failed to fetch data: HTTP error code " + responseCode);
        }

        StringBuilder content = new StringBuilder();
        try (Scanner scanner = new Scanner(connection.getInputStream())) {
            while (scanner.hasNextLine()) {
                content.append(scanner.nextLine());
            }
        }
        connection.disconnect();

        if (content.isEmpty()) {
            throw new IOException("No data received from the API.");
        } else if (content.toString().contains("error")) {
            throw new IOException("Error in API response: " + content);
        }
        return content.toString();
    }

    private static String formatApiResponse(ElectricityRegion.Region region, String content) {
        return new JsonFormatter().format(region, content);
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
        String urlString = constructUrl(region, date);
        String content = makeApiRequest(urlString);
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
            startHour = 01;
        }
        if (endHour == null && startHour != null) {
            endHour = 24;
        }

        // Valider at tallene er fornuftige
        if (startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24 || startHour >= endHour) {
            throw new IllegalArgumentException("Ugyldige timer: " + startHour + " til " + endHour);
        }

        // Hent rådata
        String urlString = constructUrl(region, date);
        String rawContent = makeApiRequest(urlString);
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
