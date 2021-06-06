import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], UserController.getChampion);
router.post("/", [checkJwt], UserController.setChampion);

export default router;
