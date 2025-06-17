package emilb04.varsel.ElectricityPrices;

public class ElectricityPrice {
    private final String timeStart;
    private final String timeEnd;
    private final double nokPerKwh;

    public ElectricityPrice(String timeStart, String timeEnd, double nokPerKwh) {
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.nokPerKwh = nokPerKwh;
    }

    public String getTimeStart() {
        return timeStart;
    }
    public String getTimeEnd() {
        return timeEnd;
    }

    public double getNokPerKwh() {
        return nokPerKwh;
    }
}