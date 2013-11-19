package de.tuhh.ti5.androidsvgnavimap;

import de.tuhh.ti5.androidsvgnavimap.util.FileUtils;
import ti5.dibusapp.navigation.CustomJavaScriptHandler;
import ti5.dibusapp.navigation.SvgWebView;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
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

public class MainActivity extends Activity {

	private static final String LOGTAG = "MainActivity";

    private static final int ZBAR_SCANNER_REQUEST = 1;

	private SvgWebView mWebView;

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

        mWebView.loadUrl(new File(getDir("html", MODE_PRIVATE), "android.html").toURI().toString());

        //mWebView.loadUrl("file:///android_asset/svgnavimap/android.html");
        //mWebView.loadUrl("http://10.0.0.110:8888/android.html");

		// mWebView.loadUrl("file:///android_asset/svgnavimap/data/stoneridge_gif1.svg");
		// mWebView.loadUrl("file:///android_asset/svgnavimap/data/stoneridge_gif1.svg");
		// mWebView.loadUrl("file:///android_res/raw/svgnavimap/android.html");
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
                handleAppUpdate(url);
            } else if (mode.equals("map")) {
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

		menu.findItem(R.id.mapview_menu_levelup).setIcon(R.drawable.arrowup);
		menu.findItem(R.id.mapview_menu_leveldown).setIcon(R.drawable.arrowdown);
		menu.findItem(R.id.mapview_menu_navigate).setIcon(R.drawable.navigate);
		menu.findItem(R.id.mapview_menu_locate).setIcon(R.drawable.locate);
		menu.findItem(R.id.mapview_menu_setpos).setIcon(R.drawable.compass);

		return super.onCreateOptionsMenu(menu);
	}

	int posSetCount = 0;
	int destSetCount = 0;

	@Override
	public final boolean onOptionsItemSelected(final MenuItem item) {
		switch (item.getItemId()) {
		case R.id.mapview_menu_locate:
			getWebview().svgPositionFocus();
			return true;
		case R.id.mapview_menu_setpos:

			switch (posSetCount) {
			case 0:
				getWebview().svgPositionBySvg(200, 400, 0);
				break;
			case 1:
				getWebview().svgPositionBySvg(312.4863600935308,
						433.6749805144193, 0);
				break;
			case 2:
				getWebview().svgPositionBySvg(340.5300077942323,
						265.41309431021045, 0);
				break;
			case 3:
				getWebview().svgPositionBySvg(269.25331254871395,
						243.13172252533124, 1);
				break;
			case 4:
				getWebview().svgPositionBySvg(305.42166796570535,
						407.8986749805144, 1);
				posSetCount = -1;
				break;
			}
			posSetCount++;
			getWebview().svgPositionFocus();

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

            mWebView.loadUrl(new File(htmlDir, "android.html").toURI().toString());
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
}
