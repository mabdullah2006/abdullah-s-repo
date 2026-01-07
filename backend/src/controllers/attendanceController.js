const prisma = require('../utils/prisma');

function getDateOnly(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  return new Date(Date.UTC(year, month, day));
}

function getMonthRange(monthString) {
  if (!monthString) return null;
  const [year, month] = monthString.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) return null;
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

async function checkIn(req, res) {
  const userId = req.user.id;
  const today = getDateOnly();

  const existing = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId,
        date: today
      }
    },
    include: { timeLog: true }
  });

  if (existing && existing.timeLog && existing.timeLog.checkIn) {
    return res.status(400).json({ message: 'Already checked in for today.' });
  }

  let attendance = existing;
  if (!attendance) {
    attendance = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        status: 'PRESENT',
        totalHours: 0
      }
    });
  }

  const timeLog = await prisma.timeLog.create({
    data: {
      attendanceId: attendance.id,
      checkIn: new Date()
    }
  });

  return res.json({ attendance, timeLog });
}

async function checkOut(req, res) {
  const userId = req.user.id;
  const today = getDateOnly();

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId,
        date: today
      }
    },
    include: { timeLog: true }
  });

  if (!attendance || !attendance.timeLog) {
    return res.status(400).json({ message: 'No check-in found for today.' });
  }

  if (attendance.timeLog.checkOut) {
    return res.status(400).json({ message: 'Already checked out for today.' });
  }

  const checkOutTime = new Date();
  const diffMs = checkOutTime.getTime() - attendance.timeLog.checkIn.getTime();
  const hours = Math.max(0, Math.round((diffMs / 3600000) * 100) / 100);

  const updatedTimeLog = await prisma.timeLog.update({
    where: { id: attendance.timeLog.id },
    data: { checkOut: checkOutTime }
  });

  const updatedAttendance = await prisma.attendance.update({
    where: { id: attendance.id },
    data: { totalHours: hours }
  });

  return res.json({ attendance: updatedAttendance, timeLog: updatedTimeLog });
}

async function getMyAttendance(req, res) {
  const range = getMonthRange(req.query.month);
  const where = {
    userId: req.user.id
  };

  if (range) {
    where.date = {
      gte: range.start,
      lt: range.end
    };
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: { timeLog: true },
    orderBy: { date: 'desc' }
  });

  const totalHours = attendance.reduce((sum, record) => sum + record.totalHours, 0);

  return res.json({ attendance, totalHours });
}

async function getEmployeeAttendance(req, res) {
  const employeeId = Number(req.params.id);
  if (Number.isNaN(employeeId)) {
    return res.status(400).json({ message: 'Invalid employee id.' });
  }

  const range = getMonthRange(req.query.month);
  const where = {
    userId: employeeId
  };

  if (range) {
    where.date = {
      gte: range.start,
      lt: range.end
    };
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: { timeLog: true },
    orderBy: { date: 'desc' }
  });

  const totalHours = attendance.reduce((sum, record) => sum + record.totalHours, 0);

  return res.json({ attendance, totalHours });
}

async function getDayAttendance(req, res) {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: 'Date is required (YYYY-MM-DD).' });
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return res.status(400).json({ message: 'Invalid date.' });
  }

  const day = getDateOnly(parsed);

  const [employees, attendance] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, email: true, isActive: true }
    }),
    prisma.attendance.findMany({
      where: { date: day },
      include: { timeLog: true }
    })
  ]);

  const attendanceMap = new Map(attendance.map((record) => [record.userId, record]));

  const list = employees.map((employee) => {
    const record = attendanceMap.get(employee.id);
    if (!record) {
      return {
        userId: employee.id,
        name: employee.name,
        email: employee.email,
        status: 'ABSENT',
        totalHours: 0,
        timeLog: null
      };
    }

    return {
      userId: employee.id,
      name: employee.name,
      email: employee.email,
      status: record.status,
      totalHours: record.totalHours,
      timeLog: record.timeLog
    };
  });

  return res.json({ date: day, list });
}

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getEmployeeAttendance,
  getDayAttendance
};
