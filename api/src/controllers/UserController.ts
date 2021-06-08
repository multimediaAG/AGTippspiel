import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { log } from "../utils/utils";
import { grades } from "../data/grades";
import * as path from "path";
import * as fs from "fs";
import { COUNTRIES, MatchController } from "./MatchController";
import { CHAMPION_DEADLINE } from "../data/champion";

class UserController {
  public static listAll = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    const users = await userRepository.find({ relations: ["tips"] });
    res.send(users.map((u) => {
      if (!u.showRealName) {
        u.realName = undefined;
      }
      u.points = parseFloat(u.points as any as string);
      return u;
    }).sort((a, b) => b.points - a.points));
  }
  public static listExperts = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    const experts = await userRepository.find({ relations: ["tips"], where: { isExpert: true } });
    res.send(experts);
  }

  public static serveExpertPicture = async (req: Request, res: Response) => {
    const id = req.params.id.replace(/\//g, "").replace(/\./g, "").replace(/\\/g, "");
    const s = path.resolve(path.join(req.app.locals.config.UPLOAD_FILE_PATH, `${id}.jpg`));
    if (fs.existsSync(s)) {
      res.sendFile(s);
    } else {
      res.status(404).send("No picture!");
    }
  }

  public static listAllAdmin = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    const users = await userRepository.find({ relations: ["tips"] });
    res.send(users.map((u) => {
      u.points = parseFloat(u.points as any as string);
      return u;
    }));
  }

  public static getChampion = async (req: Request, res: Response) => {
    const tip = (await getRepository(User).findOne(res.locals.jwtPayload.userId)).champion;
    res.send({
      teams: MatchController.teams.map((t) => {
        t.name = COUNTRIES[t.name] || t.name;
        return t;
      }),
      tip,
    })
  }

  public static setChampion = async (req: Request, res: Response) => {
    const { teamId } = req.body;

    if (new Date() > CHAMPION_DEADLINE) {
      res.status(400).send({ message: "Zu spät, das erste Spiel hat bereits begonnen!" });
      return;
    }

    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne(res.locals.jwtPayload.userId);
      user.champion = teamId;
      await userRepository.save(user);
    } catch (e) {
      res.status(500).send({message: "Konnte den Tipp nicht speichern!"});
      return;
    }
    log("userchampion changed", { id: res.locals.jwtPayload.userId, teamId });
    res.status(200).send({success: true});
  }

  public static usernameAvailable = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    const result = await userRepository.findOne({ username: req.params.username });
    res.send({usernameAvailable: result ? false : true});
  }

  public static newUser = async (req: Request, res: Response) => {
    const { username, password, passwordVerify, realName, grade, showRealName } = req.body;
    if (!(username && realName && password && passwordVerify && grade)) {
      res.status(400).send({message: "Nicht alle Felder ausgefüllt!"});
      return;
    }
    if (password != passwordVerify) {
      res.status(400).send({message: "Passwörter stimmen nicht überein!"});
      return;
    }
    if (!grades.includes(grade)) {
      res.status(400).send({message: "Die Klasse ist ungültig!"});
      return;
    }

    let user = new User();
    user.username = username;
    user.realName = realName;
    user.password = password;
    user.showRealName = !!showRealName;
    user.grade = grade;
    user.isAdmin = false;
    user.isExpert = false;

    user.hashPassword();

    const userRepository = getRepository(User);
    try {
      user = await userRepository.save(user);
    } catch (e) {
      res.status(409).send({message: "Der Benutzername ist schon vorhanden!", errorField: "username"});
      return;
    }
    log("user created", { user });
    res.status(200).send({status: true});
  }

  public static deleteUser = async (req: Request, res: Response) => {

    const id = req.params.id;

    const userRepository = getRepository(User);
    try {
      await userRepository.delete(id);
    } catch (e) {
      res.status(500).send({message: "Konnte den Benutzer nicht löschen!"});
      return;
    }
    log("user deleted", { id });
    res.status(200).send({status: true});
  }

  public static changePassword = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { password } = req.body;
    if (!password) {
      res.status(400).send({message: "Nicht alle Felder ausgefüllt!"});
      return;
    }

    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne(id);
      user.password = password;
      user.hashPassword();
      await userRepository.save(user);
    } catch (e) {
      res.status(500).send({message: "Konnte den das Passwort nicht ändern!"});
      return;
    }
    log("userpassword changed", { id });
    res.status(200).send({status: true});
  }

  public static changeAdminStatus = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { admin } = req.body;

    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne(id);
      user.isAdmin = admin;
      await userRepository.save(user);
    } catch (e) {
      res.status(500).send({message: "Konnte den Adminstatus nicht ändern!"});
      return;
    }
    log("useradminstatus changed", { id, admin });
    res.status(200).send({status: true});
  }

  public static changeExpertStatus = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { expert } = req.body;

    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne(id);
      user.isExpert = expert;
      await userRepository.save(user);
    } catch (e) {
      res.status(500).send({message: "Konnte den Expertenstatus nicht ändern!"});
      return;
    }
    log("userexpertstatus changed", { id, expert });
    res.status(200).send({status: true});
  }

  public static changeShowRealName = async (req: Request, res: Response) => {
    const { showRealName } = req.body;

    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne(res.locals.jwtPayload.userId);
      user.showRealName = !!showRealName;
      await userRepository.save(user);
    } catch (e) {
      res.status(500).send({ message: "Konnte die Einstellungen nicht speichern!" });
    }
    log("userexpertstatus changed", { userId: res.locals.jwtPayload.userId, showRealName });
    res.status(200).send({success: true});
  }

  public static changeExpertInfo = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { text, position } = req.body;

    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne(id);
      if (!user.isExpert) {
        res.status(500).send({message: "Dieser Nutzer ist kein Experte!"});
        return;
      }
      if (!text?.trim() || !position?.trim()) {
        res.status(500).send({message: "Nicht alle Felder ausgefüllt!"});
        return;
      }
      user.expertText = text.trim();
      user.expertPosition = position.trim();
      await userRepository.save(user);
    } catch (e) {
      res.status(500).send({message: "Konnte die Info nicht ändern!"});
      return;
    }
    log("userexpertinfo changed", { id, text });
    res.status(200).send({status: true});
  }

  public static uploadExpertPicture = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { expert } = req.body;

    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne(id);
      if (!user.isExpert) {
        res.status(500).send({message: "Dieser Nutzer ist kein Experte!"});
        return;
      }
      if (!req.file) {
        throw Error("no file");
      }
      fs.writeFileSync(path.join(req.app.locals.config.UPLOAD_FILE_PATH, `${user.id}.jpg`), req.file.buffer);
    } catch (e) {
      res.status(500).send({message: "Konnte das Bild nicht hochladen!"});
      return;
    }
    log("userexpertpicture changed", { id, expert });
    res.status(200).send({status: true});
  }
}

export default UserController;
