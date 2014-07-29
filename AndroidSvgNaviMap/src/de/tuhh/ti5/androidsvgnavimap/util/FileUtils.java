package de.tuhh.ti5.androidsvgnavimap.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.apache.commons.io.IOUtils;

public class FileUtils {

	public static void unzip(File zipFile, File targetDir) throws IOException {
		FileInputStream inputStream = new FileInputStream(zipFile);
		ZipInputStream zipInputStream = new ZipInputStream(
				new BufferedInputStream(inputStream));
		targetDir.mkdirs();
		try {
			ZipEntry zipEntry;
			while ((zipEntry = zipInputStream.getNextEntry()) != null) {
				File targetFile = new File(targetDir, zipEntry.getName());
				targetFile.getParentFile().mkdirs();

				IOUtils.copy(zipInputStream, new FileOutputStream(targetFile));
			}
		} finally {
			zipInputStream.close();
		}
	}
}
