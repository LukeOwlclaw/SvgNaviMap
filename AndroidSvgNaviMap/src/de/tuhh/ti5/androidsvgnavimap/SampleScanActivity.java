package de.tuhh.ti5.androidsvgnavimap;

import james.weka.android.LocateService;
import james.weka.impl.ClassfierUtils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.ObjectOutput;
import java.io.ObjectOutputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import weka.classifiers.Classifier;
import weka.classifiers.meta.FilteredClassifier;
import weka.classifiers.meta.RandomCommittee;
import weka.classifiers.misc.SerializedClassifier;
import weka.core.Debug;
import weka.core.Instance;
import weka.core.Instances;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.Display;
import android.view.Menu;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;
import android.widget.Toast;

public class SampleScanActivity extends Activity {
	private static final String UNKNOWN_ROOM = "unknown";

	protected boolean running;

	protected static final String logTag = "APLocActivity";

	// for service
	private static boolean wekaRegistered = false;

	private LocateService locateService = null;

	private boolean mIsBound = false;

	private ServiceConnection mConnection = new ServiceConnection() {
		@Override
		public void onServiceConnected(ComponentName className, IBinder service) {
			locateService = ((LocateService.LocateServiceBinder) service)
					.getService();

		}

		@Override
		public void onServiceDisconnected(ComponentName className) {
			locateService = null;
		}

	};

	private void doBindService() {
		bindService(new Intent(getApplicationContext(), LocateService.class),
				mConnection, Context.BIND_AUTO_CREATE);
		mIsBound = true;
	}

	private void doUnbindService() {
		if (mIsBound) {
			// Detach our existing connection.
			unbindService(mConnection);
			mIsBound = false;
		}
	}

	private BroadcastReceiver wekaReceiver = new BroadcastReceiver() {

		private static final String LOG_TAG = "Weka_receiver";

		@Override
		public void onReceive(Context context, Intent intent) {
			String room = intent.getExtras().getString(LocateService.ROOM);
			double confidence = intent.getExtras().getDouble(
					LocateService.CONFIDENCE);
			Log.i(LOG_TAG, "Get new classifcation result : Room " + room + "("
					+ confidence + ")");

			Map<Double, String> test = (Map<Double, String>) intent.getExtras()
					.getSerializable(LocateService.ALLPOSSIBILITIES);

			Map<Double, String> propsSorted = new TreeMap<Double, String>(
					Collections.reverseOrder());

			if (test != null) {

				propsSorted.putAll((Map<Double, String>) test);

			}

			// TODO The following part various in different apps since the
			// reaction on the gui differs from apps
			// toastMessage("New Localization result from Weka");

            ((TextView) findViewById(R.id.sample_scan_text))
					.setText(getText(R.string.sample_scan_scan_finished));

			TableLayout table = (TableLayout) findViewById(R.id.sample_scan_result_table2);
			while (table.getChildCount() > 1) {
				table.removeViewAt(1);
			}

			TableRow tr = new TableRow(SampleScanActivity.this);
			tr.setLayoutParams(new TableRow.LayoutParams(
					LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
			TextView tv;

			tv = new TextView(SampleScanActivity.this);
			tv.setText(room);
			tv.setPadding(5, 5, 5, 5);
			tr.addView(tv);
			tv = new TextView(SampleScanActivity.this);
			tv.setText(ClassfierUtils.doubleToString(confidence * 100, 2));
			tv.setPadding(5, 5, 5, 5);
			tr.addView(tv);

			table.addView(tr);

			int count = 0;
			for (Entry entry : propsSorted.entrySet()) {
				count++;
				if (count == 1)
					continue;
				if (count > 4)
					return;

				tr = new TableRow(SampleScanActivity.this);
				tr.setLayoutParams(new TableRow.LayoutParams(
						TableRow.LayoutParams.MATCH_PARENT,
						TableRow.LayoutParams.MATCH_PARENT));

				tv = new TextView(SampleScanActivity.this);
				tv.setText(entry.getValue().toString());
				tv.setPadding(5, 5, 5, 5);
				tr.addView(tv);
				tv = new TextView(SampleScanActivity.this);
				tv.setText(entry.getKey().toString());
				tv.setPadding(5, 5, 5, 5);
				tr.addView(tv);

				table.addView(tr);

			}

		}
	};

	// end of service

	Set<String> classes = new HashSet<String>();
	Set<String> bssids = new HashSet<String>();
	Set<String> rooms = new HashSet<String>();

	/**
	 * @uml.property name="log"
	 * @uml.associationEnd
	 */
	protected static Logger log = new Logger(logTag);

	protected BroadcastReceiver wifiScanReceiver = null;
	protected BroadcastReceiver wifiLoggerReceiver = null;

	Classifier cModel = null;

	private AutoCompleteTextView roomTextView;

	String getRoom() {
		return roomTextView.getText().toString();
	}

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		System.setProperty("WEKA_HOME", "/sdcard/weka_home");

		log.debug("created sample scan");
		setContentView(R.layout.sample_scan);

		roomTextView = (AutoCompleteTextView) findViewById(R.id.roomTextView);
		roomTextView.setThreshold(1);

		File theDir = new File(getWorkDir());
		if (!theDir.exists()) {
			String msg = "creating directory: " + getWorkDir();
			Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT)
					.show();
			boolean result = theDir.mkdir();
			if (result) {
				msg = "DIR created.";
				Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT)
						.show();
			}

		}

