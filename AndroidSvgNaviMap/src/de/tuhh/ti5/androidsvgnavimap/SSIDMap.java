package de.tuhh.ti5.androidsvgnavimap;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Scanner;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import android.util.Log;

/**
 * Maps a list of complete scans to a room (ID). Data can be read to and read
 * from arff file.
 * 
 * Created by mkaay on 3/9/14. Corrected by Ohrt on 06/24/14.
 */
public class SSIDMap {
	private Map<Integer, List<CompleteScanResult>> ssidMap = new TreeMap<Integer, List<CompleteScanResult>>();
	private String LOGTAG = "SSIDMap";
	private final static String DEFAULT_RELATION_NAME = "tm450";
	private final static String DEFAULT_ROOM_PREFIX = "";

	private void addScanResult(int roomId, List<CompleteScanResult> scanResults) {

		List<CompleteScanResult> existing = ssidMap.get(roomId);
		if (existing != null) {
			scanResults.addAll(existing);
		}

		ssidMap.put(roomId, scanResults);
	}

	public void addScanResult(int nodeid, CompleteScanResult singleScanResult) {
		List<CompleteScanResult> scanResults = new ArrayList<CompleteScanResult>();
		scanResults.add(singleScanResult);
		addScanResult(nodeid, scanResults);
	}

	public void clearScanResults() {
		ssidMap.clear();
	}

	/**
	 * Clears all scans, then reads scans from arffFile.
	 * 
	 * @param arffFile
	 * @throws IOException
	 */
	public void readFromFile(File arffFile) throws IOException {
		List<String> lines = new ArrayList<String>();// =
														// FileUtils.readLines(arffFile);
		Scanner s = new Scanner(arffFile);
		while (s.hasNextLine()) {
			lines.add(s.nextLine());
		}
		Log.i(LOGTAG, "reading " + arffFile.getName() + " with " + lines.size()
				+ " lines.");
		clearScanResults();
		for (String line : lines) {
			if (line.length() == 0)
				continue;
			if (line.contains("@")) {
				if (line.contains("@relation")) {

					if (line.substring(line.indexOf('n') + 2).trim()
							.equalsIgnoreCase(DEFAULT_RELATION_NAME)) {
						Log.i(LOGTAG, "Reading default relation: "
								+ DEFAULT_RELATION_NAME);
					} else {
						Log.w(LOGTAG,
								"Cannot read "
										+ arffFile
										+ ". Only reading default relation is supported.");
						return;
					}
				}
			} else {

				String roomName = line.substring(line.lastIndexOf(',') + 2);
				int roomId = 0;
				try {
					roomId = Integer.parseInt(roomName
							.substring(DEFAULT_ROOM_PREFIX.length()));
				} catch (NumberFormatException nfe) {
					Log.e(LOGTAG, "Room/Vertex/Label has unsupported format: "
							+ roomName + ". Fix arff file.");
					return;
				}
				// logger.debug("Found one class label - "+classLabel);

				CompleteScanResult completeScanResult = new CompleteScanResult();

				String BSSIDParesString = line.substring(line.indexOf('"') + 1,
						line.lastIndexOf('"'));
				String[] bssidStrengthMapList = BSSIDParesString.split("\\\\n");
				for (String bssidStrengthItem : bssidStrengthMapList) {
					if (bssidStrengthItem.length() == 0)
						continue;
					String bssidLabel = bssidStrengthItem.substring(0,
							bssidStrengthItem.indexOf(','));
					int bssidStrengh = Integer.parseInt(bssidStrengthItem
							.substring(bssidStrengthItem.indexOf(',') + 1));
					// instance.put(BSSIDLabel, BSSIDStrengh);

					completeScanResult.add(bssidLabel, bssidStrengh);

					// logger.debug("Found BSSID - "+BSSIDLabel+" and the strength is "+BSSIDStrengh);
				}

				addScanResult(roomId, completeScanResult);
				// Log.i(LOGTAG, "reading.. scan for " + roomName+ ": " +
				// completeScanResult.toString());
			}

		}
		Log.i(LOGTAG, "reading.. success: " + this.toString());
	}

	@Override
	public String toString() {
		int scanCount = 0;
		for (Entry<Integer, List<CompleteScanResult>> entry : ssidMap
				.entrySet()) {
			scanCount += entry.getValue().size();
		}
		String s = "SSIDMap: " + ssidMap.size() + " rooms with " + scanCount
				+ " scans";
		return s;
	}

	public void saveToFile(File arffFile) throws IOException {
		Set<String> bssids = new TreeSet<String>();

		Log.i(LOGTAG,
				"saving " + arffFile.getName() + " with " + ssidMap.size()
						+ " rooms.");

		for (Map.Entry<Integer, List<CompleteScanResult>> entry : ssidMap
				.entrySet()) {
			for (CompleteScanResult result : entry.getValue()) {
				Map<String, Integer> map = result.getScanData();
				for (Entry<String, Integer> entry2 : map.entrySet()) {
					String bssid = entry2.getKey();
					// Log.v(LOGTAG, "adding bssid: " + bssid);
					bssids.add(bssid);
				}

			}
		}

		PrintWriter writer = new PrintWriter(new BufferedWriter(new FileWriter(
				arffFile), 1024));

		writer.println("@relation " + DEFAULT_RELATION_NAME);
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
			writer.print(String.format(DEFAULT_ROOM_PREFIX + "%d,", room));
		}
		writer.println("unknown}");
		writer.println();
		writer.println("@data");
		writer.println();

		for (Map.Entry<Integer, List<CompleteScanResult>> entry : ssidMap
				.entrySet()) {
			Log.i(LOGTAG, "saving.. adding " + entry.getValue().size()
					+ " scans for room " + entry.getKey());

			for (CompleteScanResult result : entry.getValue()) {

				writer.print("0,\"");

				Map<String, Integer> map = result.getScanData();
				for (Entry<String, Integer> entry2 : map.entrySet()) {
					String bssid = entry2.getKey();
					int level = entry2.getValue();

					writer.print(bssid);
					writer.print(",");
					writer.print(Math.abs(level));
					writer.print("\\n");
				}

				writer.print('"');
				writer.print(", " + DEFAULT_ROOM_PREFIX);
				writer.print(entry.getKey());
				writer.println();
			}

		}

		writer.close();

		// Log.v(LOGTAG, new Scanner(arffFile).useDelimiter("\\A").next());
	}

}
