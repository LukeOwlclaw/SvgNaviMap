package de.tuhh.ti5.androidsvgnavimap;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceActivity;
import android.preference.PreferenceManager;
import android.widget.Toast;
import android.R;

/* EditPreferences
 * 		Simple activity that just displays the preferences
 * 		nothing really different here */
public class PreferencesActivity extends PreferenceActivity {
	private SharedPreferences.OnSharedPreferenceChangeListener listener;
	private SharedPreferences sharePrefs;

	@Override
	public void onCreate(final Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// add preferences
		//addPreferencesFromResource(R.xml.preferences);

		sharePrefs = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
		sharePrefs.registerOnSharedPreferenceChangeListener(listener);
	}

	@Override
	protected void onDestroy() {
		sharePrefs.unregisterOnSharedPreferenceChangeListener(listener);
		
		 String msg = "hint: restart app.";
		 Toast.makeText(getApplicationContext(), msg,
					Toast.LENGTH_SHORT).show();
		 
		super.onDestroy();
	}
} // end class EditPreferences
