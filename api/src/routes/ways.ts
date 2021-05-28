import { Router } from "express";
import TipController from "../controllers/TipController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], TipController.listAll);
router.post("/", [checkJwt], TipController.newTip);
router.post("/:tip", [checkJwt], TipController.editTip);
router.delete("/:tip", [checkJwt], TipController.deleteTip);

export default router;
