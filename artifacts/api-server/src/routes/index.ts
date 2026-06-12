import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
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
import kycRouter from "./kyc";
import billingRouter from "./billing";
import companyRouter from "./company";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
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
router.use(kycRouter);
router.use(billingRouter);
router.use(companyRouter);

export default router;
