package emilb04.varsel.ElectricityPrices;

import java.io.IOException;
import java.util.List;

public class GetElectricityPrices {

    public static void main(String[] args) {
        ElectricityPriceService service = new ElectricityPriceService();
        try {
            List<ElectricityPrice> prices = service.getPricesForToday("NO1");
            prices.forEach(System.out::println);
        } catch (IOException | InterruptedException e) {
            System.err.println("Klarte ikke hente strømpriser: " + e.getMessage());
        }
    }
}