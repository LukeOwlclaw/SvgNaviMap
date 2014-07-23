package james.weka.impl;

import hr.irb.fastRandomForest.FastRandomForest;
import james.weka.ClassifyResult;
import james.weka.WekaLocalService;
import james.weka.exception.InitializationException;
import james.weka.exception.WekaFormatException;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FileUtils;

import weka.classifiers.bayes.NaiveBayes;
import weka.classifiers.lazy.IBk;
import weka.classifiers.meta.Vote;
import weka.classifiers.trees.RandomForest;
import weka.core.Instances;
import weka.core.Utils;
import weka.core.converters.ConverterUtils.DataSource;
import android.util.Log;

public class WekaLocalUtil implements WekaLocalService {

	private Transformer t;
	private ClassfierUtils classifierUtils;

	private final String LOG_TAG = "WekaLocalUtil";

	private List<String> BSSIDList = null;

	private static boolean doGenerate = false;

	public WekaLocalUtil() {
		t = new Transformer();
		t.setMiisingValue(MISSING_VALUE);
		t.setTestDataPct(0);// This generates a arff file without data for test

		classifierUtils = new ClassfierUtils();

		BSSIDList = new ArrayList<String>();
	}

	public void setDoGenerate(boolean b) {
		doGenerate = b;
	}

	@Override
	public File prepareTrainingFile(File rowData) throws WekaFormatException {
		try {
			t.readFile(rowData);
		} catch (Exception e) {
			throw new WekaFormatException("File " + rowData.getName()
					+ " can not be parsed.", e);
		}
		File out = new File(rowData.getParent(), TRAIN_ARFF);
		try {
			BSSIDList.addAll(t.getBSSIDList());
			Log.i(LOG_TAG,
					"Whether generatding test.arff depend on doGeneate, and doGenerate is "
							+ doGenerate);
			if (doGenerate) {
				Log.i(LOG_TAG,
						"doGenerate is true, generate new train.arff and struct.arff.");
				t.transform(out, new File(rowData.getParent(), STRUCTURE));
			}
		} catch (Exception e) {
			throw new WekaFormatException("New file can't be generated.", e);
		}
		return out;
	}

	@Override
	public ClassifyResult classify(File singelSampleFile)
			throws WekaFormatException, InitializationException {
		if (classifierUtils.getClassifier() == null) {
			throw new InitializationException(
					"Classifier is not yet initialized.");
		}
		try {
			DataSource testDataSource = new DataSource(
					singelSampleFile.getAbsolutePath());
			Instances testData = testDataSource.getDataSet();
			if (testData.classIndex() == -1)
				testData.setClassIndex(testData.numAttributes() - 1);
			return classifierUtils.classifiy(testData.firstInstance());
		} catch (Exception e) {
			throw new WekaFormatException("The file can not be parsed.", e);
		}
	}

	@Override
	public File prepareClassifierModel(String workDir)
			throws InitializationException {
		File modelFile = new File(workDir, MODEL);
		try {
			classifierUtils.getModel(modelFile);
		} catch (Throwable e) {
			throw new InitializationException(
					"Classifier can't be written to model file.", e);
		}
		return modelFile;
	}

	@Override
	public File prepareTestFile(final File structure,
			Map<String, String> instance) throws WekaFormatException {
		File testFile = new File(structure.getParent(), TEST_ARFF);
		try {
			FileUtils.copyFile(structure, testFile);
		} catch (IOException e) {
			throw new WekaFormatException(
					"Test data file can't be created or overwritten.");
		}
		Log.d(LOG_TAG, "The size of BSSIDList is " + BSSIDList.size());
		InstanceParser p = new InstanceParser(BSSIDList);
		String instanceString = p.parse(instance);
		Log.d(LOG_TAG, "The instanceString is " + instanceString);
		try {
			FileUtils.write(testFile, instanceString, true);
		} catch (IOException e) {
			throw new WekaFormatException(
					"New measurement can't be add to structure");
		}
		return testFile;
	}

