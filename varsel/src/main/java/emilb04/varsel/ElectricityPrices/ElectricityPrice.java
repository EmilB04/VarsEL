package emilb04.varsel.ElectricityPrices;

public class ElectricityPrice {
    private final String timeStart;
    private final double nokPerKwh;

    public ElectricityPrice(String timeStart, double nokPerKwh) {
        this.timeStart = timeStart;
        this.nokPerKwh = nokPerKwh;
    }

    public String getTimeStart() {
        return timeStart;
    }

    public double getNokPerKwh() {
        return nokPerKwh;
    }

    public String getFormattedTimeStart() {
        // Assumes timeStart is in ISO 8601 format, e.g., "2024-06-10T14:00:00Z"
        String cleaned = timeStart.replace("T", " ").replace("Z", "");   // remove 'T' and 'Z'
        String[] parts = cleaned.split(" ");                                                             // split into date and time
        String date = parts[0]; // date part is the first element                                              // time part is the second element
        String time = parts.length > 1 ? parts[1] : "";                                                        // if no time part, use empty string
        String[] dateParts = date.split("-");                                                            // split date into year, month, day
        if (dateParts.length == 3) {
            // Format: dd.mm.yyyy
            return String.format("%s.%s.%s %s", dateParts[2], dateParts[1], dateParts[0], time).trim();
        }
        return cleaned;
    }

    @Override
    public String toString() {
        return "Tid: " + getFormattedTimeStart() + ", Pris: " + nokPerKwh + " NOK/kWh";
    }
}