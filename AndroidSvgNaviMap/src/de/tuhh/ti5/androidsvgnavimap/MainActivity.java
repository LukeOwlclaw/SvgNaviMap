package de.tuhh.ti5.androidsvgnavimap;

import de.tuhh.ti5.androidsvgnavimap.util.FileUtils;
import james.weka.android.LocateService;
import ti5.dibusapp.navigation.CustomJavaScriptHandler;
import ti5.dibusapp.navigation.SvgWebView;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.os.IBinder;
import android.text.TextUtils;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.Toast;

import com.dm.zbar.android.scanner.ZBarConstants;
import com.dm.zbar.android.scanner.ZBarScannerActivity;

import net.sourceforge.zbar.Symbol;

import org.apache.commons.io.IOUtils;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

public class MainActivity extends Activity {

	private static final String LOGTAG = "MainActivity";

    private static final int ZBAR_SCANNER_REQUEST = 1;

	private SvgWebView mWebView;
    private boolean learnLocation = false;

    private int selectedNode;
    private boolean wekaRegistered = false;
    private boolean mIsBound = false;

    private SSIDMap map = new SSIDMap();

    @SuppressLint({ "NewApi", "SetJavaScriptEnabled" })
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		getWindow().requestFeature(Window.FEATURE_PROGRESS);
		setContentView(R.layout.activity_main);

		// ============== custom ===============

		// use up-button
		getActionBar().setDisplayHomeAsUpEnabled(true);

		mWebView = new SvgWebView((WebView) findViewById(R.id.webView1));
		mWebView.getSettings().setJavaScriptEnabled(true);

		mWebView.getSettings().setBuiltInZoomControls(true);

		mWebView.getSettings().setUseWideViewPort(true);
		mWebView.getSettings().setSupportZoom(true);
		mWebView.getWebView().setInitialScale(0);

		String ua = "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.4) Gecko/20100101 Firefox/4.0";
		mWebView.getSettings().setUserAgentString(ua);

		// // websettings.setEnableSmoothTransition(true);

		if (Build.VERSION.SDK_INT >= VERSION_CODES.JELLY_BEAN) {
			mWebView.getSettings().setAllowUniversalAccessFromFileURLs(true);
		} else {
			String msg = "At least API 16 is required!";
			Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_LONG)
					.show();
			Log.w(LOGTAG, msg);
		}

		mWebView.getWebView().setWebChromeClient(new WebChromeClient());

		CustomJavaScriptHandler js = new CustomJavaScriptHandler(this);
		mWebView.getWebView().addJavascriptInterface(js, "svgapp");

