const EUROPEAN_CHAMPIONSHIP_ID = 2018;
const CURRENT_SEASON_YEAR = 2021;
const LOCATIONS = {
    285418: "Rom",
    285419: "Baku",
    285424: "Kopenhagen",
    285425: "St. Petersburg",
    285436: "London",
    285430: "Bukarest",
    285431: "Amsterdam",
    285437: "Glasgow",
    285442: "St. Petersburg",
    285443: "Sevilla",
    285448: "Budapest",
    285449: "München",
    285426: "St. Petersburg",
    285420: "Baku",
    285421: "Rom",
    285432: "Bukarest",
    285427: "Kopenhagen",
    285433: "Amsterdam",
    285444: "St. Petersburg",
    285438: "Glasgow",
    285439: "London",
    285450: "Budapest",
    285451: "München",
    285445: "Sevilla",
    285422: "Rom",
    285423: "Baku",
    285434: "Amsterdam",
    285435: "Bukarest",
    285428: "Kopenhagen",
    285429: "St. Petersburg",
    285440: "Glasgow",
    285441: "London",
    285446: "St. Petersburg",
    285447: "Sevilla",
    285452: "München",
    285453: "Budapest",
    325091: "Amsterdam",
    325090: "London",
    325089: "Budapest",
    325088: "Sevilla",
    325087: "Kopenhagen",
    325086: "Bukarest",
    325085: "St. Petersburg",
    325084: "Glasgow",
    325083: "St. Petersburg",
    325082: "München",
    325081: "Baku",
    325080: "Rom",
    325079: "London",
    325078: "London",
    325077: "London",
};

const COUNTRIES = {
    "Turkey": "Türkei",
    "Italy": "Italien",
    "Wales": "Wales",
    "Switzerland": "Schweiz",
    "Denmark": "Dänemark",
    "Finland": "Finnland",
    "Belgium": "Belgien",
    "Russia": "Russland",
    "England": "England",
    "Croatia": "Kroatien",
    "Austria": "Österreich",
    "North Macedinoa": "Nordmazedonien",
    "Netherlands": "Niederlande",
    "Ukraine": "Ukraine",
    "Scotland": "Schottland",
    "Czech Republic": "Tschechien",
    "Poland": "Polen",
    "Slovakia": "Slowakei",
    "Spain": "Spanien",
    "Sweden": "Schweden",
    "Hungary": "Ungarn",
    "Portugal": "Portugal",
    "France": "Frankreich",
    "Germany": "Deutschland",
}

import fetch from "node-fetch";
import { Request, Response } from "express";
import { Match, MatchStatus, Team } from "../entity/Match";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { isNumber } from "class-validator";
import { Tip } from "../entity/Tip";
import { copy, log } from "../utils/utils";

const MATCH_FETCH_TIME = 60 * 1000;

export class MatchController {
    static matches: Match[];
    static teams: Team[];
    public static async init() {
        MatchController.loadTeams();
        MatchController.loadMatches();
        setInterval(() => {
            MatchController.loadMatches();
        }, MATCH_FETCH_TIME)
    }

    public static getMatches = async (req: Request, res: Response) => {
        const user = await getRepository(User).findOne(res.locals.jwtPayload.userId);
        const tipRepository = getRepository(Tip);
        const myTips = await tipRepository.find({where: { user }});
        const allExpertTips = await tipRepository.createQueryBuilder('tip')
        .innerJoinAndSelect('tip.user', 'user')
        .where('user.isExpert = true').getMany();
        res.send(MatchController.matches.map((m) => {
            const match = copy(m) as Match;
            const expertTipps = allExpertTips.filter((t) => t.matchId == match.id);
            const tip = myTips.find((t) => t.matchId == match.id);
            if (tip) {
                match.myTip.homeTeam = tip.scoreHomeTeam;
                match.myTip.awayTeam = tip.scoreAwayTeam;
            }

            const expertCountHomeTeam = expertTipps.filter((t) => t.scoreAwayTeam < t.scoreHomeTeam).length;
            const expertCountAwayTeam = expertTipps.filter((t) => t.scoreAwayTeam > t.scoreHomeTeam).length;
            const expertCountDraw = expertTipps.filter((t) => t.scoreAwayTeam == t.scoreHomeTeam).length;
            const expertCountTotal = expertCountHomeTeam + expertCountDraw + expertCountAwayTeam;

            match.expertOdds = {
                points: {
                    homeTeam: 10 * (expertCountDraw + expertCountAwayTeam) / expertCountTotal || 0,
                    draw: 10 * (expertCountHomeTeam + expertCountAwayTeam) / expertCountTotal || 0,
                    awayTeam: 10 * (expertCountHomeTeam + expertCountDraw) / expertCountTotal || 0,
                },
                count: {
                    homeTeam: expertCountHomeTeam,
                    draw: expertCountDraw,
                    awayTeam: expertCountAwayTeam,
                }
            };
            match.expertTips = Object.fromEntries(expertTipps.map((expertTip) => {
                return [
                    expertTip.user.id,
                    {
                        homeTeam: expertTip.scoreHomeTeam,
                        awayTeam: expertTip.scoreAwayTeam
                    },
                ];
            }));
            return match;
        }));
    }

