import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import articlesRouter from "./articles";
import sponsorsRouter from "./sponsors";
import summaryRouter from "./summary";
import newsletterRouter from "./newsletter";
import pvgisRouter from "./pvgis";
import generateRouter from "./generate";
import wocheRouter from "./woche";
import sitemapRouter from "./sitemap";
import adminRouter from "./admin";
import contactRouter from "./contact";
import mitmachenRouter from "./mitmachen";
import foerderlinksRouter from "./foerderlinks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(articlesRouter);
router.use(sponsorsRouter);
router.use(summaryRouter);
router.use(newsletterRouter);
router.use(pvgisRouter);
router.use(generateRouter);
router.use(wocheRouter);
router.use(sitemapRouter);
router.use(adminRouter);
router.use(contactRouter);
router.use(mitmachenRouter);
router.use(foerderlinksRouter);

export default router;
