package james.weka;

import java.util.Map;

public class ClassifyResult {

	private String classLable;
	private double classLableDouble;
	private double confidence;

	Map<Double, String> propsSorted;

	public ClassifyResult(String classLabel, double classLabelDouble,
			double confidence, Map<Double, String> propsSorted) {
		this.classLable = classLabel;
		this.confidence = confidence;
		this.classLableDouble = classLabelDouble;

		this.propsSorted = propsSorted;
	}

	public Map<Double, String> getPropsSorted() {
		return propsSorted;
	}

	public String getClassLabel() {
		return classLable;
	}

	public void setClassLable(String classLable) {
		this.classLable = classLable;
	}

	public double getConfidence() {
		return confidence;
	}

	public void setConfidence(double confidence) {
		this.confidence = confidence;
	}

	public double getClassLableDouble() {
		return classLableDouble;
	}

	public void setClassLableDouble(double classLableDouble) {
		this.classLableDouble = classLableDouble;
	}

	@Override
	public String toString() {
		return " " + classLable + " : " + confidence;
	}
}
