import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Tip } from "../entity/Tip";
import { User } from "../entity/User";
import { log } from "../utils/utils";
import { MatchController } from "./MatchController";

class TipController {
    public static listAll = async (req: Request, res: Response) => {
        const tipRepository = getRepository(Tip);
        const tips = await tipRepository.find({
            where: {
                user: await getRepository(User).findOne(res.locals.jwtPayload.userId),
                roundIdx: parseInt(req.params.roundIdx, undefined),
            }
        });
        res.send(tips);
    }

    public static editTip = async (req: Request, res: Response) => {
        /* if (!await MatchController.roundRunning(true)) {
            TipController.roundFinishedMessage(res);
            return;
        }
        const tipRepository = getRepository(Tip);
        const { distance, date, type } = req.body;
        if (!(distance && date)) {
            res.status(400).send("Nicht alle Felder wurden ausgefüllt!");
            return;
        }
        try {
            const tip = await tipRepository.findOne({ where: { id: req.params.tip, user: await getRepository(User).findOne(res.locals.jwtPayload.userId) } });
            tip.distance = distance;
            tip.date = date;
            tip.type = type;
            tip.hidden = false;
            await tipRepository.save(tip);
            log("tip edited", { tip, userId: res.locals.jwtPayload.userId });
        } catch (err) {
            res.status(500).send({ message: err });
            return;
        }
        MatchController.staticUpdateRoundIdxUpdatedDate();
        res.send({ status: true }); */
    }

    public static newTip = async (req: Request, res: Response) => {
        /* if (!await MatchController.roundRunning(true)) {
            TipController.roundFinishedMessage(res);
            return;
        }
        const tipRepository = getRepository(Tip);
        const { distance, date, type } = req.body;
        if (!(date && distance && type)) {
            res.status(400).send({ message: "Nicht alle Felder ausgefüllt!" });
            return;
        }

        let tip = new Tip();
        tip.distance = distance;
        tip.date = date;
        tip.type = type;
        tip.roundIdx = MatchController.getRoundIdx();
        tip.user = await getRepository(User).findOne(res.locals.jwtPayload.userId);

        try {
            tip = await tipRepository.save(tip);
            log("tip created", { tip, userId: res.locals.jwtPayload.userId });
        } catch (e) {
            res.status(500).send({ message: `Fehler: ${e.toString()}` });
            return;
        }
        MatchController.staticUpdateRoundIdxUpdatedDate();
        res.status(200).send({ status: true }); */
    }

    public static deleteTip = async (req: Request, res: Response) => { /*
        if (!await MatchController.roundRunning(true)) {
            TipController.roundFinishedMessage(res);
            return;
        }
        const id = req.params.tip as any;
        const tipRepository = getRepository(Tip);
        try {
            await tipRepository.delete({ user: await getRepository(User).findOne(res.locals.jwtPayload.userId), id });
            log("tip deleted", { id, userId: res.locals.jwtPayload.userId });
        } catch (error) {
            res.status(404).send({ message: "Diese Strecke wurde nicht gefunden!" });
            return;
        }
        res.status(200).send({ status: true }); */
    }

    private static roundFinishedMessage(res: Response) {
        // res.status(400).send({ message: "Die Runde ist schon vorbei, es können keine Strecken mehr eingetragen werden!" });
    }
}

export default TipController;
