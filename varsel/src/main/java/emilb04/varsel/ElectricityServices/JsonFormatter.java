package emilb04.varsel.ElectricityServices;

import org.json.JSONObject;

import emilb04.varsel.ElectricityRegions.ElectricityRegion;

public class JsonFormatter {

    /**
     * Formatterer strømpriser og regioninformasjon som JSON.
     * @param region Region som ElectricityRegion.Region
     * @param prices Strømpriser som String
     * @return JSON-struktur som String
     */
    public static String formatAsJson(ElectricityRegion.Region region, String prices) {
        JSONObject json = new JSONObject();
        json.put("regionNumber", region.getRegionNumber());
        json.put("regionCity", region.getRegionCity());
        json.put("regionArea", region.getRegionArea());
        json.put("prices", prices);
        return json.toString(4); // Pretty print med 4 mellomrom
    }
}
