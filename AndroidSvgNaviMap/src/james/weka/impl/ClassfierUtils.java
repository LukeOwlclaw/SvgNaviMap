package james.weka.impl;

import james.weka.ClassifyResult;
import james.weka.exception.InitializationException;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.TreeMap;

import weka.classifiers.Classifier;
import weka.classifiers.Evaluation;
import weka.classifiers.meta.Vote;
import weka.classifiers.misc.SerializedClassifier;
import weka.core.Attribute;
import weka.core.Instance;
import weka.core.Instances;
import weka.core.SerializationHelper;
import weka.core.converters.ArffSaver;
import weka.core.converters.ConverterUtils.DataSource;
import weka.filters.Filter;
import android.util.Log;

public class ClassfierUtils {

	private DataSource trainSource = null;
	private Instances trainData = null;
	private DataSource testSource = null;
	private Instances testData = null;
	private Evaluation evaluation = null;
	private Attribute classLabels = null;
	private Classifier classifier = null;
	private long buildModelStart = 0l;
	private long buildModelElapsed = 0l;
	private List<Filter> filterList = new ArrayList<Filter>();
	private static ArffSaver saver;

	public ClassfierUtils() {
		try{
		saver = new ArffSaver();
		} catch (Exception ex) {
			Log.w(LOG_TAG, "internal weka error", ex);
		} catch (Throwable ex) {
			Log.w(LOG_TAG, "internal weka error", ex);
		}
	}
	
	private final String LOG_TAG = "ClassfierUtils";

	public Evaluation getEvaluation() {
		return evaluation;
	}

	public Attribute getClassLabels() {
		return classLabels;
	}

	public Classifier getClassifier() {
		return classifier;
	}

	public Instances getTestData() {
		return testData;
	}

	public void addFilter(Filter filter) {
		filterList.add(filter);
	}

	public void setTrainingDataFile(File inputDataFile) throws Exception {
		Log.d(LOG_TAG,
				"Try to set traniningd data File " + inputDataFile.getName());
		trainSource = new DataSource(inputDataFile.getAbsolutePath());
		Log.d(LOG_TAG, "Get dataSource from input file.");
		trainData = trainSource.getDataSet();
		if(trainData == null) {
			throw new Exception("Reading train dataset from " + inputDataFile.getAbsolutePath()+ " failed.");			
		}
		Log.d(LOG_TAG, "Get dataSet from dataSource.");
		if (trainData.classIndex() == -1)
			trainData.setClassIndex(trainData.numAttributes() - 1);
		Log.d(LOG_TAG, "Set class label index");
		classLabels = trainData.classAttribute();
		Log.d(LOG_TAG, "Get class labels");
		Log.d(LOG_TAG, " The size of filterList is " + filterList.size());
		if (filterList.size() > 0) {
			for (Filter filter : filterList) {
				filter.setInputFormat(trainData);
				trainData = Filter.useFilter(trainData, filter);
			}
		}
	}

	public void setTestingDataFile(File testDataFile) throws Exception {
		testSource = new DataSource(testDataFile.getAbsolutePath());
		testData = testSource.getDataSet();
		if (testData.classIndex() == -1)
			testData.setClassIndex(testData.numAttributes() - 1);
		if (filterList.size() > 0) {
			for (Filter filter : filterList) {
				filter.setInputFormat(testData);
				testData = Filter.useFilter(testData, filter);
			}
		}
	}

	public void setClassifier(Class<? extends Classifier> wekaClassifierClass,
			String[] options) throws Exception {
		classifier = wekaClassifierClass.newInstance();
		classifier.setOptions(options);
		buildModelStart = System.currentTimeMillis();
		classifier.buildClassifier(trainData);
		buildModelElapsed = System.currentTimeMillis() - buildModelStart;
	}

	public void evaluate() throws Exception {
		if (testData == null) {
			// Test data is not defined, use original training data set and
			// performing cross validation.
			evaluation = new Evaluation(trainData);
			evaluation.crossValidateModel(classifier, trainData, 10,
					new Random(1));
		} else {
			// Test data is has been defined, load for test."
			evaluation = new Evaluation(testData);
			evaluation.useNoPriors();
			evaluation.evaluateModel(classifier, testData);
		}
	}

