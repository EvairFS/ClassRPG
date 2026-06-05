import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

export const logger = morgan((tokens, req, res) => {
  return [
    new Date(Date.now()).toISOString(),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res),
    'ms',
  ].join(' ');
});
