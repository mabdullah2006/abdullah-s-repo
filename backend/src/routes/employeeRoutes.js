const express = require('express');
const { createEmployee, listEmployees, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired, requireRole('ADMIN'), createEmployee);
router.get('/', authRequired, requireRole('ADMIN'), listEmployees);
router.put('/:id', authRequired, requireRole('ADMIN'), updateEmployee);
router.delete('/:id', authRequired, requireRole('ADMIN'), deleteEmployee);

module.exports = router;
