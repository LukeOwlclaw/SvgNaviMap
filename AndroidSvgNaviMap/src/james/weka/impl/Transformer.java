package james.weka.impl;

import james.weka.exception.InitializationException;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.io.FileUtils;

import de.tuhh.ti5.androidsvgnavimap.Logger;

/**
 * This class transform ARFF files.
 * 
 * Input: ARFF in "bag relational" format (for example check out:
 * rssi/rssi.arff)
 * 
 * Output: "flattened ARFF file" (example: rssi/sample_flattened.arff)
 * 
 * Only flattened ARFF file can be used by algorithms used by WifiLocate.
 * 
 */
public class Transformer {

	private List<String> BSSIDList;

	private List<String> BSSIDListCopy;

	private Set<String> BSSIDSet;

	private List<Map<String, String>> instancesList;

	private Set<String> roomSet;

	private String relation;

	private InstanceParser instanceParser;

	private int missingValue = 0;

	private int testDataPct = 0;
	//
	// private Map<String,Integer> numPerClass;
	//
	// private int totalInstance;
	//
	// private Map<String,Double> pctPerClass;

	public static String CLASS_LABEL = "classLabel";

	// private static //logger //logger =
	// //loggerFactory.get//logger(Transformer.class);

	public Transformer() {
		ini();
		BSSIDListCopy = new ArrayList<String>();// we want to persist a list of
												// bssid for the undergoing
												// transform
	}

	private void ini() {
		// This function gerantees that the transformer can keep make new
		// transformation without making new instance.
		BSSIDList = new ArrayList<String>();
		instancesList = new ArrayList<Map<String, String>>();
		BSSIDSet = new HashSet<String>();
		roomSet = new HashSet<String>();
		relation = "";
		// numPerClass = new HashMap<String,Integer>();
		// pctPerClass = new HashMap<String,Double>();
	}

	/**
	 * Neet to be called before transform, otherwise the list is empty
	 * 
	 * @return
	 */
	public List<String> getBSSIDList() {
		BSSIDListCopy.clear();
		BSSIDListCopy.addAll(BSSIDSet);
		return BSSIDListCopy;
	}

	public void readFile(File inputDataFile) throws Exception {
		if (inputDataFile.isDirectory()) {
			List<File> fileList = (List<File>) FileUtils.listFiles(
					inputDataFile, new String[] { "arff" }, true);
			for (File file : fileList) {
				parseSingleArffFile(file);
			}
		} else {
			parseSingleArffFile(inputDataFile);
		}
	}

	private void parseSingleArffFile(File arffFile) throws Exception {
		List<String> lines = FileUtils.readLines(arffFile);
		for (String line : lines) {
			if (line.trim().length() == 0)
				continue;
			if (line.trim().startsWith("@")) {
				if (line.contains("@relation")) {
					if (relation.equalsIgnoreCase("_"
							+ line.substring(line.indexOf('n') + 2))) {
						// logger.debug("Fine same relation, relation not changed.");
					} else {
						relation += ("_" + line
								.substring(line.indexOf('n') + 2));
					}
					// logger.debug("The relation has been set to - "+relation);
				} else if (line.contains("BSSID")) {
					int posLastComma = line.lastIndexOf(',');
					if (posLastComma == -1) {
						Logger.w("Empty BSSID list found in arff file.");
						continue;
					}
					String BSSIDString = line.substring(line.indexOf('{') + 1,
							posLastComma);
					String[] BSSIDs = BSSIDString.split(",");
					for (String BSSID : BSSIDs) {
						BSSIDSet.add(BSSID);
						// logger.debug("Found a BSSID - "+BSSID);
					}
				} else if (line.contains("ROOM")) {
					String roomString = line.substring(line.indexOf('{') + 1,
							line.lastIndexOf('}'));
					String[] rooms = roomString.split(",");
					for (String room : rooms) {
						roomSet.add(room);
						// logger.debug("Found a room - "+room);
					}
				}
			} else {
				Map<String, String> instance = new HashMap<String, String>();

				String classLabel = line.substring(line.lastIndexOf(',') + 1).trim();
				instance.put(CLASS_LABEL, classLabel);
				// logger.debug("Found one class label - "+classLabel);

				String BSSIDParesString = line.substring(line.indexOf('"') + 1,
						line.lastIndexOf('"'));
				String[] BSSIDPares = BSSIDParesString.split("\\\\n");
				for (String BSSIDPare : BSSIDPares) {
					if (BSSIDPare.length() == 0)
						continue;
					String BSSIDLabel = BSSIDPare.substring(0,
							BSSIDPare.indexOf(','));
					String BSSIDStrengh = BSSIDPare.substring(BSSIDPare
							.indexOf(',') + 1);
					instance.put(BSSIDLabel, BSSIDStrengh);
					// logger.debug("Found BSSID - "+BSSIDLabel+" and the strength is "+BSSIDStrengh);
				}
				instancesList.add(instance);
			}

		}
		// logger.debug("EOF");
	}