//        mWebView.loadUrl(new File(getDir("html", MODE_PRIVATE), "android.html").toURI().toString());
        File startHtml = new File(getDir("html", MODE_PRIVATE), "android.html");
        if(startHtml.exists()) {
            mWebView.loadUrl(startHtml.toURI().toString());
        }
        else {
        	String html_value = "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=iso-8859-1\"><title>Load SvgNaviMap application</title></head><body style=\"width:300px; color: #00000; \"><br><br><br><p>Please launch SvgNaviMap server and scan shown QR code using scan button to download SvgNaviMap application files.</p></body></html>";
//        	mWebView.loadUrl("<html>Please launch SvgNaviMap server and scan shown QR code using scan button to download SvgNaviMap application files.</html>");
        	mWebView.loadData(html_value, "text/html", "UTF-8");
        }
        js.addInstructor(new CustomJavaScriptHandler.JSInstructor() {
            @Override
            public void jsinstruct(String s) {
                String parts[] = s.split(":");
                if (parts[0].equals("position")) {
                    nodeSelected(Integer.valueOf(parts[1]));
                }
            }
        });

        toggleWekaService();

        //mWebView.loadUrl("file:///android_asset/svgnavimap/android.html");
        //mWebView.loadUrl("http://10.0.0.110:8888/android.html");

		// mWebView.loadUrl("file:///android_asset/svgnavimap/data/stoneridge_gif1.svg");
		// mWebView.loadUrl("file:///android_asset/svgnavimap/data/stoneridge_gif1.svg");
		// mWebView.loadUrl("file:///android_res/raw/svgnavimap/android.html");
	}

    private void nodeSelected(int nodeid) {
        if (!learnLocation) {
            return;
        }

        selectedNode = nodeid;

        Log.i(LOGTAG, String.format("selected id: %d", selectedNode));

        wifiScan(nodeid);
    }

    private void wifiScan(final int nodeid) {
        Log.i(LOGTAG, "Preparing Wifi scan");
        final WifiManager wifiManager = (WifiManager) getSystemService(Context.WIFI_SERVICE);

        Log.i(LOGTAG, "Checking Wifi status");
        if (!wifiManager.isWifiEnabled()) {
            Log.i(LOGTAG, "Enabling Wifi");
            wifiManager.setWifiEnabled(true);

            while (!wifiManager.isWifiEnabled()) {
                Log.i(LOGTAG, "Waiting for Wifi...");
                try {
                    Thread.sleep(50);
                } catch (InterruptedException ignored) {

                }
            }
        } else {
            Log.i(LOGTAG, "Wifi already enabled");
        }

        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION);

        final BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.i(LOGTAG, "Received scan result");
                List<ScanResult> scanResults = wifiManager.getScanResults();

                for (ScanResult result : scanResults) {
                    Log.i(LOGTAG, String.format("%s: %d", result.BSSID, result.level));
                }

                map.addScanResult(nodeid, scanResults);
                toast("learned wifi fingerprint for room " + nodeid);
                
                unregisterReceiver(this);
            }

			
        };

        if (nodeid >= 0) {
            Log.i(LOGTAG, "Registering result handler");
            registerReceiver(receiver, intentFilter);
        }

        Log.i(LOGTAG, "Starting Wifi scan");
        boolean success = wifiManager.startScan();
        Log.i(LOGTAG, String.format("%s", success));
    }

    public void  launchQRScanner() {
        if (isCameraAvailable()) {
            Intent intent = new Intent(MainActivity.this, ZBarScannerActivity.class);
            int[] modes = {Symbol.QRCODE};
            intent.putExtra(ZBarConstants.SCAN_MODES, modes);
            startActivityForResult(intent, ZBAR_SCANNER_REQUEST);
        } else {
            Toast.makeText(this, "Rear Facing Camera Unavailable", Toast.LENGTH_SHORT).show();
        }
    }

    public boolean isCameraAvailable() {
        PackageManager pm = getPackageManager();
        return pm.hasSystemFeature(PackageManager.FEATURE_CAMERA);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        switch (requestCode) {
            case ZBAR_SCANNER_REQUEST:
                if (resultCode == RESULT_OK) {
                    handleScanResult(String.valueOf(data.getStringExtra(ZBarConstants.SCAN_RESULT)));
                } else if(resultCode == RESULT_CANCELED && data != null) {
                    String error = data.getStringExtra(ZBarConstants.ERROR_INFO);
                    if(!TextUtils.isEmpty(error)) {
                        Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
                    }
                }
                break;
        }
    }

    private void handleScanResult(String data) {
    	
    	
        final String[] dataParts = data.split(",", 2);

        try {
            if (dataParts.length != 2) {
                throw new InvalidQRCode();
            }

            final String mode = dataParts[0];
            final URL url = new URL(dataParts[1]);

            if (mode.equals("app")) {
            	toast("QR code scanned successfully. Downloading SvgNaviMap application... Please wait!", true);
                handleAppUpdate(url);
            } else if (mode.equals("map")) {
            	toast("QR code scanned successfully. Downloading SvgNaviMap project data...", true);
                handleMapDownload(url);
            } else {
                throw new InvalidQRCode();
            }
        } catch (InvalidQRCode invalidQRCode) {
            Toast.makeText(this, "Invalid QRCode", Toast.LENGTH_SHORT).show();
        } catch (MalformedURLException e) {
            Toast.makeText(this, "Invalid QRCode (malformed url)", Toast.LENGTH_SHORT).show();
        }
    }

    

	private void handleAppUpdate(URL url) {
        new FileRetriever(url, new File(getCacheDir(), "app.zip")).execute();
    }

    private void handleMapDownload(URL url) {
        new FileRetriever(url, new File(getCacheDir(), "map.zip")).execute();
    }

    @Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		// getMenuInflater().inflate(R.menu.main, menu);
		// return true;

		final MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.main, menu);

		return super.onCreateOptionsMenu(menu);
	}

	int posSetCount = 0;
	int destSetCount = 0;

	@Override
	public final boolean onOptionsItemSelected(final MenuItem item) {
		switch (item.getItemId()) {
		case R.id.mapview_menu_locate:
            if (learnLocation) {
                toggleLearnLocation();
                
                try {
                    map.saveToFile(new File(getDir("rssi", MODE_PRIVATE), "data.arff"));
                } catch (IOException e) {
                    e.printStackTrace();
                }
                
            }

            locateService.scan();
            wifiScan(-1);
			return true;
		case R.id.mapview_menu_setpos:
			if(learnLocation)
				locateService.stopScan();
            toggleLearnLocation();
			return true;
		case R.id.mapview_menu_levelup:
			getWebview().svgLevelup();
			return true;
		case R.id.mapview_menu_leveldown:
			getWebview().svgLeveldown();
			return true;
		case R.id.mapview_menu_navigate:

			switch (destSetCount) {
			case 0:
				getWebview().svgRoute(115); // fixed destination.
				// (JC Penny, upper level)
				break;
			case 1:
				getWebview().svgRoute(144);
				break;
			case 2:
				getWebview().svgRoute(102);
				break;
			case 3:
				getWebview().svgRoute(113);
				break;
			case 4:
				getWebview().svgRoute(60); // fixed destination.
				destSetCount = -1;
				break;
			}
			destSetCount++;
			return true;
        case R.id.scan_qr:
            launchQRScanner();
            return true;
        case android.R.id.home: // button upper left
            onBackPressed();
            return true;
		default:
			return super.onOptionsItemSelected(item);

		}
	}

    private void toggleLearnLocation() {
        learnLocation = !learnLocation;
        if (learnLocation) {
        	Toast.makeText(this, "Learn mode activated.", Toast.LENGTH_SHORT).show();
            getWebview().svgPositionActivate();
        } else {
        	Toast.makeText(this, "Learn mode deactivated.", Toast.LENGTH_SHORT).show();
            getWebview().svgPositionDeactivate();
        }
    }

    private SvgWebView getWebview() {
		return mWebView;
	}

    protected void fileDownloaded(File file) {
        if (file == null) {
            Toast.makeText(this, "Download error", Toast.LENGTH_SHORT).show();
        } else if (file.getName().equals("app.zip")) {
            File htmlDir = getDir("html", MODE_PRIVATE);

            try {
                FileUtils.unzip(file, htmlDir);
                file.delete();
            } catch (IOException e) {
                Log.e(LOGTAG, e.getMessage());
                Toast.makeText(this, "Unzip error", Toast.LENGTH_SHORT).show();
            }

            
            File startHtml = new File(htmlDir, "android.html");
            mWebView.loadUrl(startHtml.toURI().toString());            
        } else if (file.getName().equals("map.zip")) {
            File dataDir = getDir("data", MODE_PRIVATE);

            try {
                FileUtils.unzip(file, dataDir);
                file.delete();
            } catch (IOException e) {
                Log.e(LOGTAG, e.getMessage());
                Toast.makeText(this, "Unzip error", Toast.LENGTH_SHORT).show();
            }

            mWebView.reload();
        } else {
            Toast.makeText(this, "Download successful", Toast.LENGTH_SHORT).show();
        }
    }

    private LocateService locateService = null;

    private ServiceConnection mConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {
            locateService = ((LocateService.LocateServiceBinder) service)
                    .getService();
            Log.i(LOGTAG, "bound");
            mIsBound = true;

        }

        @Override
        public void onServiceDisconnected(ComponentName className) {
            locateService = null;

            mIsBound = false;
        }

    };

    private void doBindService() {
        bindService(new Intent(this, LocateService.class),
                mConnection, Context.BIND_AUTO_CREATE);
    }

    private void doUnbindService() {
        if (mIsBound) {
            // Detach our existing connection.
            unbindService(mConnection);
        }
    }

    public void toggleWekaService() {
        Log.i(LOGTAG, "toggleWeka pressed");
        if (!wekaRegistered) {
            Log.i(LOGTAG, "weka service broadcast receiver is not registered, try to register it.");
            registerReceiver(wekaReceiver, new IntentFilter(
                    LocateService.WEKA_LOCALIZARION_BROADCAST_INTENT));
            wekaRegistered = true;

            if (!mIsBound) {
                Log.i(LOGTAG, "binding service and try to get classification result.");
                doBindService();
            } else {
                Log.i(LOGTAG, "service already bound, do nothing but wait for classification result from service.");
            }
        } else {
            Log.i(LOGTAG, "Weka service broadcast receiver is registered, so try unregister it.");
            unregisterReceiver(wekaReceiver);
            wekaRegistered = false;

            if (locateService != null) {
                Log.i(LOGTAG, "unbinding service.");
                doUnbindService();
            } else {
                Log.i(LOGTAG, "service not bound.");
            }
        }
    }

    private BroadcastReceiver wekaReceiver = new BroadcastReceiver() {
        private static final String LOG_TAG = "Weka_receiver";

        @Override
        public void onReceive(Context context, Intent intent) {
            String room = intent.getExtras().getString(LocateService.ROOM);
            double confidence = intent.getExtras().getDouble(LocateService.CONFIDENCE);
            Log.i(LOG_TAG, "Get new classifcation result : Room " + room + "(" + confidence + ")");
            toast("You are here");
            getWebview().svgPositionByID(Integer.valueOf(room.replace("vertex_", "")));
        }
    };

    private class InvalidQRCode extends Throwable {

    }

    private class FileRetriever extends AsyncTask<Void, Void, File> {
        URL downloadUrl;
        File outputFile;

        public FileRetriever(URL url, File outFile) {
            downloadUrl = url;
            outputFile = outFile;
        }

        protected File doInBackground(Void... args) {
            try {
                InputStream is = downloadUrl.openStream();
                FileOutputStream outputStream = new FileOutputStream(outputFile);

                IOUtils.copy(new DataInputStream(is), outputStream);

                return this.outputFile;
            } catch (IOException e) {
                e.printStackTrace();
            }

            return null;
        }

        protected void onPostExecute(File file) {
            fileDownloaded(file);
        }
    }
    
    private void toast(String string) {
    	Toast.makeText(this, string, Toast.LENGTH_SHORT).show();		
	}
    
    private void toast(String string, boolean alwaysLong) {
    	Toast.makeText(this, string, Toast.LENGTH_LONG).show();			
	}
}
