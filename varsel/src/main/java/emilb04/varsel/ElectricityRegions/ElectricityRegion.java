package emilb04.varsel.ElectricityRegions;

public class ElectricityRegion {
    public enum Region {
        NO1("NO1", "Oslo", "Øst-Norge"),
        NO2("NO2", "Kristiansand", "Sør-Norge"),
        NO3("NO3", "Trondheim", "Midt-Norge"),
        NO4("NO4", "Tromsø", "Nord-Norge"),
        NO5("NO5", "Bergen", "Vest-Norge"),
        ARENDAL("NO2", "Arendal", "Sør-Norge"),
        BODO("NO4", "Bodø", "Nord-Norge"),
        DRAMMEN("NO1", "Drammen", "Øst-Norge"),
        FREDRIKSTAD("NO1", "Fredrikstad", "Øst-Norge"),
        HAUGESUND("NO2", "Haugesund", "Sør-Norge"),
        MOSS("NO1", "Moss", "Øst-Norge"),
        PORSGRUNN("NO2", "Porsgrunn", "Sør-Norge"),
        SANDEFJORD("NO2", "Sandefjord", "Sør-Norge"),
        STAVANGER("NO2", "Stavanger", "Sør-Norge"),
        TONSBERG("NO2", "Tønsberg", "Sør-Norge"),
        ALESUND("NO3", "Ålesund", "Midt-Norge");

        private final String regionNumber;
        private final String regionCity;
        private final String regionArea;

        Region(String regionNumber, String regionCity, String regionArea) {
            this.regionNumber = regionNumber;
            this.regionCity = regionCity;
            this.regionArea = regionArea;
        }

        public String getRegionNumber() {
            return regionNumber;
        }

        public String getRegionCity() {
            return regionCity;
        }

        public String getRegionArea() {
            return regionArea;
        }
    }
}
