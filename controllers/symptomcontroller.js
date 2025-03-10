const SymptomChecker = require('../models/symptom');

exports.checkSymptoms = async (req, res) => {
  const { petType, symptoms } = req.body;

  try {
    // Fetch symptom-related data from the database
    const symptomDetails = await SymptomChecker.find({ petType, symptom: symptoms });

    if (!symptomDetails.length) {
      return res.status(404).json({ message: 'No data found for this symptom' });
    }

    const severeCondition = symptomDetails.find((detail) => detail.severity === 'severe');

    // Return the data including questions, detailed diagnosis, and advice
    return res.json({
      diagnosis: severeCondition ? severeCondition.result : symptomDetails[0].diagnoses[0].result,
      details: severeCondition ? severeCondition.details : symptomDetails[0].diagnoses[0].details,
      recommendedAction: severeCondition ? severeCondition.recommendedAction : symptomDetails[0].diagnoses[0].recommendedAction,
      potentialTests: severeCondition ? severeCondition.potentialTests : symptomDetails[0].diagnoses[0].potentialTests,
      questions: symptomDetails[0].questions,
      advice: severeCondition ? 'Please visit a vet immediately.' : 'Monitor the symptoms closely.',
    });
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getDiagnosis = async (req, res) => {
  const { petType, symptom, answers } = req.body;

  try {
    // Find the relevant symptom in the database
    const symptomData = await SymptomChecker.findOne({ petType, symptom });

    if (!symptomData) {
      return res.status(404).json({ message: 'Symptom not found' });
    }

    // Count the number of "Yes" answers
    const yesCount = Object.values(answers).filter((answer) => answer === 'yes').length;

    // Determine severity based on the number of "Yes" answers
    let severity;

    if (yesCount >= symptomData.questions.length - 1 && answers[symptomData.questions.length - 1] === 'yes') {
      severity = 'critical';
    } else if (yesCount === symptomData.questions.length) {
      severity = 'severe';
    } else if (yesCount > 0) {
      severity = 'moderate';
    } else {
      severity = 'mild';
    }

    // Find the corresponding diagnosis based on severity
    const diagnosisData = symptomData.diagnoses.find((diag) => diag.severity === severity);

    if (!diagnosisData) {
      return res.status(404).json({ message: 'Diagnosis not found for the given severity' });
    }

    // Send the detailed diagnosis and advice to the client
    res.json({
      diagnosis: diagnosisData.result,
      details: diagnosisData.details,
      recommendedAction: diagnosisData.recommendedAction,
      potentialTests: diagnosisData.potentialTests,
      advice: severity === 'critical' || severity === 'severe' ? 'Please visit a vet immediately.' : 'Monitor the symptoms closely.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.getSymptomsByPetType = async (req, res) => {
  const { petType } = req.params;
  
  try {
    // Find all unique symptoms for the given pet type
    const symptoms = await SymptomChecker.distinct('symptom', { petType });
    
    if (!symptoms.length) {
      return res.status(404).json({ 
        message: 'No symptoms found for this pet type' 
      });
    }
    
    return res.json({ symptoms });
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};