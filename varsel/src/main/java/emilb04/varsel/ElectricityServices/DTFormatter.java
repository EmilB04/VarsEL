package emilb04.varsel.ElectricityServices;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DTFormatter {
    /**
    * Custom date and time formatter for the Norwegian locale.
    @param date The date to format.
    @param time The time to format.
    @param dateTime The date and time to format.
    @return Formatted date, time, or date and time as a string.
    */
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy").withLocale(Locale.forLanguageTag("no-NO"));
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm").withLocale(Locale.forLanguageTag("no-NO"));
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").withLocale(Locale.forLanguageTag("no-NO"));

    public static String formatDate(LocalDate date) {
        return date.format(DATE_FORMAT);
    }

    public static String formatTime(LocalTime time) {
        return time.format(TIME_FORMAT);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DATETIME_FORMAT);
    }
}
