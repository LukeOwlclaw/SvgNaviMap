package de.tuhh.ti5.androidsvgnavimap;

import android.net.wifi.ScanResult;
import android.util.Log;

import com.google.common.base.Joiner;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Created by mkaay on 3/9/14.
 */
public class SSIDMap {
    private Map<Integer, List<ScanResult>> ssidMap = new TreeMap<Integer, List<ScanResult>>();
    private String LOGTAG = "SSIDMap";

    public void addScanResult(int roomId, List<ScanResult> scanResults) {
        ssidMap.put(roomId, scanResults);
        Log.i(LOGTAG, String.format("%d", ssidMap.size()));
    }

    public void clear() {
        ssidMap.clear();
    }

    public void saveToFile(File arffFile) throws IOException {
        Set<String> bssids = new TreeSet<String>();

        for (Map.Entry<Integer, List<ScanResult>> entry : ssidMap.entrySet()) {
            for (ScanResult result : entry.getValue()) {
                Log.i(LOGTAG, result.BSSID);
                bssids.add(result.BSSID);
            }
        }

        PrintWriter writer = new PrintWriter(new BufferedWriter(new FileWriter(arffFile), 1024));

        writer.println("@relation tm450");
        writer.println();
        writer.println("@attribute bag relational");
        writer.println("@attribute userid {0,}");
        writer.print("@attribute BSSID {");
        for (String bssid : bssids) {
            writer.print(bssid + ",");
        }
        writer.println("}");
        writer.println();
        writer.println("@attribute RSSI integer [0,100]");
        writer.println("@end bag");
        writer.println();
        writer.print("@attribute ROOM {");
        for (int room : ssidMap.keySet()) {
            writer.print(String.format("vertex_%d,", room));
        }
        writer.println("unknown}");
        writer.println();
        writer.println("@data");
        writer.println();

        for (Map.Entry<Integer, List<ScanResult>> entry : ssidMap.entrySet()) {
            writer.print("0,\"");
            for (ScanResult result : entry.getValue()) {
                writer.print(result.BSSID);
                writer.print(",");
                writer.print(Math.abs(result.level));
                writer.print("\\n");
            }
            writer.print('"');
            writer.print(", vertex_");
            writer.print(entry.getKey());
            writer.println();
        }

        writer.close();

        Log.i(LOGTAG, new Scanner(arffFile).useDelimiter("\\A").next());
    }

    // @TODO: implement readFromFile
}
