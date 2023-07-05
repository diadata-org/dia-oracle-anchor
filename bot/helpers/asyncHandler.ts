import { Request, Response, NextFunction } from 'express'

export default (execution: any) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(execution(req, res, next)).catch(next)
