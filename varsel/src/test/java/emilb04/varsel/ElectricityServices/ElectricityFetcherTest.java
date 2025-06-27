package emilb04.varsel.ElectricityServices;

import emilb04.varsel.Components.DTFormatter;
import emilb04.varsel.ElectricityRegions.ElectricityRegion;

import java.io.IOException;

public class ElectricityFetcherTest {
    public static void main(String[] args) {
        // Choose region:
        ElectricityRegion.Region region = ElectricityRegion.Region.MOSS;

        // Try getting prices for the specified period and region
        try {
            String prices = ElectricityFetcher.fetchPricesFromDay(region, DTFormatter.getDate());
            System.out.println(prices);
        } catch (IOException e) {
            System.err.println("Error fetching prices: " + e.getMessage());
        }

        // Try getting prices for a specific hour range
        try {
            String prices = ElectricityFetcher.fetchPricesBetweenHours(region, DTFormatter.getDate(), 15, null);
            System.out.println(prices);
        } catch (IOException e) {
            System.err.println("Error fetching prices for specific hours: " + e.getMessage());
        }
    }
}
