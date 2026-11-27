package emilb04.varsel.Controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.concurrent.TimeUnit;
import java.time.format.DateTimeParseException;

import emilb04.varsel.ElectricityRegions.ElectricityRegion;
import emilb04.varsel.ElectricityServices.ElectricityFetcher;

@RestController
@RequestMapping("/api/prices")
public class PriceController {

    // The upstream API only has data from 2021 onwards, and never more than a day
    // ahead. Bounding the range here keeps obviously-bogus dates from turning into
    // outbound requests.
    private static final LocalDate EARLIEST_SUPPORTED_DATE = LocalDate.of(2021, 1, 1);

    private static final ZoneId OSLO = ZoneId.of("Europe/Oslo");

    @GetMapping(value = "/{region}/{date}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getPrices(
            @PathVariable String region,
            @PathVariable String date,
            @RequestParam(required = false) Integer startHour,
            @RequestParam(required = false) Integer endHour
    ) {

        ElectricityRegion.Region reg = parseRegion(region);
        String isoDate = parseDate(date);

        try {
            String json = ElectricityFetcher.fetchPricesBetweenHours(reg, isoDate, startHour, endHour);

            CacheControl cache = startHour == null && endHour == null && !json.contains("\"prices\":[]")
                    ? CacheControl.maxAge(2, TimeUnit.MINUTES).cachePublic()
                    : CacheControl.noStore();
            return ResponseEntity.ok().cacheControl(cache).body(json);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Price provider unavailable", e);
        } catch (IllegalArgumentException e) {
            // Thrown by the fetcher for an invalid start/end hour combination.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Resolves a path segment to a known region, answering 400 instead of letting
     * an unmatched enum name bubble up as a 500.
     */
    private static ElectricityRegion.Region parseRegion(String region) {
        try {
            return ElectricityRegion.Region.valueOf(region.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown region: " + region);
        }
    }

    /**
     * Validates the date path segment as an ISO date within the supported range.
     * The raw value is echoed back rather than any parser internals, so a
     * malformed request cannot leak stack details to the caller.
     */
    private static String parseDate(String date) {
        final LocalDate parsed;
        try {
            parsed = LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Date must be in yyyy-MM-dd format.");
        }

        if (parsed.isBefore(EARLIEST_SUPPORTED_DATE)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No price data exists before " + EARLIEST_SUPPORTED_DATE + ".");
        }
        if (parsed.isAfter(LocalDate.now(OSLO).plusDays(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prices are available up to tomorrow.");
        }
        return parsed.toString();
    }
}
