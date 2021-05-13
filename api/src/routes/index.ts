import { Router } from "express";
import auth from "./auth";
import ways from "./ways";
import user from "./user";
import matches from "./matches";
import { canHaveJwt } from "../middlewares/canHaveJwt";

const routes = Router();

routes.use("/auth", auth);
routes.use("/ways", ways);
routes.use("/users", user);
routes.use("/matches", matches);

export default routes;
