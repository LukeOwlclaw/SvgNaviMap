package james.weka.android;

import de.tuhh.ti5.androidsvgnavimap.MainActivity;
import james.weka.ClassifyResult;
import james.weka.WekaLocalService;
import james.weka.exception.InitializationException;
import james.weka.exception.WekaFormatException;
import james.weka.impl.WekaLocalUtil;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import de.tuhh.ti5.androidsvgnavimap.Logger;
import de.tuhh.ti5.androidsvgnavimap.SampleScanActivity;
import de.tuhh.ti5.androidsvgnavimap.Utils;

import org.apache.commons.io.FileUtils;

import android.app.Notification.Builder;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiManager;
import android.os.Binder;
import android.os.Environment;
import android.os.IBinder;
import android.os.Vibrator;
import android.preference.PreferenceManager;
import android.util.Log;

public class LocateService extends Service {

	private final IBinder mBinder = new LocateServiceBinder();

	private final String LOG_TAG = "LocateService";

	public static final String WEKA_LOCALIZARION_BROADCAST_INTENT = "weke_localization_broadcast";

	public static final String ROOM = "room";

	public static final String CONFIDENCE = "confidence";

	public static final String ALLPOSSIBILITIES = "propsSorted";

	private SharedPreferences sharedPref = null;

	private static boolean isClassifying = false;

	private WekaLocalService wekaLocal;

	private WifiManager wm = null;

	private Map<String, String> measurement;

	private static boolean initialized = false;

	private Runnable iniClassifier = null;

	private Runnable runClassify = null;

	private static String FILE_LAST_MODIFY = "file_last_modify";

	Builder notificationBuilder;

	private BroadcastReceiver wifiScanReceiver = null;
	
	private BroadcastReceiver createWifiScanReceiver() {
		return new BroadcastReceiver() {

			@Override
			public void onReceive(Context context, Intent intent) {
				// for testing only:
				// Vibrator v = (Vibrator)
				// getSystemService(Context.VIBRATOR_SERVICE);
				// v.vibrate(30);

				Log.w(LOG_TAG, "Get new wifi scan result and isClassifying is "
						+ isClassifying
						+ (isClassifying ? ", do nothing."
								: ", try to classify scan result."));
				
				wifiScanReceiver.goAsync();
				
				if (!isClassifying) {
					performOnBackgroundThread(runClassify);
				}

				StringBuffer wifiLogEntry = createLogEntryFromScanResult(wm
						.getScanResults());
				createWifiScanLogEntry(wifiLogEntry.toString());

				NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

				notificationBuilder.setContentTitle("Last log at: "
						+ getCurrentTimeStamp());
				notificationManager.notify(0, notificationBuilder.build());

			}
		};
	}

	public class LocateServiceBinder extends Binder {
		public LocateService getService() {
			return LocateService.this;
		}
	}

	@Override
	public void onCreate() {

    }
	
	/**
	 * This is a dirty workaround.
	 */
	public void stopScan() {
		if(wifiScanReceiver != null) {
			this.unregisterReceiver(wifiScanReceiver);
			wifiScanReceiver = null;
		}
	}

    public void scan() {
		// initilize the file or database here
		Log.i(LOG_TAG, "locateService scan");
		isClassifying = true;// set to true so that the receiver callback won't
								// work at begining
		initialized = false;
		IntentFilter wifiIntent = new IntentFilter();
		wifiIntent.addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);
		wifiIntent.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
		Log.i(LOG_TAG, "Register wifi scan receiver.");
		if(wifiScanReceiver != null)
			Log.e(LOG_TAG, "wifiscanreceiver created multiple times!");
		wifiScanReceiver = createWifiScanReceiver();
		this.registerReceiver(wifiScanReceiver, wifiIntent);
		sharedPref = PreferenceManager
				.getDefaultSharedPreferences(getApplicationContext());
		wm = (WifiManager) getSystemService(Context.WIFI_SERVICE);

		wekaLocal = new WekaLocalUtil();

		iniClassifier = new Runnable() {
			public void run() {
				initialize();
			}
		};

		runClassify = new Runnable() {
			public void run() {
				// start new classifying when not classifying last task and in
				// the delay time
				isClassifying = true;
				measurement = new HashMap<String, String>();
				if (!wm.isWifiEnabled()) {
					wm.setWifiEnabled(true);
					try {
						Thread.sleep(200);
					} catch (InterruptedException e) {
					}
				}
				if (!wm.isWifiEnabled()) {
					isClassifying = false;
					Log.w(LOG_TAG,
							"Service not available until wifi available, can't set available,do it manually.");
				} else {
					List<ScanResult> results = wm.getScanResults();
					for (ScanResult result : results) {
						measurement.put(result.BSSID,
								String.valueOf(Math.abs(result.level)));
					}
					classifyAndSend(measurement);
					try {
						Thread.sleep(WekaLocalService.CLASSIFY_INTERVAL);
					} catch (InterruptedException e) {
					}
					isClassifying = false;
				}
			}
		};

