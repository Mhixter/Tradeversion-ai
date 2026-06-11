import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import brokersRouter from "./brokers";
import botsRouter from "./bots";
import strategiesRouter from "./strategies";
import marketplaceRouter from "./marketplace";
import backtestingRouter from "./backtesting";
import copytradingRouter from "./copytrading";
import portfolioRouter from "./portfolio";
import riskcenterRouter from "./riskcenter";
import notificationsRouter from "./notifications";
import tradesRouter from "./trades";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(brokersRouter);
router.use(botsRouter);
router.use(strategiesRouter);
router.use(marketplaceRouter);
router.use(backtestingRouter);
router.use(copytradingRouter);
router.use(portfolioRouter);
router.use(riskcenterRouter);
router.use(notificationsRouter);
router.use(tradesRouter);

export default router;
