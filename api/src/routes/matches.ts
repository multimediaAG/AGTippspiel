import { Router } from "express";
import { MatchController } from "../controllers/MatchController";

const router = Router();

router.get("/", MatchController.getMatches);
router.get("/teams", MatchController.getTeams);
// router.get("/currentDistance", StatisticsController.currentDistance);
// router.get("/currentMap.png", StatisticsController.currentMap);

export default router;
