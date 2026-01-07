const express = require('express');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getEmployeeAttendance,
  getDayAttendance
} = require('../controllers/attendanceController');
const { authRequired, requireRole, requireActiveUser } = require('../middleware/auth');

const router = express.Router();

router.post('/check-in', authRequired, requireActiveUser, checkIn);
router.post('/check-out', authRequired, requireActiveUser, checkOut);
router.get('/me', authRequired, requireActiveUser, getMyAttendance);
router.get('/employee/:id', authRequired, requireRole('ADMIN'), getEmployeeAttendance);
router.get('/day', authRequired, requireRole('ADMIN'), getDayAttendance);

module.exports = router;
