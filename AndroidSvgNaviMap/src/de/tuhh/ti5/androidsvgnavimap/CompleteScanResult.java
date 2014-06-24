/*
 * Copyright (C) 2008 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package de.tuhh.ti5.androidsvgnavimap;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import android.net.wifi.ScanResult;
import android.util.Log;

/**
 * Contains all relevant data of a single Wifi scan, i.e., each found BSSID with
 * its corresponding signal strength.
 */
public class CompleteScanResult {

	private static final String LOGTAG = "CompleteScanResult";
	/**
	 * Map from BSSID to signal strength (level/dB)
	 */
	private Map<String, Integer> scanData = new TreeMap<String, Integer>();

	public CompleteScanResult(List<ScanResult> scanResults) {
		for (ScanResult result : scanResults) {
			add(result);
		}
	}

	public CompleteScanResult() {		
	}

	public void add(String BSSID, int level) {
		Integer old = getScanData().put(BSSID, level);
		if (old != null) {
			Log.e(LOGTAG, "scanData already contains entry for BSSID " + BSSID);
		}
	}

	public void add(ScanResult result) {
		add(result.BSSID, result.level);
	}

	public Map<String, Integer> getScanData() {
		return scanData;
	}

	private void setScanData(Map<String, Integer> scanData) {
		this.scanData = scanData;
	}
	
	@Override
	public String toString() {
		String s = "" + getScanData().size() + " BSSIDs: " + getScanData().toString();
		return s;
	}

}