	public double[][] getConfutionMatix() throws Exception {
		if (evaluation == null) {
			throw new InitializationException("Evaluation is not initialized.");
		}
		return evaluation.confusionMatrix();
	}

	private double[][] getPctConfutionMatrix(double[][] confutionMatrix) {
		double[][] pctConfutionMatrix = confutionMatrix.clone();
		int row = 0;
		for (double[] predictionRow : confutionMatrix) {
			double rowSum = 0;
			for (double prediction : predictionRow) {
				rowSum += prediction;
			}
			for (int col = 0; col < predictionRow.length; col++) {
				if (rowSum == 0) {
					pctConfutionMatrix[row][col] = 0;
				} else {
					pctConfutionMatrix[row][col] /= rowSum;
				}
			}
			row += 1;
		}
		return pctConfutionMatrix;
	}

	/**
	 * This function compute the error in meter.
	 * 
	 * @param distanceMatrix
	 *            The distance matrix, one confusion matix has only one
	 *            corresponding distance matrix
	 * @param pctConfutionMatix
	 *            The normalized confusion matrix, each value is normalized by
	 *            the total number of test data.
	 * @return Error in meter.
	 * @throws Exception
	 */
	public double getMeterError(double[][] distanceMatrix,
			double[][] pctConfutionMatix) throws Exception {
		double result = 0;
		if (distanceMatrix.length != pctConfutionMatix.length) {
			throw new InitializationException(
					"Disance matrix and confution matrix doesn't fit.");
		}
		for (int i = 0; i < pctConfutionMatix.length; i++) {
			for (int j = 0; j < pctConfutionMatix[i].length; j++) {
				if (j > i) {
					result += (pctConfutionMatix[i][j] * distanceMatrix[i][j]);
				} else {
					result += (pctConfutionMatix[i][j] * distanceMatrix[j][i]);
				}
			}
		}
		return result;
	}

	public double[][] getPctConfutionMatrix() throws Exception {
		return getPctConfutionMatrix(getConfutionMatix());
	}

	/**
	 * After classifier is initialized, this function does main work.
	 * 
	 * @param instance
	 *            to be classified
	 * @return
	 * @throws Exception
	 */
	public ClassifyResult classifiy(Instance instance) throws Exception {
		if (classifier == null) {
			throw new InitializationException("Classifier is not initialized.");
		}
		double classLabel = classifier.classifyInstance(instance);
		Log.v(LOG_TAG, "classLabel: " + classLabel);
		String classLableString = classLabels.value((int) classLabel);
		Log.v(LOG_TAG, "classLableString: " + classLableString);
		double[] confidences = classifier.distributionForInstance(instance);

		for (double d : confidences) {
			Log.v(LOG_TAG, "total confidence: " + d);
		}

		Vote c = null;
		try {
			c = (Vote) classifier;
		} catch (Exception ClassCastException) {
		}

		if (c != null) {
			Classifier[] cc = c.getClassifiers();

			for (Classifier classifier2 : cc) {
				Log.v(LOG_TAG, "classifier: "
						+ classifier2.toString().substring(0, 20));
				double[] confidences2 = classifier2
						.distributionForInstance(instance);
				for (double d : confidences2) {
					Log.v(LOG_TAG, "confidence "
							+ classifier2.toString().substring(0, 5) + " :" + d);
				}
			}
		}

		double confidence = confidences[(int) classLabel];

		// //all confidences:

		Map<Double, String> props = new HashMap<Double, String>();

		double[] dist = confidences;
		for (int i = 0; i < dist.length; i++) {

			// do not lose any results!
			while (props.containsKey(dist[i]))
				dist[i] += 1E-10;
			String classLableString2 = classLabels.value((int) i);
			props.put(dist[i], classLableString2);

			Log.v(LOG_TAG, "Dist[" + i + "] = " + dist[i] + ", class[" + i
					+ "]=" + classLableString2);
		}

		Map<Double, String> propsSorted = new TreeMap<Double, String>(
				Collections.reverseOrder());

		propsSorted.putAll(props);

		// //end all confidences.

		return new ClassifyResult(classLableString, classLabel, confidence,
				propsSorted);
	}

