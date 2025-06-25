package emilb04.varsel.ElectricityServices;

import emilb04.varsel.Components.DTFormatter;
import emilb04.varsel.Components.JsonExporter;
import emilb04.varsel.ElectricityRegions.ElectricityRegion;

import java.io.IOException;

public class ElectricityExporterTest {
    public static void main(String[] args) {
        // Choose region:
        ElectricityRegion.Region region = ElectricityRegion.Region.MOSS;

        // Export
        try {
            String prices = ElectricityFetcher.fetchPricesFromDay(region, DTFormatter.getDate());
            String filePath = "src/test/java/emilb04/varsel/ElectricityServices/" + region.getRegionCity()
                    + "_prices.json";
            JsonExporter.exportToFile(prices, filePath);
        } catch (IOException e) {
            System.err.println("Error exporting JSON to file: " + e.getMessage());
        }

        // Export this hour
        try {
            String prices = ElectricityFetcher.fetchPricesBetweenHours(region, DTFormatter.getDate(), 15, 18);
            String filePath = "src/test/java/emilb04/varsel/ElectricityServices/" + region.getRegionCity()
                    + "_prices_hour.json";
            JsonExporter.exportToFile(prices, filePath);

        } catch (IOException e) {
            System.err.println("Error exporting JSON to file: " + e.getMessage());
        }
    }
}
