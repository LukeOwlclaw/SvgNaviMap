package de.tuhh.ti5.androidsvgnavimap;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;

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
			if (file.exists()) {
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

	public static void copyFile(File sourceFile, File destFile)
			throws IOException {
		if (!destFile.exists()) {
			destFile.createNewFile();
		}

		FileChannel source = null;
		FileChannel destination = null;

		try {
			source = new FileInputStream(sourceFile).getChannel();
			destination = new FileOutputStream(destFile).getChannel();
			destination.transferFrom(source, 0, source.size());
		} finally {
			if (source != null) {
				source.close();
			}
			if (destination != null) {
				destination.close();
			}
		}
	}
	
	public static void deleteFolder(File folder) {
	    File[] files = folder.listFiles();
	    if(files!=null) { //some JVMs return null for empty dirs
	        for(File f: files) {
	            if(f.isDirectory()) {
	                deleteFolder(f);
	            } else {
	                f.delete();
	            }
	        }
	    }
	    folder.delete();
	}

}
