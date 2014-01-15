package james.weka.impl;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

//import org.slf4j.//logger;
//import org.slf4j.//loggerFactory;

/**
 * Used by Transformer for parsing lines of ARFF file.
 */
public class InstanceParser {

	private List<String> BSSIDList;
	private int missingValue = 0;
	private int strengthThreshold = 100;

	// private static //logger //logger =
	// //loggerFactory.get//logger(InstanceParser.class);

	public InstanceParser(List<String> BSSIDList) {
		this.BSSIDList = BSSIDList;
	}

	public int getMissingValue() {
		return missingValue;
	}

	public void setMissingValue(int missingValue) {
		this.missingValue = missingValue;
	}

	public int getStrengthThreshold() {
		return strengthThreshold;
	}

	/**
	 * Set the signal strength threshhold of Wi-Fi signal, signal strengh under
	 * greater then this value will be ignored.
	 * 
	 * @param strengthThreshold
	 */
	public void setStrengthThreshold(int strengthThreshold) {
		this.strengthThreshold = strengthThreshold;
	}

	/**
	 * Takes bag formatted ARFF line
	 * 
	 * (e.g. "0,"00:12:43:f9:3c:a1,76\n00:12:43:8a:
	 * e1:f1,81\n00:12:43:8a:d6:71,78\n1c:c6
	 * :3c:54:1a:e7,96\n00:12:43:f9:3c:a0,77
	 * \n00:12:43:8a:e1:f0,81\n00:12:43:8a:d6:70,78\n", ohrt")
	 * 
	 * which already must be parsed to instance map and returns flattened ARFF
	 * line
	 * 
	 * ("100,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,81,77,81,76,100,0,
	 * ,0,78,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100
	 * ,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,ohrt")
	 * 
	 * excluding room.
	 * 
	 * @param instance
	 *            Map from BSSID to RSSI.
	 * @return flattened ARFF line, just containing comma separated RSSI values
	 */
	public String parse(final Map<String, String> instance) {
		Set<String> keySet = instance.keySet();
		Map<String, String> instanceCopy = new TreeMap<String, String>();
		instanceCopy.putAll(instance);
		double max = strengthThreshold;// try to find the max signal strength in
										// an instance
		// logger.debug("Getting a new instance.");
		for (String key : keySet) {
			if (!Transformer.CLASS_LABEL.equalsIgnoreCase(key)) {
				double d = Math.abs(Double.parseDouble(instanceCopy.get(key)));
				// logger.debug("Find a rssi, the value is "+d);
				if (d > strengthThreshold) {
					instanceCopy.remove(key);
				} else {
					max = Math.min(max, d);
					// logger.debug("max is now set to "+max);
				}
			}

		}
		max = Math.abs(max - 100d);
		// logger.debug("Find max for one instance "+max);
		String result = "";
		for (String BSSID : BSSIDList) {
			if (instanceCopy.get(BSSID) == null) {
				result += missingValue;
				result += ",";
			} else {
				// result+=(instanceCopy.get(BSSID)+",");
				result += (Math
						.abs(Integer.parseInt(instanceCopy.get(BSSID)) - 100) + ",");
				// result+=(Math.abs(Double.parseDouble(instanceCopy.get(BSSID))-100)/max+",");
			}
		}
		if (instanceCopy.get(Transformer.CLASS_LABEL) != null) {
			result += instanceCopy.get(Transformer.CLASS_LABEL);
		} else {
			result += "unknown";
		}
		return result;

	}

}
