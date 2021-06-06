import { Router } from "express";
import auth from "./auth";
import user from "./user";
import matches from "./matches";
import champion from "./champion";

const routes = Router();

routes.use("/auth", auth);
routes.use("/champion", champion);
routes.use("/users", user);
routes.use("/matches", matches);

export default routes;
