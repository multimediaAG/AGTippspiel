import { Router } from "express";
import auth from "./auth";
import user from "./user";
import matches from "./matches";

const routes = Router();

routes.use("/auth", auth);
routes.use("/users", user);
routes.use("/matches", matches);

export default routes;
