import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkForAdmin } from "../middlewares/checkForAdmin";
import * as multer from "multer";

const router = Router();

const upload = multer({
    limits: {
        fieldNameSize: 100,
        fieldSize: 1 * 1024 * 1024,
        fileSize: 1 * 1024 * 1024,
        files: 1,
    },
});

router.get("/admin", [checkJwt, checkForAdmin()], UserController.listAllAdmin);
router.get("/", [checkJwt], UserController.listAll);
router.get("/experts", [checkJwt], UserController.listExperts);
router.post("/showRealName", [checkJwt], UserController.changeShowRealName);
router.post("/:id([0-9]+)/admin", [checkJwt, checkForAdmin()], UserController.changeAdminStatus);
router.post("/:id([0-9]+)/expert", [checkJwt, checkForAdmin()], UserController.changeExpertStatus);
router.get("/:id([0-9]+)/expert/picture", [checkJwt], UserController.serveExpertPicture);
router.post("/:id([0-9]+)/expert/picture", [checkJwt, checkForAdmin(), upload.single("file0")], UserController.uploadExpertPicture);
router.post("/:id([0-9]+)/expert/info", [checkJwt, checkForAdmin()], UserController.changeExpertInfo);
router.get("/usernameAvailable/:username", UserController.usernameAvailable);
router.post("/", UserController.newUser);
router.post("/:id([0-9]+)/password", [checkJwt, checkForAdmin()], UserController.changePassword);
router.delete("/:id([0-9]+)", [checkJwt, checkForAdmin()], UserController.deleteUser);

export default router;
