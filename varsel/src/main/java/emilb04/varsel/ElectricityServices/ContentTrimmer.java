package emilb04.varsel.ElectricityServices;

import org.json.JSONObject;

public class ContentTrimmer {

    /**
     * Trimmer og formaterer JSON-innhold ved å fjerne unødvendige felt som EUR og EXR.
     * @param jsonContent JSON-struktur som String
     * @return Trimmet og formatert JSON-struktur som String
     */
    public static String trimContent(String jsonContent) {
        String rawJson = jsonContent;

        // Parse JSON-strukturen
        JSONObject jsonObject = new JSONObject(rawJson);
        // Fjern unødvendige felt
        jsonObject.remove("EUR");
        // Fjern unødvendige felt i "prices" arrayet
        if (jsonObject.has("prices")) {
            jsonObject.getJSONArray("prices").forEach(item -> {
                JSONObject priceItem = (JSONObject) item;
                priceItem.remove("EUR");
            });
        }


        // Returner den trimmede JSON-strukturen som String
        return jsonObject.toString(4); // 4 er antall mellomrom for innrykk
    }
}
