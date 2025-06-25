package emilb04.varsel.Components;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

public class JsonExporter {

    /**
     * Eksporterer JSON-struktur til fil.
     * @param jsonStr JSON-streng som skal eksporteres
     * @param filePath Filsti der JSON-strengen skal lagres
     * @throws IOException ved feil under skriving til fil
     */
    public static void exportToFile(String jsonStr, String filePath) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            writer.write(jsonStr);
        }
        System.out.println("JSON data exported to " + filePath);
    }
}
