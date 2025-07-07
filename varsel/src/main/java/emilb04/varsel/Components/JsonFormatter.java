package emilb04.varsel.Components;

import java.time.OffsetDateTime;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import emilb04.varsel.ElectricityRegions.ElectricityRegion;

public class JsonFormatter {

    private final boolean shouldRemoveEurAndExr = true; // Sett til false hvis du vil beholde EUR og EXR-feltene

    /**
     * Formatterer strømpriser og regioninformasjon som JSON.
     * 
     * @param region Region som ElectricityRegion.Region
     * @param prices Strømpriser som String
     * @return JSON-struktur som String
     * @throws IllegalArgumentException hvis JSON-strukturen er ugyldig
     */
    public String format(ElectricityRegion.Region region, String prices) {
        try {
            JSONObject json = new JSONObject();
            json.put("regionNumber", region.getRegionNumber());
            json.put("regionCity", region.getRegionCity());
            json.put("regionArea", region.getRegionArea());
            json.put("prices", formatPrices(prices)); // Bruk faktisk JSONArray

            // Valider struktur
            if (!json.has("regionNumber") || !json.has("regionCity") || !json.has("regionArea")
                    || !json.has("prices")) {
                throw new IllegalArgumentException("JSON-strukturen mangler nødvendige felt.");
            }

            return json.toString(4); // Pretty print med 4 mellomrom
        } catch (JSONException e) {
            throw new IllegalArgumentException("Ugyldig JSON-struktur: " + e.getMessage(), e);
        }
    }

    /**
     * Konverterer strømpris-streng til formatert JSONArray.
     * 
     * @param prices JSON-array som streng (typisk hentet fra API)
     * @return JSONArray med prisobjekter
     * @throws IllegalArgumentException ved ugyldig format
     */
    public JSONArray formatPrices(String prices) {
        try {
            if (prices.startsWith("\"") && prices.endsWith("\"")) {
                prices = prices.substring(1, prices.length() - 1)
                        .replace("\\\"", "\"");
            }

            JSONArray priceArray = new JSONArray(prices);

            if (shouldRemoveEurAndExr) {
                removeFieldsFromPrices(priceArray, "EUR_per_kWh");
                removeFieldsFromPrices(priceArray, "EXR");
            }
            formatPriceDateFields(priceArray);

            return priceArray;
        } catch (JSONException e) {
            throw new IllegalArgumentException("Ugyldig pris-JSON: " + e.getMessage(), e);
        }
    }

    private void removeFieldsFromPrices(JSONArray priceArray, String... fields) {
        for (int i = 0; i < priceArray.length(); i++) {
            JSONObject priceObject = priceArray.getJSONObject(i);
            for (String field : fields) {
                priceObject.remove(field);
            }
        }
    }

    private void formatPriceDateFields(JSONArray priceArray) {
        for (int i = 0; i < priceArray.length(); i++) {
            JSONObject price = priceArray.getJSONObject(i);

            if (price.has("time_start")) {
                String isoStart = price.getString("time_start");
                OffsetDateTime odtStart = OffsetDateTime.parse(isoStart);
                price.put("time_start", DTFormatter.formatDateTime(odtStart.toLocalDateTime()));
            }

            if (price.has("time_end")) {
                String isoEnd = price.getString("time_end");
                OffsetDateTime odtEnd = OffsetDateTime.parse(isoEnd);
                price.put("time_end", DTFormatter.formatDateTime(odtEnd.toLocalDateTime()));
            }
        }
    }
}