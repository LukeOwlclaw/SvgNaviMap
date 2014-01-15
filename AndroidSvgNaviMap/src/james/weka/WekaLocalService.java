package james.weka;

import james.weka.exception.InitializationException;
import james.weka.exception.WekaFormatException;

import java.io.File;
import java.util.List;
import java.util.Map;

public interface WekaLocalService {

	int MISSING_VALUE = 0;
	long CLASSIFY_INTERVAL = 0 * 60 * 1000; // An time interval for
											// classification, here we set to 0
											// since we try to make
											// classification whenever we get a
											// new one.
	String TRAIN_ARFF = "james_train.arff";
	String STRUCTURE = "james_structure.arff";
	String TEST_ARFF = "james_test.arff";
	String MODEL = "james_model";

	// --------integer for algorithms------
	int NONE = 0;// no algorithm, used when build classifier with a model
	int VOTE = 1;
	int RANDOM_TREE = 2;
	int FAST_RANDOM_TREE = 3;
	int NAIVE_BAYES = 4;
	int KNN = 5;

	// ------------------------------------

	/**
	 * Prepare the arff file as the training data is expected format.
	 * 
	 * @param rowData
	 *            The original data file, containing several classified ressult,
	 *            might not be arff format.
	 * @return The arff file containing training data.
	 * @throws james.weka.exception.WekaFormatException
	 *             if the instance can't be parsed.
	 */
	File prepareTrainingFile(File rowData) throws WekaFormatException;

	/**
	 * This function use the weka classifier to classify the measurement in the
	 * file.
	 * 
	 * @param singelSampleFile
	 * @return classify result
	 * @throws james.weka.exception.WekaFormatException
	 * @throws james.weka.exception.InitializationException
	 */
	ClassifyResult classify(File singelSampleFile) throws WekaFormatException,
			InitializationException;

	/**
	 * This function returns a weka classifier model which stored in a file.
	 * 
	 * @param workDir
	 *            The directory where the file should be generated.
	 * @return The file which contains a weka classifier model.
	 * @throws james.weka.exception.InitializationException
	 *             classifier is not initialized or can't write to workdir.
	 */
	File prepareClassifierModel(String workDir) throws InitializationException;

	/**
	 * This function returns an arff file with singel instance AND writes it to
	 * SDCARD (new File(structure.getParent(), TEST_ARFF))
	 * 
	 * @param sturcture
	 *            The structure arff file with no data.
	 * @param a
	 *            single instance as a Map<feature,measurement>.
	 * @return
	 * @throws james.weka.exception.WekaFormatException
	 *             if the instance can't be parsed or don't fit to the training
	 *             structure.
	 */
	File prepareTestFile(final File structure, Map<String, String> instance)
			throws WekaFormatException;

	/**
	 * Initializa the weka classifier, but be called before others except
	 * prepareTrainingFile(File).
	 * 
	 * @param trainingFile
	 *            This can be a arff file or model file.
	 * @param algorithm
	 *            The algorithm to be used in the classifier, will be ignored
	 *            when the training file is already a model.
	 * @throws james.weka.exception.WekaFormatException
	 *             if the file cannot be parsed
	 */
	void initialize(File trainingFile, int algorithm)
			throws WekaFormatException;

	/**
	 * Get the attribute list as a list of string.
	 * 
	 * @param structure
	 *            The structure file, which is the arff file without data.
	 * @return A list of attribute names.
	 * @throws james.weka.exception.WekaFormatException
	 *             if the structure file cannot be parsed.
	 */
	List<String> getAttrList(File structure) throws WekaFormatException;

}
