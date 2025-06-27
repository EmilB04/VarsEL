package emilb04.varsel.Components;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DTFormatter {
    /*
     *  This class provides methods to format dates and times in the Norwegian locale.
     *  It uses the DateTimeFormatter class to create formatters for date, time, and datetime.
     *  The date format is "dd.MM.yyyy", the time format is "HH:mm", and the datetime format is "dd.MM.yyyy HH:mm".
     *  The formatters are set to use the Norwegian locale (no-NO) to ensure correct formatting for Norwegian dates and times.
     */
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy").withLocale(Locale.forLanguageTag("no-NO"));
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm").withLocale(Locale.forLanguageTag("no-NO"));
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").withLocale(Locale.forLanguageTag("no-NO"));

    public static String formatDate(LocalDate date) {
        return date.format(DATE_FORMAT);
    }
    public static LocalDate formatDate(String date) {
        return LocalDate.parse(date, DATE_FORMAT);
    }
    public static String formatTime(LocalTime time) {
        return time.format(TIME_FORMAT);
    }
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DATETIME_FORMAT);
    }
    public static String getDate() {
        return formatDate(LocalDate.now());
    }
    public static String getTime() {
        return formatTime(LocalTime.now());
    }
    public static String getDateTime() {
        return formatDateTime(LocalDateTime.now());
    }
    public static int getYear() {
        return LocalDate.now().getYear();
    }
    public static int getMonthValue() {
        return LocalDate.now().getMonthValue();
    }
    public static int getDayOfMonth() {
        return LocalDate.now().getDayOfMonth();
    }
    public static int getHour() {
        return LocalTime.now().getHour();
    }
    public static int getMinute() {
        return LocalTime.now().getMinute();
    }

    public static String getNextDay() {
        return formatDate(LocalDate.now().plusDays(1));
    }
}