		/* First, get the Display from the WindowManager */
		Display display = ((WindowManager) getSystemService(WINDOW_SERVICE))
				.getDefaultDisplay();

		/* Now we can retrieve all display-related infos */
		int width = display.getWidth();
		int height = display.getHeight();
		int orientation = display.getOrientation();

		log.debug("display: " + width + "x" + height + " orientation:"
				+ orientation);

		running = false;

		WifiManager wm = (WifiManager) getSystemService(Context.WIFI_SERVICE);
		int state = wm.getWifiState();

		((TextView) findViewById(R.id.sample_scan_text)).append("\n"
				+ getString(R.string.sample_scan_supplicant_state) + ": "
				+ getResources().getStringArray(R.array.wifi_states)[state]);

		// updateResults();

		// readAndParseLogFile();

	}

	private void toastMessage(String string) {
		Toast.makeText(getApplicationContext(), string, Toast.LENGTH_SHORT)
				.show();

	}

	/**
	 * @param rooms2
	 * @return
	 */
	public ArrayAdapter<String> setAutocompleteStrings(Set<String> rooms2) {

		List<String> list = new ArrayList<String>();
		for (String room : rooms2) {
			list.add(room);
		}

		ArrayAdapter<String> adapter = new ArrayAdapter<String>(this,
				android.R.layout.simple_dropdown_item_1line, list);
		roomTextView.setAdapter(adapter);
		return adapter;
	}

	// initiate wifi scan right now. (so do not have to wait until Android
	// decides to do it)
	public void takeWifiScanNow(final View v) {
		WifiManager wifiMan = (WifiManager) getApplicationContext()
				.getSystemService(Context.WIFI_SERVICE);
		wifiMan.startScan();
	}

	public void logWifiScans(View v) {

		if (wifiLoggerReceiver == null) {

			IntentFilter i = new IntentFilter();
			i.addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);

			toastMessage("Start logging...");

			// prepare intent which is triggered if the
			// notification is selected

			Intent intent = new Intent(this, SampleScanActivity.class);
			PendingIntent pIntent = PendingIntent.getActivity(this, 0, intent,
					0);

			// build notification
			// the addAction re-use the same intent to keep the example short
			Notification n = new Notification.Builder(this).setOngoing(true)
					.setContentTitle("WifiScans are being logged...")
					.setContentText("RssiLogger").setContentIntent(pIntent)
					.setSmallIcon(R.drawable.ic_launcher).setAutoCancel(false)
					.build();

			NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

			notificationManager.notify(0, n);

			wifiLoggerReceiver = new BroadcastReceiver() {
				@Override
				public void onReceive(Context c, Intent i) {

					log.debug("received ScanResult");
					// Code to execute when SCAN_RESULTS_AVAILABLE_ACTION
					// event occurs
					WifiManager w = (WifiManager) c
							.getSystemService(Context.WIFI_SERVICE);
					List<ScanResult> l = w.getScanResults(); // Returns a
																// <list> of
																// scanResults

					// StringBuffer wifiLogEntry =
					// createLogEntryFromScanResult(l);
					//
					// updateResults();
					//
					// createWifiScanLogEntry(wifiLogEntry.toString());

				}

			};
			registerReceiver(wifiLoggerReceiver, i);

		} else if (wifiLoggerReceiver != null) {
			toastMessage("Logging disabled.");
			NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
			notificationManager.cancelAll();
			unregisterReceiver(wifiLoggerReceiver);
			wifiLoggerReceiver = null;
		}
	}

	public void scanNow(View v) {

		if (getRoom().length() == 0) {
			Toast.makeText(getApplicationContext(), "Provide room first!",
					Toast.LENGTH_SHORT).show();
			return;
		}

		hideKeyboard();

		WifiManager wm = (WifiManager) getSystemService(Context.WIFI_SERVICE);

		if (!running) {

			TextView bodyText = ((TextView) findViewById(R.id.sample_scan_text));

			log.debug("button clicked, trying to start a wifi scan");

			if (!wm.isWifiEnabled()) {
				bodyText.setText(getText(R.string.sample_scan_enableing_wifi));

				log.debug("WiFi is disabled, trying to enable it");
				wm.setWifiEnabled(true);
				try {
					Thread.sleep(200);
				} catch (InterruptedException e) {

				}

				if (wm.isWifiEnabled()) {
					bodyText.append("\n"
							+ getText(R.string.sample_scan_enableing_wifi_failed));
					log.debug("WiFi could not be enabled");
				} else {
					log.debug("WiFI enabled successfully");
					bodyText.append("\n"
							+ getText(R.string.enableingWiFiSucceed));

				}
			}

			if (wm.isWifiEnabled()) {
				WifiInfo winfo = wm.getConnectionInfo();
				if (winfo != null) {
					((TextView) findViewById(R.id.sample_scan_text))
							.append("\n"
									+ winfo.getSupplicantState().toString());
				}

				log.debug("WiFi is enabled");

				IntentFilter i = new IntentFilter();
				i.addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);

				wifiScanReceiver = new BroadcastReceiver() {
					@Override
					public void onReceive(Context c, Intent i) {

						log.debug("received ScanResult");
						// Code to execute when SCAN_RESULTS_AVAILABLE_ACTION
						// event occurs
						WifiManager w = (WifiManager) c
								.getSystemService(Context.WIFI_SERVICE);
						List<ScanResult> l = w.getScanResults(); // Returns a
																	// <list> of
																	// scanResults

						StringBuffer arffBag = createArffBagFromScanResult(l,
								false);

						running = false;
						((Button) findViewById(R.id.sample_scan_button))
								.setText(getText(R.string.sample_scan_start_button_text));
						// ((TextView)
						// findViewById(R.id.sample_scan_text)).setText(result.toString());
						((TextView) findViewById(R.id.sample_scan_text))
								.append(getText(R.string.sample_scan_scan_finished));

						SampleScanActivity.this
								.unregisterReceiver(wifiScanReceiver);
						wifiScanReceiver = null;

						// gridview.setAdapter(new
						// WiFiScanResultAdapter(SampleScanActivity.this));
						// gridview.setEnabled(false);

						updateResults();

						createLogEntry(arffBag.toString());

					}

				};
				registerReceiver(wifiScanReceiver, i);

				log.debug("starting scan");
				// Now you can call this and it should execute the
				// broadcastReceiver's onReceive()
				running = wm.startScan();

				if (running) {
					bodyText.setText(getText(R.string.sample_scan_scanning_text));
					// ImageSpan is = new ImageSpan(this,android.R.drawable.)
					((Button) findViewById(R.id.sample_scan_button))
							.setText(getText(R.string.sample_scan_stop_button_text));
				} else {
					bodyText.setText(getText(R.string.sample_scan_start_scan_failed));
				}

			}

		} else {
			// stopping scanner
			log.debug("stopping wifi scan reveiver");
			try {
				if (wifiScanReceiver != null)
					unregisterReceiver(wifiScanReceiver);
			} catch (Exception ex) {
			}
			// WifiManager wm = (WifiManager)
			// getSystemService(Context.WIFI_SERVICE);

			((TextView) findViewById(R.id.sample_scan_text))
					.append(getText(R.string.sample_scan_stopped));
			((Button) findViewById(R.id.sample_scan_button))
					.setText(getText(R.string.sample_scan_start_button_text));
			running = false;
		}
	}

	private void hideKeyboard() {
		InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
		imm.hideSoftInputFromWindow(roomTextView.getWindowToken(), 0);

	}

	public void createArffFile(View v) {

		SharedPreferences sharedPref = PreferenceManager
				.getDefaultSharedPreferences(this.getApplicationContext());
		String logname = sharedPref.getString("logfile", "rssi.log");
		String arffname = sharedPref.getString("arfffile", "rssi.arff");

		createArffFile(arffname, logname, null);

	}

	// either take arffBag(s) from logname (to create rssi.arff)
	// or use content (to create testing.arff), the other has to be null
	private void createArffFile(String arffname, String logname, String content) {

		// required for creating arff file header
		readAndParseLogFile();

		// //////////////////////
		// create arff file - header
		// //////////////////////
		File arfffile = new File(getWorkDir(), arffname);
		BufferedWriter bw = null;
		BufferedReader br = null;
		try {
			if (!arfffile.exists())
				arfffile.createNewFile();
			bw = new BufferedWriter(new FileWriter(arfffile), 1024);

			String nl = "\r\n";
			bw.write("@relation tm450" + nl);
			bw.write("" + nl);
			bw.write("@attribute userid {");
			for (String u : classes) {
				// Logger.d("u: " + u);
				bw.write(u + ",");
			}
			bw.write("}" + nl);
			bw.write("" + nl);
			bw.write("@attribute bag relational" + nl);
			bw.write("  @attribute BSSID {");
			for (String bssid : bssids) {
				// Logger.d("bssid: " + bssid);
				bw.write(bssid + ",");
			}
			bw.write("}" + nl);
			bw.write("" + nl);
			bw.write("  @attribute RSSI integer [0,100]" + nl);
			bw.write("@end bag" + nl);
			bw.write("" + nl);
			bw.write("@attribute ROOM {");
			for (String room : rooms) {
				bw.write(room + ",");
			}
			bw.write(UNKNOWN_ROOM);
			bw.write("}" + nl);
			bw.write("" + nl);
			bw.write("@data" + nl);
			bw.write("" + nl);

			// //////////////////////
			// create arff file - body (data)
			// //////////////////////
			if (content == null) {
				// create rssi.arff from logfile
				final File logfile = new File(getWorkDir(), logname);

				FileInputStream fstream = new FileInputStream(logfile);
				// Get the object of DataInputStream
				DataInputStream in = new DataInputStream(fstream);
				br = new BufferedReader(new InputStreamReader(in));

				String line;
				while ((line = br.readLine()) != null) {
					// Logger.d("line: " + line);
					bw.write(line + nl);
				}

				Logger.d("Setting cModel=null");
				// localisation database (rssi.arff) changed, cModel
				// (classifier) has to be re-created.
				cModel = null;

			} else {
				// create testing.arff
				bw.write(content);
			}

		} catch (IOException e) {
			Logger.e("error saving log", e);
		} finally {
			if (bw != null) {
				try {
					bw.close();
				} catch (IOException e) {
					Logger.e("error closing log", e);
				}
			}
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					Logger.e("error closing log", e);
				}
			}
		}

	}

	private String getWorkDir() {
		SharedPreferences sharedPref = PreferenceManager
				.getDefaultSharedPreferences(this.getApplicationContext());
		String workdir = sharedPref.getString("workdir", "/rssi/");
		return Environment.getExternalStorageDirectory() + workdir;
	}

	private void readAndParseLogFile() {

		Logger.d("readAndParseLogFile()");
		SharedPreferences sharedPref = PreferenceManager
				.getDefaultSharedPreferences(this.getApplicationContext());
		String logname = sharedPref.getString("logfile", "rssi.log");

		// ////////////////////////
		// read and parse log file.
		// ////////////////////////
		final File logfile = new File(getWorkDir(), logname);
		BufferedReader br = null;
		try {
			// Open the file that is the first
			// command line parameter
			FileInputStream fstream = new FileInputStream(logfile);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			br = new BufferedReader(new InputStreamReader(in));
			String line;
			int lineCount = 0;
			// Read File Line By Line
			while ((line = br.readLine()) != null) {
				lineCount++;

				if (line.trim().length() == 0)
					continue;

				String regex = "([^,]+),\"([^\"]+)\",([^,]+)";

				Pattern pattern = Pattern.compile(regex);
				Matcher matcher = pattern.matcher(line);

				if (false == matcher.find()) {
					// throw new
					// Exception("RegEx did not find anything on line "
					// + lineCount + "!");
					Logger.e("Bad line: " + line);
					continue;
				}

				if (3 != matcher.groupCount())
					throw new Exception("Line " + lineCount
							+ " does not have three parts!");

				// Logger.d("class: " + matcher.group(1).toString());
				classes.add(matcher.group(1).toString().trim());

				String regex2 = "([^,]+),([^\\\\]+)\\\\n";
				Pattern pattern2 = Pattern.compile(regex2);
				Matcher matcher2 = pattern2.matcher(matcher.group(2));
				// Check all occurance
				while (matcher2.find()) {
					if (2 != matcher2.groupCount())
						throw new Exception("On line " + lineCount
								+ ", syntax error in second part!");
					bssids.add(matcher2.group(1).trim());
					// Logger.d("bssid: " + matcher2.group(1).trim());
				}

				// Logger.d("room: " + matcher.group(3).trim());
				rooms.add(matcher.group(3).trim());

				setAutocompleteStrings(rooms);

			}
			// Close the input stream
			in.close();
		} catch (Exception e) {// Catch exception if any
			Logger.e("Error reading log file", e);
		} finally {
			if (br != null)
				try {
					br.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
		}

	}

	String getLogLineFromArffBag(String arffBag) {
		SharedPreferences sharedPref = PreferenceManager
				.getDefaultSharedPreferences(this.getApplicationContext());
		String userid = sharedPref.getString("userid", "0");

		String arffClass = userid;
		String room = getRoom();

		if (room.length() == 0)
			room = UNKNOWN_ROOM;

		return arffClass + ",\"" + arffBag + "\", " + room + "\r\n";
	}

	void createLogEntry(String arffBag) {

		if (arffBag.trim().length() == 0) {
			Logger.d("NOT Creating logentry because it would be empty.");
		}

		Logger.d("Creating logentry: " + arffBag);

		SharedPreferences sharedPref = PreferenceManager
				.getDefaultSharedPreferences(this.getApplicationContext());
		String logname = sharedPref.getString("logfile", "rssi.log");

		String logline = getLogLineFromArffBag(arffBag);

		final File logfile = new File(getWorkDir(), logname);

		BufferedWriter bw = null;
		try {
			if (!logfile.exists())
				logfile.createNewFile();

			bw = new BufferedWriter(new FileWriter(logfile, true), 1024);
			bw.write(logline);

		} catch (IOException e) {
			Logger.e("error saving log", e);
		} finally {
			if (bw != null) {
				try {
					bw.close();
				} catch (IOException e) {
					Logger.e("error closing log", e);
				}
			}
		}

	}

	@Override
	protected void onDestroy() {
		log.debug(this.getClass().getName() + " is destroyed!");
		super.onDestroy();
		doUnbindService();
		if (wekaRegistered) {
			unregisterReceiver(wekaReceiver);
			wekaRegistered = false;
		}
	}

	@Override
	protected void onStop() {
		log.debug(this.getClass().getName() + " is stopped!");
		if (wifiScanReceiver != null) {
			unregisterReceiver(wifiScanReceiver);
		}
		super.onStop();
	}

	protected void showLocateMeResults(Map<Double, String> props) {

		TableLayout table = (TableLayout) findViewById(R.id.sample_scan_result_table2);
		while (table.getChildCount() > 1) {
			table.removeViewAt(1);
		}

		for (Entry entry : props.entrySet()) {

			TableRow tr = new TableRow(this);
			tr.setLayoutParams(new TableRow.LayoutParams(
					LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));

			TextView tv;

			tv = new TextView(this);
			tv.setText(entry.getValue().toString());
			tv.setPadding(5, 5, 5, 5);
			tr.addView(tv);
			tv = new TextView(this);
			tv.setText(entry.getKey().toString());
			tv.setPadding(5, 5, 5, 5);
			tr.addView(tv);

			table.addView(tr);

		}

		TableRow tr = new TableRow(this);
		tr.setLayoutParams(new TableRow.LayoutParams(LayoutParams.MATCH_PARENT,
				LayoutParams.MATCH_PARENT));
		TextView tv;

		tv = new TextView(this);
		tv.setText("Total possibilities: ");
		tv.setPadding(5, 5, 5, 5);
		tr.addView(tv);
		tv = new TextView(this);
		tv.setText(String.valueOf(props.size()));
		tv.setPadding(5, 5, 5, 5);
		tr.addView(tv);

		table.addView(tr);

	}

	protected void updateResults() {

		WifiManager wm = (WifiManager) getSystemService(Context.WIFI_SERVICE);

		WifiInfo winfo = wm.getConnectionInfo();
		if (winfo != null) {
			((TextView) findViewById(R.id.sample_scan_text)).append("\n"
					+ getString(R.string.sample_scan_supplicant_state)
					+ winfo.getSupplicantState().toString());
		}

		TableLayout table = (TableLayout) findViewById(R.id.sample_scan_result_table);
		while (table.getChildCount() > 1) {
			table.removeViewAt(1);
		}
		List<ScanResult> results = wm.getScanResults();
		if (results != null)
			for (Iterator<ScanResult> it = results.iterator(); it.hasNext();) {
				ScanResult sr = it.next();
				TableRow tr = new TableRow(this);
				tr.setLayoutParams(new TableRow.LayoutParams(
						LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));

				TextView tv;

				tv = new TextView(this);
				tv.setText(sr.SSID);
				tv.setPadding(5, 5, 5, 5);
				tr.addView(tv);
				tv = new TextView(this);
				tv.setText(sr.BSSID);
				tv.setPadding(5, 5, 5, 5);
				tr.addView(tv);
				tv = new TextView(this);
				tv.setText(sr.level + "dBm");
				tv.setPadding(5, 5, 5, 5);
				tr.addView(tv);
				tv = new TextView(this);
				tv.setText(sr.frequency + "MHz");
				tv.setPadding(5, 5, 5, 5);
				tr.addView(tv);
				tv = new TextView(this);
				tv.setText(sr.capabilities);
				tv.setPadding(5, 5, 5, 5);
				tr.addView(tv);

				table.addView(tr);
			}

	}

	@Override
	protected void onResume() {
		super.onResume();
		log.debug("setting context");

	}

	Map<Double, String> propsSortedMulti = new TreeMap<Double, String>(
			Collections.reverseOrder());
	int propsSortedMultiCount = 0;

	public void stopWekaService(View v) {
		hideKeyboard();
		log.info("Local me multi clicked, try to stop receiveing localization from weka service.");
		if (wekaRegistered) {
			log.info("Weka service broadcast receiver is registered "
					+ wekaRegistered + ", so try unregister it.");
			unregisterReceiver(wekaReceiver);
			wekaRegistered = false;
		}

		if (locateService != null) {
			log.info("unbinding service.");
			doUnbindService();
		} else {
			log.info("service not bound.");
		}

	}

	public void startWekaService(final View v) {
		// try to use locateService
		log.info("startWeka pressed");
		hideKeyboard();
		if (!wekaRegistered) {
			log.info("weka service broadcast receiver is reigsterd "
					+ wekaRegistered + ", try to register is.");
			registerReceiver(wekaReceiver, new IntentFilter(
					LocateService.WEKA_LOCALIZARION_BROADCAST_INTENT));
			wekaRegistered = true;
		} else {
			log.info("The weka broadcaser receiver is already registered.");
		}
		if (mIsBound == false) {
			log.info("binding serive and try to get classification result.");
			doBindService();
		} else {
			log.info("service already bind, do nothing but wait for classification result from service.");
		}

	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		Intent intent = new Intent(this, PreferencesActivity.class);
		startActivity(intent);
		return false;
	}

	@SuppressLint("SimpleDateFormat")
	private Map<Double, String> calculateLocation(String arffBag) {

		Map<Double, String> props = new HashMap<Double, String>();
		Map<Double, String> propsSorted = new TreeMap<Double, String>(
				Collections.reverseOrder());

		String logline = getLogLineFromArffBag(arffBag);

		DateFormat dateFormat = new SimpleDateFormat("_yyyyMMdd-HHmmss");
		String testfilename = "test_" + getRoom() + "_"
				+ dateFormat.format(new Date()) + ".arff";

		SharedPreferences sharedPref = PreferenceManager
				.getDefaultSharedPreferences(this.getApplicationContext());
		boolean createtestarff = sharedPref.getBoolean("createtestarff", false);
		// test arff is used for testing/localisation using weka
		// if (!createtestarff) it is deleted later...

		createArffFile(testfilename, null, logline);

		BufferedReader reader = null;
		BufferedReader testreader = null;
		File testFile = null;
		try {

			String arffname = sharedPref.getString("arfffile", "rssi.arff");
			final File arfffile = new File(getWorkDir(), arffname);
			reader = new BufferedReader(new FileReader(arfffile));

			Instances data = new Instances(reader);
			data.setClassIndex(data.numAttributes() - 1);

			testFile = new File(getWorkDir(), testfilename);
			testreader = new BufferedReader(new FileReader(testFile));
			Instances testdata = new Instances(testreader);

			// Evaluation eTest = new Evaluation(data);

			String classifierfilepath = sharedPref.getString("wekaclassifier",
					"weka.classifier.model");
			final File classifierfile = new File(getWorkDir(),
					classifierfilepath);

			if (cModel != null) {
				Toast.makeText(getApplicationContext(),
						"Calculating position...", Toast.LENGTH_SHORT).show();

			} else if (classifierfile.exists()) {
				String msg = "Trying to de-serialize weka classifier "
						+ classifierfile.getAbsolutePath();
				Logger.d(msg);
				Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT)
						.show();

				try {
					SerializedClassifier classifier = new SerializedClassifier();
					classifier.setModelFile(classifierfile);
					cModel = classifier;
					Logger.d("De-serialization succeeded.");
				} catch (StackOverflowError e) {
					Logger.e(
							"error reading " + classifierfile.getAbsolutePath()
									+ " trying to delete...", e);
					classifierfile.delete();

				} catch (Exception e) {
					msg = "error reading " + classifierfile.getAbsolutePath()
							+ " trying to delete...";
					Logger.e(msg, e);
					Toast.makeText(getApplicationContext(), msg,
							Toast.LENGTH_LONG).show();
					classifierfile.delete();

				}
			} else {

				// use CitationKNN - does not work well.
				{
					// cModel = (Classifier) new CitationKNN();
				}

				// TLC - works well but is sloooooow!
				{
					// cModel = (Classifier) new TLC();
					//
					// if (cModel instanceof OptionHandler)
					// ((OptionHandler) cModel).setOptions(weka.core.Utils
					// .splitOptions("-- -P 90"));
					// else
					// Logger.w("Could not set parameters for Classifier!");
				}

				// RandomCommittee + MultiInstanceWrapper - works well and fast!
				{
					// J48 m_Classifier = new weka.classifiers.trees.J48();
					// Discretize m_Filter = new
					// weka.filters.supervised.attribute.Discretize();
					// Filter m_Filter2 = new
					// weka.filters.supervised.attribute.AttributeSelection();

					// Filter discretize = new
					// weka.filters.supervised.attribute.Discretize();
					// FilteredClassifier fc2 = new FilteredClassifier();
					// discretize.setInputFormat(data);
					//
					// J48 ft = new J48();
					// fc2.setFilter(discretize);
					// fc2.setClassifier(ft);
					//
					// cModel = (Classifier) fc2;

					FilteredClassifier fc = new FilteredClassifier();
					// fc.setDebug(true);

					fc.setClassifier(new RandomCommittee());
					// fc.setFilter(new MultiInstanceWrapper());
					cModel = fc;
				}

				// Logger.d(cModel.debugTipText());
				// cModel.setDebug(true);
				// Logger.d("data.numAttributes(): " + data.numAttributes());
				Logger.d("data.numClasses(): " + data.numClasses());

				final String msg = "building classifier";
				Logger.d(msg);

				// runOnUiThread(new Runnable() {
				// public void run() {
				// //does not work. why?
				// Toast.makeText(getApplicationContext(), msg,
				// Toast.LENGTH_LONG)
				// .show();
				//
				// }
				// });

				cModel.buildClassifier(data);

			}

			Logger.d("testdata.numAttributes(): " + testdata.numAttributes());
			testdata.setClassIndex(testdata.numAttributes() - 1);

			Instance classMissing = (Instance) testdata.firstInstance().copy();
			classMissing.setDataset(testdata.firstInstance().dataset());
			classMissing.setClassMissing();

			double[] dist = cModel.distributionForInstance(classMissing);

			List<String> rooms2 = new ArrayList<String>();
			for (int v = 0; v < data.classAttribute().numValues(); v++) {
				// Logger.d("v: " + data.classAttribute().value(v));
				rooms2.add(data.classAttribute().value(v));
			}

			if (dist != null)
				Logger.d("dist.length=" + dist.length + ", rooms2.size()="
						+ rooms2.size());
			else
				Logger.d("dist == null, rooms2.size()=" + rooms2.size());

			if (dist.length != rooms2.size())
				Logger.e("very bad. dist.length != rooms2.size()");

			for (int i = 0; i < dist.length; i++) {

				// do not lose any results!
				while (props.containsKey(dist[i]))
					dist[i] += 1E-10;
				props.put(dist[i], data.classAttribute().value(i));

				Logger.d("Dist[" + i + "] = " + dist[i] + ", class[" + i + "]="
						+ data.classAttribute().value(i));
			}

			propsSorted.putAll(props);

			if (!createtestarff) {
				Logger.i("deleting arff file");
				if (testFile != null) {
					if (testFile.delete()) {
						Logger.i("arff file deleted");
					} else
						Logger.w("error while deleting arff file");
				}

			} else {
				Logger.i("not deleting test arff");
			}

			saveModelToSdcard(sharedPref, classifierfile);

			// eTest.evaluateModel(cModel, testdata);

			// double dd = eTest.evaluateModelOnceAndRecordPrediction(cModel,
			// testdata.firstInstance());

		} catch (FileNotFoundException e) {
			Logger.e("file not found error", e);
		} catch (IOException e) {
			Logger.e("instance reading error", e);
		} catch (Exception e) {
			Logger.e("eval error", e);
		} catch (VerifyError e) {
			Logger.e("VerifyError", e);
		} finally {
			if (reader != null) {
				try {
					reader.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}

		return propsSorted;

	}

	private void saveModelToSdcard(SharedPreferences sharedPref,
			final File classifierfile) {
		Logger.d("saveModelToSdcard()");

		// WARNING! CAN CAUSE SERIALIZATION ERROR ON ANDROID -->
		// StackOverflowError!
		boolean savemodeltosdcard = sharedPref.getBoolean("savemodeltosdcard",
				false);
		if (savemodeltosdcard) {
			try {
				if (classifierfile.exists()) {
					Logger.d("not saving classifier. file already exists.");
				} else {
					Logger.d("saving classifier to "
							+ classifierfile.getAbsolutePath());

					Debug.saveToFile(classifierfile.getAbsolutePath(), cModel);

					ObjectOutput out = null;
					try {
						out = new ObjectOutputStream(new FileOutputStream(
								classifierfile));
						out.writeObject(cModel);

					} catch (Exception e) {
						e.printStackTrace();
					} catch (StackOverflowError e) {
						e.printStackTrace();
					} finally {
						if (out != null)
							out.close();
					}
				}

			} catch (Exception e) {
				Logger.e("error saving classifier to file", e);
			} catch (StackOverflowError e) {
				Logger.e("error saving classifier to file", e);
				classifierfile.delete();
			}
		}
	}

	/**
	 * @param l
	 * @param onlyUseKnownBssids
	 * @return
	 */
	public StringBuffer createArffBagFromScanResult(List<ScanResult> l,
			boolean onlyUseKnownBssids) {
		// StringBuffer result = new StringBuffer();

		StringBuffer arffBag = new StringBuffer();

		for (Iterator<ScanResult> it = l.iterator(); it.hasNext();) {
			ScanResult sr = it.next();
			// result.append(sr.BSSID + " " + sr.SSID + " " + sr.level + "dBm "
			// + sr.frequency + "MHz "
			// + sr.capabilities + "\n");

			if (onlyUseKnownBssids) {

				if (!bssids.contains(sr.BSSID)) {
					Logger.d("BSSID was found that is not in arff database. Ignore: "
							+ sr.BSSID);
					continue;
				}
			}

			arffBag.append(sr.BSSID + "," + Math.abs(sr.level) + "\\n");
		}
		return arffBag;
	}

	public static <T, E> T getKeyByValue(Map<T, E> map, E value) {
		for (Entry<T, E> entry : map.entrySet()) {
			if (value.equals(entry.getValue())) {
				return entry.getKey();
			}
		}
		return null;
	}

	boolean backPressed = false;

	@Override
	public void onBackPressed() {

		if (backPressed == false) {
			Toast.makeText(
					this,
					"Press back again to exit (not hide!) this app. Otherwise use home button.",
					Toast.LENGTH_LONG).show();
			backPressed = true;

			Handler handler = new Handler();
			handler.postDelayed(new Runnable() {
				@Override
				public void run() {
					backPressed = false;
				}
			}, 2000);
		} else {
			Runtime.getRuntime().exit(0);
		}
	}

}
