// routes/vetRoutes.js
const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetcontroller');
const auth = require('../middleware/auth');
router.post('/apply', vetController.submitApplication);
router.put('/approve/:vetId', vetController.approveVet);



router.get('/schedule', auth, vetController.getSchedule);
router.post('/schedule/add', auth, vetController.addSchedule);
router.put('/schedule/update', auth, vetController.updateSchedule);
// routes/vetRoutes.js
router.get('/schedules/all',  vetController.getAllSchedules);
router.delete('/schedule/delete/:id', auth, vetController.deleteSchedule);
module.exports = router;
