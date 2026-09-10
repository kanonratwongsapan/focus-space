import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'focus_space_super_secret_key_12345');
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed, authorization denied.' });
  }
};
