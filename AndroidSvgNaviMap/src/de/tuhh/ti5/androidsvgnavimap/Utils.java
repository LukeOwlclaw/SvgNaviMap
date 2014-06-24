package de.tuhh.ti5.androidsvgnavimap;

import java.io.File;

import android.os.Environment;
import android.util.Log;

public class Utils {

	public static File getSdDir(String directory) {
		if (!Environment.getExternalStorageState().equals(
				Environment.MEDIA_MOUNTED)) {
			return null;
		} else {
			File file = new File(Environment.getExternalStorageDirectory()
					+ File.separator + directory);
			if (file.exists()){
				if (!file.isDirectory()) {
					Log.w("Utils", "directory passed to getSdDir() is a file!");
					return null;
				} 
				
			} else {

					if (file.mkdirs() == false) {
						Log.w("Utils", "file.mkdirs() failed.");
						return null;
					} else
						file.mkdir();

				}
			return file;
		}
	}

}
