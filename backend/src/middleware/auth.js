const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

async function requireActiveUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !user.isActive) {
    return res.status(403).json({ message: 'User is inactive' });
  }

  req.userRecord = user;
  return next();
}

module.exports = {
  authRequired,
  requireRole,
  requireActiveUser
};
