package emilb04.varsel.ElectricityPrices;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

public class ElectricityPriceService {

    public List<ElectricityPrice> getPricesForToday(String region) throws IOException, InterruptedException {
        LocalDate today = LocalDate.now();
        String year = String.valueOf(today.getYear());
        String monthDay = String.format("%02d-%02d", today.getDayOfMonth(), today.getMonthValue());
        String url = String.format("https://www.hvakosterstrommen.no/api/v1/prices/%s/%s_%s.json", year, monthDay, region);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Java HttpClient")
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        JSONArray prices = new JSONArray(response.body());
        List<ElectricityPrice> result = new ArrayList<>();
        for (int i = 0; i < prices.length(); i++) {
            JSONObject hourData = prices.getJSONObject(i);
            String timeStart = hourData.getString("time_start");
            double nokPerKwh = hourData.getDouble("NOK_per_kWh");
            result.add(new ElectricityPrice(timeStart, nokPerKwh));
        }
        return result;
    }
}