	/**
	 * Transform the original data format into new format and ouput to file,
	 * optionally a test data file can be generated according to the
	 * testDataPercentage.
	 * 
	 * @param outputDataFile
	 *            the file with new format training data
	 * @param testDataFile
	 *            the file with new formate testing data (optional)
	 * @throws Exception
	 */
	public void transform(File outputDataFile, File... testDataFile)
			throws Exception {
		if (BSSIDSet.isEmpty()) {
			throw new InitializationException("No input data...");
		}
		BSSIDList.addAll(BSSIDSet);
		instanceParser = new InstanceParser(BSSIDList);
		instanceParser.setMissingValue(missingValue);

		// get statistic about each class, used to generate same potion of test
		// data per class
		// totalInstance = instancesList.size();
		// logger.info("The total number of instance is "+ totalInstance);
		// for(Map<String,String> instance:instancesList){
		// if(numPerClass.containsKey(instance.get(CLASS_LABEL))){
		// numPerClass.put(instance.get(CLASS_LABEL),
		// numPerClass.get(instance.get(CLASS_LABEL))+1);
		// }else{
		// numPerClass.put(instance.get(CLASS_LABEL), 0);
		// }
		// }
		// for(String room :numPerClass.keySet()){
		// pctPerClass.put(room, (double)testDataPct /100d *
		// numPerClass.get(room));
		// }
		// for(String room:numPerClass.keySet()){
		// //logger.debug("The number of instance of room : "+
		// room+" is "+numPerClass.get(room));
		// //logger.debug("The pct of test data of instance of room : "+
		// room+" is "+pctPerClass.get(room));
		// }

		List<String> outputDataLines = new ArrayList<String>();
		List<String> outputTestDataLines = new ArrayList<String>();
		outputDataLines.add("@relation " + relation);
		outputDataLines.add("");
		for (String BSSID : BSSIDList) {
			outputDataLines.add("@attribute " + BSSID + " integer");
		}
		outputDataLines.add("");
		StringBuffer roomAtrributes = new StringBuffer("@attribute ROOM {");
		for (String room : roomSet) {
			roomAtrributes.append(room + ",");
		}
		roomAtrributes.append("}");
		outputDataLines.add(roomAtrributes.toString());
		outputDataLines.add("");
		outputDataLines.add("@data");
		outputDataLines.add("");
		outputTestDataLines.addAll(outputDataLines);
		// Random random = new Random();
		if (testDataPct < 0 || testDataPct > 100) {
			throw new InitializationException(
					"Test data persentage is not correctly set, should be in range (0,100)");
		}
		for (Map<String, String> instance : instancesList) {
			outputDataLines.add(instanceParser.parse(instance));
			// int tempint = numPerClass.get(instance.get(CLASS_LABEL));
			// if(tempint <= 0)
			// {
			// Log.w("LocateService", "There seems to be a problem with ROOM " +
			// instance.get(CLASS_LABEL) +
			// ". Ignoring this ROOM. Check arff file!");
			// continue;
			// }
			// if(random.nextInt(tempint)<pctPerClass.get(instance.get(CLASS_LABEL))){
			// outputTestDataLines.add(instanceParser.parse(instance));
			// }else{
			// outputDataLines.add(instanceParser.parse(instance));
			// }
		}
		// logger.debug("Starting to write to file.");
		FileUtils.writeLines(outputDataFile, outputDataLines);
		if (testDataFile.length > 0) {
			FileUtils.writeLines(testDataFile[0], outputTestDataLines);
		}
		// logger.debug("writing to file finished");
		ini();
	}

	// public static void main(String[] args){
	// Transformer t = new Transformer();
	// try {
	// t.readFile(new File("data_input"));
	// t.transform(new File("data_output/test.arff"));
	// } catch (Exception e) {
	// // TODO Auto-generated catch block
	// e.printStackTrace();
	// }
	// }

	public void setMiisingValue(int missingValue) {
		this.missingValue = missingValue;
	}

	public void setTestDataPct(int testDataPct) {
		this.testDataPct = testDataPct;
	}

}