	@Override
	public void initialize(File trainingFile, int algorithm)
			throws WekaFormatException {
		if (trainingFile.getName().equalsIgnoreCase(MODEL)) {
			File structure = new File(trainingFile.getParent(),
					WekaLocalService.STRUCTURE);
			if (!structure.exists()) {
				throw new WekaFormatException(
						"Structure file is not prepared, can't use model file");
			}
			try {
				Log.i(LOG_TAG, "Using " + trainingFile.getAbsolutePath()
						+ " as model.");
				classifierUtils.setClassifierFromModel(trainingFile);
			} catch (Exception e) {
				throw new WekaFormatException("Model file can't be parsed.", e);
			}
			try {
				classifierUtils.setTrainingDataFile(structure);
			} catch (Exception e) {
				throw new WekaFormatException("structure data can't be parsed",
						e);
			}
		} else {
			Log.i(LOG_TAG,
					"Find training data set, try to initialize classifier with it.");
			try {
				classifierUtils.setTrainingDataFile(trainingFile);
				Log.d(LOG_TAG, "Setting training data file finished.");
				String optionString;
				switch (algorithm) {
				case WekaLocalService.VOTE:
					Log.i(LOG_TAG, "Building vote classifier.");
					optionString = "-S 1 -R MAX -B \"hr.irb.fastRandomForest.FastRandomForest -I 20 -K 0 -S 1\" -B \"weka.classifiers.lazy.IBk -K 10 -W 0 -A \\\"weka.core.neighboursearch.KDTree -A \\\\\\\"weka.core.EuclideanDistance -R first-last\\\\\\\"\\\"\" -B \"weka.classifiers.bayes.NaiveBayes \" ";
					classifierUtils.setClassifier(Vote.class,
							Utils.splitOptions(optionString));
					break;

				case WekaLocalService.RANDOM_TREE:
					Log.i(LOG_TAG, "Building random tree classifier.");
					optionString = "-I 20 -K 0 -S 1";
					classifierUtils.setClassifier(RandomForest.class,
							Utils.splitOptions(optionString));
					break;

				case WekaLocalService.NAIVE_BAYES:
					Log.i(LOG_TAG, "Building naive bayes classifier.");
					optionString = "";
					classifierUtils.setClassifier(NaiveBayes.class,
							Utils.splitOptions(optionString));
					break;

				case WekaLocalService.KNN:
					Log.i(LOG_TAG,
							"Building k nearest neightbourhood classifier.");
					optionString = "-K 10 -W 0 -A \"weka.core.neighboursearch.KDTree -S -A \\\"weka.core.EuclideanDistance -R first-last\\\"\"";
					classifierUtils.setClassifier(IBk.class,
							Utils.splitOptions(optionString));
					break;

				case WekaLocalService.FAST_RANDOM_TREE:
				default:// fast random tree
					Log.i(LOG_TAG, "Building random tree classifier.(default)");
					optionString = "-I 20 -K 0 -S 1";
					classifierUtils.setClassifier(FastRandomForest.class,
							Utils.splitOptions(optionString));
				}
				Log.i(LOG_TAG,
						"Classifier initializing finished. Model build time is "
								+ classifierUtils.getBuildModelTime());
			} catch (Exception e) {
				throw new WekaFormatException("Training data can't be parsed",
						e);
			}
			// We also try to create the model file in the smartphone, but it
			// fails to serializs in most smartphone
			// Log.i(LOG_TAG,"Try to save the classifier to file "
			// +WekaLocalService.MODEL);
			// try {
			// classifierUtils.getModel(new
			// File(trainingFile.getParent(),WekaLocalService.MODEL));
			// } catch (Throwable e) {
			// Log.e(LOG_TAG,"Error saving the classifier model with name "
			// +WekaLocalService.MODEL+",abandon saving model,move on.",e);
			// }
		}
	}

	@Override
	public List<String> getAttrList(File structure) throws WekaFormatException {
		BSSIDList.clear();
		try {
			List<String> lines = FileUtils.readLines(structure);
			for (String line : lines) {
				if (line.startsWith("@attribute")) {
					String[] part = line.split(" ");
					if (!"ROOM".equalsIgnoreCase(part[1])) {
						BSSIDList.add(part[1]);
						Log.d(LOG_TAG, "Find one BSSID from structure file - "
								+ part[1]);
					}
				}
			}
		} catch (IOException e) {
			throw new WekaFormatException("structure file "
					+ structure.getName() + " cannot be parsed.");
		}
		return BSSIDList;
	}

}
