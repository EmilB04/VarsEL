package emilb04.varsel.ElectricityServices;

import org.json.JSONObject;

public class ContentTrimmer {

    /**
     * Trimmer og formaterer JSON-innhold ved å fjerne unødvendige felt som EUR og EXR.
     * @param jsonContent JSON-struktur som String
     * @return Trimmet og formatert JSON-struktur som String
     */
    public static String trimContent(String jsonContent) {
        JSONObject json = new JSONObject(jsonContent);
        JSONObject trimmedJson = new JSONObject();

        // Beholder kun relevante felt
        trimmedJson.put("NOK_per_kWh", json.getDouble("NOK_per_kWh"));
        trimmedJson.put("time_start", json.getString("time_start"));
        trimmedJson.put("time_end", json.getString("time_end"));

        return trimmedJson.toString(4); // Pretty print med 4 mellomrom
    }
}
