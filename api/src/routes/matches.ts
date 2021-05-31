import { Router } from "express";
import { MatchController } from "../controllers/MatchController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], MatchController.getMatches);
router.post("/:id/tip", [checkJwt], MatchController.updateTip);
router.get("/teams", [checkJwt], MatchController.getTeams);

export default router;
