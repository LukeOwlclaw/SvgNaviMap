package ti5.dibusapp.navigation;

import android.webkit.WebSettings;
import android.webkit.WebView;

/**
 * This class wraps a webview to a custom webview, which supports svg javascript
 * injections.
 */
public class SvgWebView {
	private boolean mSized;

	final WebView mWebView;

	public WebView getWebView() {
		return mWebView;
	}

	/**
	 * Default constructor
	 *
	 */
	public SvgWebView(final WebView webView) {
		mWebView = webView;
		mSized = false;
	}

	/**
	 * Rescales the svg image.
	 */
	public final void svgRescale() {
		while (mWebView.zoomOut()) {
			// do nothing
		}
	}

	/**
	 * Reloads the svg page. IMPORTANT: call only where the svg webview is
	 * displayed in a window, because this function sized the webview window.
	 */
	public final void svgRefresh() {
		mSized = true;
		mWebView.clearCache(true);
		// this.webview.clearView();
		// this.webview.loadUrl(this.webview.getUrl());
		loadUrl("javascript:window.location.reload( true )");
	}

	public void loadUrl(String string) {
		mWebView.loadUrl(string);
	}
	
	public void loadData(String data, String mimeType, String encoding) {
		mWebView.loadData(data, mimeType, encoding);
	}

	/**
	 * Activates setting position.
	 */
	public final void svgPositionActivate() {
		loadUrl("javascript: Interface.position_activate();");
	}

	/**
	 * Deactivates setting position.
	 */
	public final void svgPositionDeactivate() {
		loadUrl("javascript: Interface.position_deactivate();");
	}

	/**
	 * Deletes the current position.
	 */
	public final void svgPositionDelete() {
		loadUrl("javascript: Interface.position_delete();");
	}

	/**
	 * Sets the position by hand for testing purpose.
	 * 
	 * @param latitude
	 *            the latitude of the position
	 * @param longitude
	 *            the longitude of the position
	 * @param altitude
	 *            the height of the position
	 */
	public final void svgCoordinateSet(final double latitude,
			final double longitude, final float altitude) {
		loadUrl("javascript: Interface.position_set(" + latitude + ","
				+ longitude + "," + altitude + ");");
	}

	/**
	 * Switches the svg to a level up.
	 */
	public final void svgLevelup() {
		loadUrl("javascript: Interface.levelup();");
	}

	/**
	 * Switches the svg to a level down.
	 */
	public final void svgLeveldown() {
		loadUrl("javascript: Interface.leveldown();");
	}

	/**
	 * Changes the javascript disabled adapted value.
	 * 
	 * @param disabledAdapted
	 *            the new disabled adapted value
	 */
	public final void svgRouteChangeDisabledAdapted(
			final boolean disabledAdapted) {
		loadUrl("javascript: Interface.route_changeDisabledAdapted("
				+ disabledAdapted + ");");
	}

	/**
	 * Enables routing.
	 */
	public final void svgRouteEnable() {
		loadUrl("javascript: Interface.route_enable();");
	}

	/**
	 * Disables routing.
	 */
	public final void svgRouteDisable() {
		loadUrl("javascript: Interface.route_disable();");
	}

	/**
	 * Deletes current route.
	 */
	public final void svgRouteDelete() {
		loadUrl("javascript: Interface.route_delete();");
	}

	/**
	 * Refreshes the rout (after refreshing location).
	 */
	public final void svgRouteRefresh() {
		loadUrl("javascript: Interface.route_refresh();");
	}

	/**
	 * Routes to a specifies position.
	 * 
	 * @param id
	 *            the destination id
	 */
	public final void svgRoute(int id) {
		loadUrl("javascript: Interface.route(" + id + ");");
	}

	/**
	 * Routes to a specifies position.
	 * 
	 * @param latitude
	 *            of the position
	 * @param longitude
	 *            of the position
	 * @param altitude
	 *            of the position
	 */
	public final void svgRouteGPS(final double latitude,
			final double longitude, final float altitude) {
		loadUrl("javascript: Interface.routeGPS(" + latitude + "," + longitude
				+ "," + altitude + ");");
	}

	/**
	 * Focuses the current position, if set.
	 * 
	 * Does only go to level of current position. Does not scroll, so that position becomes visible.
	 */
	public final void svgPositionFocus() {
		loadUrl("javascript: Interface.position_focus();");
	}

	/**
	 * Set current position by SVG coordinate.
	 */
    public final void svgPositionBySvg(double x, double y, int floor) {
        loadUrl("javascript: Interface.position_setSVG(" + x + ", " + y + ", "
                + floor + ");");
    }

    public final void svgPositionByID(int vertexid) {
        loadUrl("javascript: Interface.position_setID(" + vertexid + ");");
    }

	/**
	 * Demonstrate a walk.
	 */
	public final void svgDemowalk() {
		loadUrl("javascript: Interface.demowalk();");
	}

	/**
	 * Refreshes the site in case of an rotation of the android device.
	 */
	public final void svgRefreshRotate() {
		loadUrl("javascript: Interface.refresh_rotate();");
	}

	/**
	 * Give the javascript instructor a sign, that the webview is readyy.
	 */
	public final void svgInitTest() {
		loadUrl("javascript: Interface.init_test();");
	}

	/**
	 * Calculates the distance in meter from the current position to a poi, with
	 * the given id.
	 * 
	 * @param id
	 *            of the destination poi
	 */
	public final void svgDistanceToId(final int id) {
		loadUrl("javascript: Interface.distanceToId(" + id + ");");
	}

	/**
	 * Returns if the webview has been sized for an browser window.
	 * 
	 * @return if the webview has been sized yet
	 */
	public final boolean svgIsSized() {
		return mSized;
	}

	public WebSettings getSettings() {
		return mWebView.getSettings();
	}

    public void reload() {
        mWebView.reload();
    }

}
