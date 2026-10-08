import { v4 as uuidv4 } from 'uuid';

export const requestCorrelation = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
};
