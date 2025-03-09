const Consultation = require('../models/history');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generatePDF = async (consultation, vet, petOwner) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const fileName = `consultation_${consultation._id}.pdf`;
      const filePath = path.join(__dirname, '..', 'temp', fileName);

      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
        fs.mkdirSync(path.join(__dirname, '..', 'temp'));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add clinic logo if exists
      // doc.image('path/to/logo.png', 50, 45, { width: 150 });

      // Header
      doc
        .fontSize(20)
        .text('Petify Medical Consultation', { align: 'center' })
        .moveDown();

      // Consultation Information
      doc
        .fontSize(12)
        .text('Consultation Details', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .text(`Date: ${moment(consultation.consultationDate).format('MMMM D, YYYY')}`)
        .text(`Veterinarian: Dr. ${vet.fullName}`)
        .text(`Pet Owner: ${petOwner.fullName}`)
        .text(`Pet Name: ${consultation.petName}`)
        .moveDown();

      // Clinical Information
      doc
        .fontSize(12)
        .text('Clinical Information', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .text('Symptoms:')
        .text(consultation.symptoms, { indent: 20 })
        .moveDown(0.5)
        .text('Diagnosis:')
        .text(consultation.diagnosis, { indent: 20 })
        .moveDown(0.5);

      if (consultation.notes) {
        doc
          .text('Additional Notes:')
          .text(consultation.notes, { indent: 20 })
          .moveDown();
      }

      // Prescriptions
      doc
        .fontSize(12)
        .text('Prescriptions', { underline: true })
        .moveDown(0.5);

      consultation.prescriptions.forEach((prescription, index) => {
        doc
          .fontSize(10)
          .text(`Prescription ${index + 1}:`, { continued: true })
          .text(`\nMedication: ${prescription.medication}`, { indent: 20 })
          .text(`Dosage: ${prescription.dosage}`, { indent: 20 })
          .text(`Frequency: ${prescription.frequency}`, { indent: 20 })
          .text(`Duration: ${prescription.duration}`, { indent: 20 });

        if (prescription.notes) {
          doc.text(`Notes: ${prescription.notes}`, { indent: 20 });
        }
        doc.moveDown();
      });

      // Follow-up Information
      if (consultation.followUpDate) {
        doc
          .fontSize(12)
          .text('Follow-up Information', { underline: true })
          .moveDown(0.5)
          .fontSize(10)
          .text(`Follow-up Date: ${moment(consultation.followUpDate).format('MMMM D, YYYY')}`)
          .moveDown();
      }

      // Footer
      doc
        .fontSize(8)
        .text('This is a computer-generated document.', { align: 'center' })
        .text(`Generated on ${moment().format('MMMM D, YYYY [at] HH:mm')}`, { align: 'center' })
        .text('If you have any questions, please contact your veterinarian.', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.createConsultation = async (req, res) => {
  let pdfPath = null;
  
  try {
    const {
      petOwnerId,
      petName,
      symptoms,
      diagnosis,
      notes,
      prescriptions,
      followUpDate
    } = req.body;

    const vetId = req.user.id;

    // Create new consultation record
    const consultation = new Consultation({
      vetId,
      petOwnerId,
      petName,
      symptoms,
      diagnosis,
      notes,
      prescriptions,
      followUpDate
    });

    await consultation.save();

    // Fetch vet and pet owner details
    const [vet, petOwner] = await Promise.all([
      User.findById(vetId),
      User.findById(petOwnerId)
    ]);

    // Generate PDF
    pdfPath = await generatePDF(consultation, vet, petOwner);

    // Send email with PDF attachment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: petOwner.email,
      cc: vet.email,
      subject: `Medical Consultation Summary for ${petName}`,
      text: `Dear ${petOwner.fullName},\n\nPlease find attached the medical consultation summary for ${petName}'s visit with Dr. ${vet.fullName} on ${moment().format('MMMM D, YYYY')}.\n\nIf you have any questions about the prescribed treatment, please don't hesitate to contact us.\n\nBest regards,\nPetify Medical Team`,
      attachments: [{
        filename: `${petName}_consultation_${moment().format('YYYYMMDD')}.pdf`,
        path: pdfPath
      }]
    };

    await transporter.sendMail(mailOptions);

    // Clean up - delete the temporary PDF file
    fs.unlink(pdfPath, (err) => {
      if (err) console.error('Error deleting temporary PDF:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Consultation record created and PDF sent via email',
      consultation
    });
  } catch (error) {
    // Clean up PDF file if it was created
    if (pdfPath) {
      fs.unlink(pdfPath, (err) => {
        if (err) console.error('Error deleting temporary PDF:', err);
      });
    }

    console.error('Error creating consultation record:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating consultation record',
      error: error.message
    });
  }
};

// The rest of the controller methods remain the same
exports.getVetConsultations = async (req, res) => {
  try {
    const vetId = req.user.id;
    const consultations = await Consultation.find({ vetId })
      .populate('petOwnerId', 'fullName email')
      .sort({ consultationDate: -1 });

    res.status(200).json({
      success: true,
      consultations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving consultations',
      error: error.message
    });
  }
};

exports.getPetOwnerConsultations = async (req, res) => {
  try {
    const petOwnerId = req.user.id;
    const consultations = await Consultation.find({ petOwnerId })
      .populate('vetId', 'fullName email')
      .sort({ consultationDate: -1 });

    res.status(200).json({
      success: true,
      consultations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving consultations',
      error: error.message
    });
  }
};