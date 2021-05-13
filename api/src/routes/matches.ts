import { Router } from "express";
import { MatchController } from "../controllers/MatchController";
import StatisticsController from "../controllers/StatisticsController";

const router = Router();

router.get("/", MatchController.getMatches);
// router.get("/currentDistance", StatisticsController.currentDistance);
// router.get("/currentMap.png", StatisticsController.currentMap);

export default router;
