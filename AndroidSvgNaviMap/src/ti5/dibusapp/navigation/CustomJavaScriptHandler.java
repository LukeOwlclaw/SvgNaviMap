package ti5.dibusapp.navigation;

import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.util.Log;

/**
 * This class enables the communication between javascript and android java.
 * 
 * @author Christian
 */
public class CustomJavaScriptHandler {
	private static final String TAG = "CustomJavaScriptHandler";

	/**
	 * Where to send the instructions.
	 */
	private List<JSInstructor> instructors;

	private Context context;

	/**
	 * Initializes the handler.
	 */
	public CustomJavaScriptHandler(Context ctx) {
		this.instructors = new ArrayList<CustomJavaScriptHandler.JSInstructor>();
		context = ctx;
	}

	/**
	 * A entry function for javascript.
	 * 
	 * @param s
	 *            any kind of parameter
	 */
	public final void instruct(final String s) {
		if (this.instructors.isEmpty()) {
			Log.i("CustomJavaScriptHandler", "instructors is empty, instruct: "
					+ s);
			return;
		}
		if (s == null) {
			Log.e("CustomJavaScriptHandler", "Instruction is null!");
			return;
		}

		Log.d("CustomJavaScriptHandler", "Instruction: " + s);
		for (JSInstructor instructor : instructors) {
			instructor.jsinstruct(s);
		}

	}

	/**
	 * Function for JS to return value back to Android
	 * 
	 * @param name
	 *            a name (from javascript)
	 * @param value
	 *            a value (from javascript)
	 */
	@SuppressWarnings({ "static-method", "unused" })
	public final void return_value(final String name, final String value) {
		Log.d("CustomJavaScriptHandler", "Received variable " + name
				+ " with content: " + value);

		if (name.equals("position")) {
			JSONObject position;
			try {
				position = new JSONObject(value);

				String xpos = position.getString("xpos");
				String ypos = position.getString("ypos");
				String svgid = position.getString("svgid");

				double x = Double.parseDouble(xpos);
				double y = Double.parseDouble(ypos);
				float id = Float.parseFloat(svgid);

				// TODO: @christian why(avoid loop)?
				// VolatilePreferences.getControllerForView().setPosition(x, y,
				// id);

				Log.e("CustumJavaScriptHandler",
						"NOT: Set position after js response");

			} catch (JSONException e) {
				e.printStackTrace();
			}

			return;
		}

		try {
			JSONArray jsonArray = new JSONArray(value);

			if (name.equals("poiArray")) {

				// TODO store jsonArray in model.

				// JSONObject poiJsonArray = jsonArray.optJSONObject(3);
				// int id = poiJsonArray.getInt("id");
				// String s = poiJsonArray.getString("short");
				// String ls = poiJsonArray.getString("long");

			} else {
				Log.w("CustomJavaScriptHandler",
						"Received return value with unknown name.");
			}

		} catch (JSONException e) {
			Log.i("CustomJavaScriptHandler", "Could not parse " + name, e);
		}

	}

	/**
	 * Adds a instructor.
	 * 
	 * @param instructor
	 *            where to send javascript messages
	 */
	public void addInstructor(final JSInstructor instructor) {
		if (instructor == null) {
			throw new IllegalArgumentException(
					"CustomJavaScriptHandler.CustomJavaScriptHandler: instructoris null");
		}
		if (this.instructors.contains(instructor)) {
			Log.w("CustomJavaScriptHandler",
					"Adding an instructor existing already in the list.");
		}

		this.instructors.add(instructor);

	}

	/**
	 * Removes a instructor.
	 * 
	 * @param instructor
	 *            the instructor to remove
	 */
	public void removeInstructor(final JSInstructor instructor) {
		while (this.instructors.remove(instructor)) {
			// do nothing
		}
	}

	/**
	 * A interface, which handles javascript messages.
	 */
	public interface JSInstructor {
		/**
		 * Handle javascript messages.
		 * 
		 * @param s
		 *            the javascript messages
		 */
		public void jsinstruct(final String s);
	}

	public File getProjectDir() {
		return context.getDir("data", Context.MODE_PRIVATE);
	}

	public String getProjectDirPath() {
		Log.d(TAG, "getProjectDirPath() called");
		return getProjectDir().toURI().toString();
	}

	public String getProjectXML() {
		Log.d(TAG, "getProjectXML() called");
		
		File[] xmlFiles = getProjectDir().listFiles(new FilenameFilter() {
            public boolean accept(File dir, String name) {
                return name.toLowerCase().endsWith(".xml");
            }
        });
		
		if(xmlFiles.length != 1) {
			Log.e(TAG, "project file not found. there are "+ xmlFiles.length + " xml files.");
			return "";
		}
		File projectFile = xmlFiles[0];
		try {
			Log.d(TAG, "reading project file " + projectFile.getAbsolutePath());
			return IOUtils.toString(new FileInputStream(projectFile));
		} catch (IOException e) {
			Log.e(TAG, "project file not found");
			return "";
		} 
	}
}
