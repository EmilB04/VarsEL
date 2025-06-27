package emilb04.varsel.Controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.io.IOException;

import emilb04.varsel.ElectricityRegions.ElectricityRegion;
import emilb04.varsel.ElectricityServices.ElectricityFetcher;

@RestController
@RequestMapping("/api/prices")
public class PriceController {

    @GetMapping("/{region}/{date}")
    public ResponseEntity<String> getPrices(
            @PathVariable String region,
            @PathVariable String date,
            @RequestParam(required = false) Integer startHour,
            @RequestParam(required = false) Integer endHour
    ) throws IOException {

        ElectricityRegion.Region reg = ElectricityRegion.Region.valueOf(region.toUpperCase());
        String json = (startHour != null && endHour != null)
                ? ElectricityFetcher.fetchPricesBetweenHours(reg, date, startHour, endHour)
                : ElectricityFetcher.fetchPricesFromDay(reg, date);

        return ResponseEntity.ok(json);
    }
}
