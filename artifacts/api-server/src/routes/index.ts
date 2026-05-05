import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import filesRouter from "./files";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(filesRouter);
router.use(storageRouter);

export default router;
