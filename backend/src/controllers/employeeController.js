const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

function validateEmployeeInput(body, isUpdate) {
  const errors = [];
  if (!isUpdate) {
    if (!body.name) errors.push('Name is required.');
    if (!body.email) errors.push('Email is required.');
    if (!body.password) errors.push('Password is required.');
  }

  if (body.role && !['ADMIN', 'EMPLOYEE'].includes(body.role)) {
    errors.push('Role must be ADMIN or EMPLOYEE.');
  }

  if (body.salary !== undefined && Number.isNaN(Number(body.salary))) {
    errors.push('Salary must be a number.');
  }

  return errors.length ? errors.join(' ') : null;
}

function parseJoinDate(value) {
  if (!value) return new Date();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

async function createEmployee(req, res) {
  const error = validateEmployeeInput(req.body, false);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { name, email, password, role = 'EMPLOYEE', salary = 0, joinDate, isActive = true } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: 'Email already exists.' });
  }

  const parsedJoinDate = parseJoinDate(joinDate);
  if (!parsedJoinDate) {
    return res.status(400).json({ message: 'Invalid joinDate.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role,
      salary: Number(salary),
      joinDate: parsedJoinDate,
      isActive: Boolean(isActive)
    }
  });

  return res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    salary: user.salary,
    joinDate: user.joinDate,
    isActive: user.isActive
  });
}

async function listEmployees(req, res) {
  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      salary: true,
      joinDate: true,
      isActive: true
    }
  });

  return res.json(users);
}

async function updateEmployee(req, res) {
  const employeeId = Number(req.params.id);
  if (Number.isNaN(employeeId)) {
    return res.status(400).json({ message: 'Invalid employee id.' });
  }

  const error = validateEmployeeInput(req.body, true);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const data = {};
  const fields = ['name', 'email', 'role', 'salary', 'isActive'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      data[field] = field === 'salary' ? Number(req.body[field]) : req.body[field];
    }
  });

  if (req.body.joinDate !== undefined) {
    const parsedJoinDate = parseJoinDate(req.body.joinDate);
    if (!parsedJoinDate) {
      return res.status(400).json({ message: 'Invalid joinDate.' });
    }
    data.joinDate = parsedJoinDate;
  }

  if (req.body.password) {
    data.password = await bcrypt.hash(req.body.password, 10);
  }

  try {
    const updated = await prisma.user.update({
      where: { id: employeeId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        salary: true,
        joinDate: true,
        isActive: true
      }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(404).json({ message: 'Employee not found.' });
  }
}

async function deleteEmployee(req, res) {
  const employeeId = Number(req.params.id);
  if (Number.isNaN(employeeId)) {
    return res.status(400).json({ message: 'Invalid employee id.' });
  }

  try {
    await prisma.user.delete({ where: { id: employeeId } });
    return res.json({ message: 'Employee deleted.' });
  } catch (error) {
    return res.status(404).json({ message: 'Employee not found.' });
  }
}

module.exports = {
  createEmployee,
  listEmployees,
  updateEmployee,
  deleteEmployee
};
