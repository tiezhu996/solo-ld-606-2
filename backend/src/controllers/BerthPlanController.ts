import type { NextFunction, Request, Response } from "express";
import { berthPlanService, BerthPlanError } from "../services/BerthPlanService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const wrap = (err: unknown): BerthPlanError => {
  if (err instanceof BerthPlanError) return err;
  return new BerthPlanError(ERROR_CODES.VALIDATION_FAILED, 400, ERROR_MESSAGES.VALIDATION_FAILED);
};

export const berthPlanController = {
  list: (_req: Request, res: Response) => res.json(berthPlanService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(berthPlanService.create(req.body));
    } catch (err) {
      next(wrap(err));
    }
  },
  precheck: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(berthPlanService.precheck(req.body));
    } catch (err) {
      next(wrap(err));
    }
  },
  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(berthPlanService.update(Number(req.params.id), req.body));
    } catch (err) {
      next(wrap(err));
    }
  },
  approve: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(berthPlanService.approve(Number(req.params.id)));
    } catch (err) {
      next(wrap(err));
    }
  }
};
