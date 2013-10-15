package de.tuhh.ti5.androidsvgnavimap;

import ti5.dibusapp.navigation.CustomJavaScriptHandler;
import ti5.dibusapp.navigation.SvgWebView;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Build;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

public class MainActivity extends Activity {

	private static final String LOGTAG = "MainActivity";

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
			Log.w(LOGTAG, "At least API 16 is required!");
		}

		mWebView.getWebView().setWebChromeClient(new WebChromeClient());

		CustomJavaScriptHandler js = new CustomJavaScriptHandler();
		mWebView.getWebView().addJavascriptInterface(js, "svgapp");

		mWebView.loadUrl("file:///android_asset/svgnavimap/android.html");
		// mWebView.loadUrl("file:///android_asset/first-office/android.html");

	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		// getMenuInflater().inflate(R.menu.main, menu);
		// return true;

		final MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.main, menu);

		menu.findItem(R.id.mapview_menu_levelup).setIcon(R.drawable.arrowup);
		menu.findItem(R.id.mapview_menu_leveldown)
				.setIcon(R.drawable.arrowdown);
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

}
