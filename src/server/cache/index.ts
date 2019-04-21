import {NextFunction, Request, Response} from 'express';
import {Cache} from 'memory-cache';

// configure cache middleware
const memCache = new Cache();

export const cacheMiddleware = (duration: number) => (
    req: Request,
    res: Response,
    next: NextFunction,
    ) => {
  const key = `__express__${req.originalUrl}` || req.url;
  const cacheContent = memCache.get(key);
  if (cacheContent) {
    res.json(cacheContent);
    return;
  } else {
    res.sendJSON = res.json;
    res.json = body => {
      memCache.put(key, body, duration * 1000);
      return res.sendJSON(body);
    };
    next();
  }
};
