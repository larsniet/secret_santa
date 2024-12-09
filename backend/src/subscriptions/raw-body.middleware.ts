import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    express.raw({ type: 'application/json' })(req, res, (err) => {
      if (err) {
        return next(err);
      }
      if (req.url === '/api/subscriptions/webhook' && req.body) {
        req['rawBody'] = req.body;
      }
      next();
    });
  }
}
