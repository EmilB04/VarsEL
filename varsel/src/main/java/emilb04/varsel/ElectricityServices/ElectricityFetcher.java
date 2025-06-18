package emilb04.varsel.ElectricityServices;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Scanner;

import emilb04.varsel.ElectricityRegions.ElectricityRegion;

public class ElectricityFetcher {
    /**
     * Henter strømpriser fra hvakosterstrommen.no sitt API for valgt region og dato.
     * @param region Strømregion (NO1-NO5)
     * @param date Dato (yyyy-MM-dd)
     * @return JSON-respons med priser
     * @throws IOException ved nettverksfeil
     */
    public static String fetchPrices(ElectricityRegion.Region region, LocalDate date) throws IOException {
        String urlString = String.format(
            "https://www.hvakosterstrommen.no/api/v1/prices/%d/%02d-%02d_%s.json",
            date.getYear(), date.getMonthValue(), date.getDayOfMonth(), region.getRegionNumber()
        );
        URL url = URI.create(urlString).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.connect();

        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            throw new IOException("Failed to fetch prices: HTTP " + responseCode);
        }

        StringBuilder json = new StringBuilder();
        try (Scanner scanner = new Scanner(conn.getInputStream())) {
            while (scanner.hasNextLine()) {
                json.append(scanner.nextLine()).append(System.lineSeparator());
            }
        }

        LocalDateTime now = LocalDateTime.now();
        String formattedDate = DTFormatter.formatDate(now.toLocalDate());
        String formattedTime = DTFormatter.formatTime(now.toLocalTime());

        // Legg til formaterte dato- og tidsverdier i responsen for logging eller videre bruk
        json.append("Hentet: ").append(formattedDate).append(" ").append(formattedTime).append(System.lineSeparator());

        return json.toString();
    }
}