		if (!initialized) {
			performOnBackgroundThread(iniClassifier);
		}

	}

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		Log.i(LOG_TAG, "locateService started.");
		return START_STICKY;
	}

	@Override
	public void onDestroy() {
		Log.i(LOG_TAG, "locateService destroyed.");

		NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
		notificationManager.cancelAll();

		stopScan();
		

	}

	@Override
	public IBinder onBind(Intent intent) {
		Log.i(LOG_TAG, "locateService got bound.");

		// build notification
		Intent mainActivity = new Intent(this, MainActivity.class);
		PendingIntent pIntent = PendingIntent.getActivity(this, 0,
				mainActivity, 0);
		// the addAction re-use the same intent to keep the example short
		notificationBuilder = new Builder(this).setOngoing(true)
				.setContentTitle("WifiScans are being logged...")
				.setContentText("RssiLogger").setContentIntent(pIntent).setAutoCancel(false);
		NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
		notificationManager.notify(0, notificationBuilder.build());

		return mBinder;
	}

	private void broadcastResult(ClassifyResult result) {
		Intent broadcast = new Intent(WEKA_LOCALIZARION_BROADCAST_INTENT);
		broadcast.putExtra(ROOM, result.getClassLabel());
		broadcast.putExtra(CONFIDENCE, result.getConfidence());
		broadcast.putExtra(ALLPOSSIBILITIES,
				(Serializable) result.getPropsSorted());

		sendBroadcast(broadcast);
	}

	public static File getWorkDir() {
        return Utils.getSdDir("AndroidSvgNaviMap/rssi");
	}

	private File getOhrtArff() {
		return new File(getWorkDir(), "data.arff");
	}

	/**
	 * Initialize weka classifier with traning data or model(prior)
	 */
	private synchronized void initialize() {
		Log.i(LOG_TAG, "Try to initinalize classifier.");
		File origin = getOhrtArff();
		File modelFile = new File(getWorkDir(), WekaLocalService.MODEL);
		if (modelFile.exists() && FileUtils.sizeOf(modelFile) != 0) {
			Log.i(LOG_TAG, "Try to initialize with model file.");
			try {
				wekaLocal.initialize(modelFile, WekaLocalService.NONE);
				File structure = new File(getWorkDir(),
						WekaLocalService.STRUCTURE);
				if (structure.exists() && FileUtils.sizeOf(structure) != 0) {

					initialized = true;
					Log.i(LOG_TAG,
							"Enabling wifi scan result callback when initialized");
					isClassifying = false;// enable the wifi receiver callback
											// when initialized
				} else {
					initialized = false;
					Log.i(LOG_TAG,
							"File model file but no structe file to construct test data. Initialized is "
									+ initialized);
				}
			} catch (Throwable t) {
				initialized = false;
				Log.e(LOG_TAG, "The model file can't be parsed.", t);
				try {
					FileUtils.forceDelete(modelFile);
				} catch (IOException e) {
					Log.e(LOG_TAG, "Error deleting the model file.", e);
				}
			}
		} else if (origin.exists() && FileUtils.sizeOf(origin) != 0) {
			Log.i(LOG_TAG,
					"The size of original arff file "
							+ origin.getAbsolutePath() + " is "
							+ FileUtils.sizeOf(origin));
			long lastModify = origin.lastModified();
			long savedLastModify = sharedPref.getLong(FILE_LAST_MODIFY, 0l);
			Log.i(LOG_TAG, "The last modify date of rssi file is " + lastModify
					+ " and the saved last modify date is " + savedLastModify);
			File trainingArff = new File(getWorkDir(),
					WekaLocalService.TRAIN_ARFF);
			if ((lastModify > savedLastModify) || !trainingArff.exists()) {
				((WekaLocalUtil) wekaLocal).setDoGenerate(true);
				Log.i(LOG_TAG,
						"The orignal rssi file has been changed or training arff not exist. set doGenerate to true");
			}
			try {
				trainingArff = wekaLocal.prepareTrainingFile(origin);
				Log.i(LOG_TAG,
						"Save the last modify date of original rssi file.");
				sharedPref.edit()
						.putLong(FILE_LAST_MODIFY, origin.lastModified())
						.commit();
			} catch (WekaFormatException e) {
				initialized = false;
				Log.e(LOG_TAG, "The new format arff file can't be generated.",
						e);
			}
			if (trainingArff.exists()) {
                try {
                    Log.i(LOG_TAG, new Scanner(trainingArff).useDelimiter("\\A").next());
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                }
                try {
					int algorithm = Integer.parseInt(sharedPref.getString(
							"algorithms",
							String.valueOf(WekaLocalService.FAST_RANDOM_TREE)));
					Log.i(LOG_TAG, "The selected algorithms is " + algorithm);
					wekaLocal.initialize(trainingArff, algorithm);
					initialized = true;
					Log.i(LOG_TAG,
							"Enableing wifi scan result call back when initialized");
					isClassifying = false;// enable the wifi receiver callback
											// when initialized

					// for testing only:
					Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
					long[] pattern = { 0, 200, 100, 200, 100, 200 };
					v.vibrate(pattern, -1);

				} catch (WekaFormatException e) {
					initialized = false;
					Log.e(LOG_TAG, "The training dataset can't be parsed.", e);
				}
			}
		} else {
			Log.w(LOG_TAG,
					"Found no model file or training dataset, initialized is "
							+ initialized);
		}

	}

	private synchronized void classifyAndSend(Map<String, String> measurement) {
		if (!initialized) {
			initialize();// if not initialized, try to initialize classifier
							// every scan interval, which will now be 1min
		}
		if (initialized) {
			ClassifyResult result = null;
			File structure = new File(getWorkDir(), WekaLocalService.STRUCTURE);
			if (structure.exists() && FileUtils.sizeOf(structure) != 0) {
				try {
					wekaLocal.prepareTestFile(structure, measurement);
				} catch (WekaFormatException e) {
					Log.e(LOG_TAG,
							"The singel instance arff file can't be generated.",
							e);
					return;
				}
				try {
					Log.d(LOG_TAG,
							"Try to get classifyResut with prepared test_arff");
					result = wekaLocal.classify(new File(getWorkDir(),
							WekaLocalService.TEST_ARFF));
				} catch (WekaFormatException e) {
					Log.e(LOG_TAG,
							"The singel instance arff file can't be classified.",
							e);
					return;
				} catch (InitializationException e) {
					Log.e(LOG_TAG,
							"Classifier is not initialized. Will try to initialize in the next classificartion attempt.",
							e);
					initialized = false;
					return;
				}
				if (result != null) {
					Log.i(LOG_TAG, "ClassifyResult is " + result.toString());
					broadcastResult(result);
				}
			}
		} else {
			Log.w(LOG_TAG,
					"Classifier is still not initialized, doing nothing.");
		}
	}

	/**
	 * A function that create anther thread to run the task, so that the current
	 * UI is not blocked.
	 * 
	 * @param runnable
	 * @return
	 */
	private Thread performOnBackgroundThread(final Runnable runnable) {
		final Thread t = new Thread() {
			@Override
			public void run() {
				Log.i(LOG_TAG, "Starting a new thread for runnable ");
				try {
					runnable.run();
				} finally {

				}
			}
		};
		t.start();
		return t;
	}

	void createWifiScanLogEntry(String arffBag) {

		if (arffBag.trim().length() == 0) {
			Logger.d("NOT Creating logentry because it would be empty.");
		}

		Logger.d("Creating wifi scan logentry: " + arffBag);

		SharedPreferences sharedPref = PreferenceManager
				.getDefaultSharedPreferences(this.getApplicationContext());
		String logname = sharedPref
				.getString("wifiscanlogfile", "wifiscan.log");

		final File logfile = new File(getWorkDir(), logname);

		BufferedWriter bw = null;
		try {
			if (!logfile.exists())
				logfile.createNewFile();

			bw = new BufferedWriter(new FileWriter(logfile, true), 1024);
			bw.write(arffBag);

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

	public StringBuffer createLogEntryFromScanResult(List<ScanResult> l) {

		StringBuffer arffBag = new StringBuffer();
		arffBag.append(getCurrentTimeStamp() + ";");
		arffBag.append(System.currentTimeMillis() / 1000l + ";");
		for (Iterator<ScanResult> it = l.iterator(); it.hasNext();) {
			ScanResult sr = it.next();
			arffBag.append(sr.BSSID + "," + (sr.level) + ";");
		}
		arffBag.append("\n");
		return arffBag;
	}

	public String getCurrentTimeStamp() {
		SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");// dd/MM/yyyy
		Date now = new Date();
		String strDate = sdfDate.format(now);
		return strDate;
	}
}