	/**
	 * Return the time elapsed to build the model, unit is second
	 * 
	 * @return a String of time used to build the model, unit is second.
	 * @throws Exception
	 */
	public String getBuildModelTime() {
		return doubleToString(buildModelElapsed / 1000d, 3);
	}

	/**
	 * Return the percentage of correct classification.
	 * 
	 * @return
	 * @throws Exception
	 */
	public double getPctCorretion() throws Exception {
		if (evaluation == null) {
			throw new InitializationException("Evaluation is not initialized.");
		}
		return evaluation.pctCorrect();
	}

	/**
	 * Generate model from existing classifier.
	 * 
	 * @param modelFile
	 *            The output file that the model will be written to.
	 * @throws Exception
	 */
	public void getModel(File modelFile) throws Exception {
		if (classifier == null) {
			throw new InitializationException("Classifier is not initialized.");
		}
		SerializationHelper.write(modelFile.getAbsolutePath(), classifier);
	}

	public void setClassifierFromModel(File modelFile) throws Exception {
		// stackoverflow error,use another way
		// classifier = (Classifier)
		// SerializationHelper.read(modelFile.getAbsolutePath());
		SerializedClassifier sc = new SerializedClassifier();
		sc.setModelFile(modelFile);
		classifier = sc;
	}

	/**
	 * Rounds a double and converts it into String.
	 * 
	 * @param value
	 *            the double value
	 * @param afterDecimalPoint
	 *            the (maximum) number of digits permitted after the decimal
	 *            point
	 * @return the double as a formatted string
	 */
	public static/* @pure@ */String doubleToString(double value,
			int afterDecimalPoint) {

		StringBuffer stringBuffer;
		double temp;
		int dotPosition;
		long precisionValue;

		temp = value * Math.pow(10.0, afterDecimalPoint);
		if (Math.abs(temp) < Long.MAX_VALUE) {
			precisionValue = (temp > 0) ? (long) (temp + 0.5) : -(long) (Math
					.abs(temp) + 0.5);
			if (precisionValue == 0) {
				stringBuffer = new StringBuffer(String.valueOf(0));
			} else {
				stringBuffer = new StringBuffer(String.valueOf(precisionValue));
			}
			if (afterDecimalPoint == 0) {
				return stringBuffer.toString();
			}
			dotPosition = stringBuffer.length() - afterDecimalPoint;
			while (((precisionValue < 0) && (dotPosition < 1))
					|| (dotPosition < 0)) {
				if (precisionValue < 0) {
					stringBuffer.insert(1, '0');
				} else {
					stringBuffer.insert(0, '0');
				}
				dotPosition++;
			}
			stringBuffer.insert(dotPosition, '.');
			if ((precisionValue < 0) && (stringBuffer.charAt(1) == '.')) {
				stringBuffer.insert(1, '0');
			} else if (stringBuffer.charAt(0) == '.') {
				stringBuffer.insert(0, '0');
			}
			int currentPos = stringBuffer.length() - 1;
			while ((currentPos > dotPosition)
					&& (stringBuffer.charAt(currentPos) == '0')) {
				stringBuffer.setCharAt(currentPos--, ' ');
			}
			if (stringBuffer.charAt(currentPos) == '.') {
				stringBuffer.setCharAt(currentPos, ' ');
			}

			return stringBuffer.toString().trim();
		}
		return new String("" + value);
	}

	public static double getAverage(List<Double> doubleList) {
		double pctSum = 0d;
		double avePctCorrection = 0d;
		for (double d : doubleList) {
			pctSum += d;
		}
		avePctCorrection = pctSum / doubleList.size();
		return avePctCorrection;
	}

	public static double getStDvi(List<Double> doubleList) {
		double result = 0;
		double average = getAverage(doubleList);
		double sum = 0;
		for (double d : doubleList) {
			sum += ((d - average) * (d - average));
		}
		result = Math.sqrt(sum);
		return result;
	}

	public void saveInstancesToFile(Instances instances, File arffFile)
			throws Exception {
		// logger.debug("Try to save instances to file" +arffFile.getName());
		saver.setInstances(instances);
		saver.setFile(arffFile);
		saver.writeBatch();
	}

}