    public static getTeams = async (req: Request, res: Response) => {
        res.send(MatchController.teams);
    }

    private static async loadMatches() {
        const request = await fetch(`https://api.football-data.org/v2/competitions/${EUROPEAN_CHAMPIONSHIP_ID}/matches?season=${CURRENT_SEASON_YEAR}`, {
            headers: {
                "X-Auth-Token": "79fe8894898e4ca6aee7c1fd9142f91c",
            },
        });
        this.matches = (await request.json())?.matches.map((m: Match, i) => {
            m.number = i + 1;
            m.finalScore = {
                homeTeam: m.score.penalties.homeTeam ?? m.score.extraTime.homeTeam ?? m.score.fullTime.homeTeam,
                awayTeam: m.score.penalties.awayTeam ?? m.score.extraTime.awayTeam ?? m.score.fullTime.awayTeam,
            };
            m.location = LOCATIONS[m.id] || "";
            m.homeTeam.name = COUNTRIES[m.homeTeam.name];
            m.awayTeam.name = COUNTRIES[m.awayTeam.name];
            m.myTip = {
                awayTeam: null,
                homeTeam: null,
            };
            /* ONLY FOR TESTING */
            /*
            if (Math.random() < 0.2) {
                m.utcDate = new Date(Date.now() + 20 * 1000).toISOString();
            } */
            const remainingTime = new Date(m.utcDate).getTime() - new Date().getTime();
            if (remainingTime < MATCH_FETCH_TIME) {
                setTimeout(() => {
                    MatchController.updateMatchStatus(m);
                }, remainingTime);
            }
            MatchController.updateMatchStatus(m);
            return m;
        }) || this.matches || [];
    }

    private static updateMatchStatus(m: Match) {
        if (new Date(m.utcDate) < new Date()) {
            m.status = MatchStatus.IN_PLAY;
        }
    }

    private static async loadTeams() {
        const request = await fetch(`https://api.football-data.org/v2/competitions//${EUROPEAN_CHAMPIONSHIP_ID}/teams?season=${CURRENT_SEASON_YEAR}`, {
            headers: {
                "X-Auth-Token": "79fe8894898e4ca6aee7c1fd9142f91c",
            },
        });
        this.teams = (await request.json())?.teams || this.teams || [];
    }

    public static updateTip = async (req: Request, res: Response) => {
        const { id } = req.params;
        const matchId = Number(id);
        const { scoreHomeTeam, scoreAwayTeam } = req.body;

        const userRepository = getRepository(User);
        const tipRepository = getRepository(Tip);
        try {
            const match = MatchController.matches.find((m) => m.id === matchId);
            if (!match) {
                res.status(500).send({ message: "Dieses Spiel existiert nicht!" });
                return;
            }
            if (match.status !== MatchStatus.SCHEDULED) {
                res.status(500).send({ message: "Dieses Spiel hat bereits begonnen!" });
                return;
            }
            if (!isNumber(scoreHomeTeam) || !isNumber(scoreAwayTeam)) {
                res.status(500).send({ message: "Nicht alle Felder ausgefüllt!" });
                return;
            }
            const user = await userRepository.findOne(res.locals.jwtPayload.userId);
            let tip = await tipRepository.findOne({ where: { user, matchId } });
            if (!tip) {
                tip = new Tip();
                tip.user = user;
                tip.matchId = matchId;
            }
            tip.scoreHomeTeam = scoreHomeTeam;
            tip.scoreAwayTeam = scoreAwayTeam;
            await tipRepository.save(tip);
        } catch (e) {
            res.status(500).send({ message: "Konnte die Info nicht ändern!" });
            return;
        }
        log("usertip changed", { user: res.locals.jwtPayload.userId, matchId, scoreHomeTeam, scoreAwayTeam });
        res.status(200).send({ success: true });
    }
}