package emilb04.varsel.ElectricityServices;

import java.time.LocalDate;

import org.json.JSONObject;

import emilb04.varsel.ElectricityRegions.ElectricityRegion;

public class ElectricityFetcherTest {
    public static void main(String[] args) {
        try {
            ElectricityRegion.Region region = ElectricityRegion.Region.MOSS;
            String prices = ElectricityFetcher.fetchPrices(region, LocalDate.now());

            // Validerer JSON-strukturen før trimming
            if (isValidJson(prices)) {
                String output = ContentTrimmer.trimContent(prices);
                System.out.println(output);
            } else {
                String output = JsonFormatter.formatAsJson(region, prices);
                System.err.println("Ugyldig JSON-struktur mottatt: " + output);
            }
        } catch (IllegalArgumentException | java.io.IOException e) {
            System.err.println(e.getMessage());
        }
    }

    private static boolean isValidJson(String json) {
        try {
            new JSONObject(json);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
