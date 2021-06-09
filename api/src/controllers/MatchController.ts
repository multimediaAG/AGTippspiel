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

export const COUNTRIES: Record<string, {name: string, cc: string}> = {
    "Turkey": { name: "Türkei", cc: "tr" },
    "Italy": { name: "Italien", cc: "it" },
    "Wales": { name: "Wales", cc: "gb-wls" },
    "Switzerland": { name: "Schweiz", cc: "ch" },
    "Denmark": { name: "Dänemark", cc: "dk" },
    "Finland": { name: "Finnland", cc: "fi" },
    "Belgium": { name: "Belgien", cc: "be" },
    "Russia": { name: "Russland", cc: "ru" },
    "England": { name: "England", cc: "gb" },
    "Croatia": { name: "Kroatien", cc: "hr" },
    "Austria": { name: "Österreich", cc: "at" },
    "North Macedonia": { name: "Nordmazedonien", cc: "mk" },
    "Netherlands": { name: "Niederlande", cc: "nl" },
    "Ukraine": { name: "Ukraine", cc: "ua" },
    "Scotland": { name: "Schottland", cc: "gb-sct" },
    "Czech Republic": { name: "Tschechien", cc: "cz" },
    "Poland": { name: "Polen", cc: "pl" },
    "Slovakia": { name: "Slowakei", cc: "sk" },
    "Spain": { name: "Spanien", cc: "es" },
    "Sweden": { name: "Schweden", cc: "se" },
    "Hungary": { name: "Ungarn", cc: "hu" },
    "Portugal": { name: "Portugal", cc: "pt" },
    "France": { name: "Frankreich", cc: "fr" },
    "Germany": { name: "Deutschland", cc: "de" },
}

import fetch from "node-fetch";
import { Request, Response } from "express";
import { Match, MatchStatus, Stage, Team, Winner } from "../entity/Match";
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
        const allExpertTips = await MatchController.getAllExpertTips(tipRepository);
        res.send(MatchController.matches.map((m) => {
            const match = copy(m) as Match;
            const tip = myTips.find((t) => t.matchId == match.id);
            const expertTipps = allExpertTips.filter((t) => t.matchId == match.id);
            MatchController.addExpertOdds(expertTipps, match);
            match.expertTips = Object.fromEntries(expertTipps.map((expertTip) => {
                return [
                    expertTip.user.id,
                    {
                        homeTeam: expertTip.scoreHomeTeam,
                        awayTeam: expertTip.scoreAwayTeam
                    },
                ];
            }));

            if (tip) {
                match.myTip.homeTeam = tip.scoreHomeTeam;
                match.myTip.awayTeam = tip.scoreAwayTeam;
                match.myPoints = MatchController.getPointsForTip(match, tip);
            } else {
                match.myPoints = 0;
            }
            return match;
        }));
    }

    public static getTeams = async (req: Request, res: Response) => {
        res.send(MatchController.teams);
    }

    private static async getAllExpertTips(tipRepository) {
        return await tipRepository.createQueryBuilder('tip')
            .innerJoinAndSelect('tip.user', 'user')
            .where('user.isExpert = true').getMany();
    }

    private static addExpertOdds(expertTipps: Tip[], match: Match) {
        const expertCountHomeTeam = expertTipps.filter((t) => t.scoreAwayTeam < t.scoreHomeTeam).length;
        const expertCountAwayTeam = expertTipps.filter((t) => t.scoreAwayTeam > t.scoreHomeTeam).length;
        const expertCountDraw = expertTipps.filter((t) => t.scoreAwayTeam == t.scoreHomeTeam).length;
        const expertCountTotal = expertCountHomeTeam + expertCountDraw + expertCountAwayTeam;

        match.expertOdds = {
            points: {
                homeTeam: MatchController.round(10 * (expertCountDraw + expertCountAwayTeam) / expertCountTotal) || 0,
                draw: MatchController.round(10 * (expertCountHomeTeam + expertCountAwayTeam) / expertCountTotal) || 0,
                awayTeam: MatchController.round(10 * (expertCountHomeTeam + expertCountDraw) / expertCountTotal) || 0,
            },
            count: {
                homeTeam: expertCountHomeTeam,
                draw: expertCountDraw,
                awayTeam: expertCountAwayTeam,
            }
        };
    }

    private static getPointsForTip(match: Match, tip: Tip): number | null {
        if (match.status !== MatchStatus.FINISHED) {
            return null;
        }
        let points = 0;
        // Base Points
        if (match.finalScore.awayTeam === tip.scoreAwayTeam && match.finalScore.homeTeam === tip.scoreHomeTeam) {
            points += 30;
        } else if (match.score.winner == Winner.DRAW) {
            if (tip.scoreAwayTeam === tip.scoreHomeTeam) {
                points += 10;
            }
        } else {
            const scoreDiff = match.finalScore.awayTeam - match.finalScore.homeTeam;
            const tipDiff = (tip.scoreAwayTeam - tip.scoreHomeTeam);
            if (scoreDiff === tipDiff) {
                points += 20;
            } else if (((scoreDiff > 0) === (tipDiff > 0)) && scoreDiff !== 0 && tipDiff !== 0) {
                points += 10;
            }
        }
        // Expert Points
        if (points > 0) {
            if (match.score.winner == Winner.DRAW) {
                points += match.expertOdds.points.draw;
            } else if (match.score.winner == Winner.HOME_TEAM) {
                points += match.expertOdds.points.homeTeam;
            } else if (match.score.winner == Winner.AWAY_TEAM) {
                points += match.expertOdds.points.awayTeam;
            }
        }
        // Multiply by round
        switch (match.stage) {
            case Stage.GROUP_STAGE:
                points *= 1;
                break;
            case Stage.LAST_16:
                points *= 1.5;
                break;
            case Stage.QUARTER_FINAL:
                points *= 2.5;
                break;
            case Stage.SEMI_FINAL:
                points *= 3;
                break;
            case Stage.FINAL:
                points *= 4;
                break;
        }
        return MatchController.round(points);
    }

    private static async loadMatches() {
        const request = await fetch(`https://api.football-data.org/v2/competitions/${EUROPEAN_CHAMPIONSHIP_ID}/matches?season=${CURRENT_SEASON_YEAR}`, {
            headers: {
                "X-Auth-Token": "79fe8894898e4ca6aee7c1fd9142f91c",
            },
        });
        this.matches = (await request.json())?.matches.map((m: Match, i) => {
            /* ONLY FOR TESTING */
            /* if (m.stage == Stage.FINAL) {
                m.status = MatchStatus.FINISHED;
                m.homeTeam = {
                    id: "768",
                    name: "Slovakia"
                };
                m.awayTeam = {
                    id: "770",
                    name: "England"
                };
                m.score = {
                    winner: Winner.AWAY_TEAM,
                    duration: null,
                    halfTime: {
                        awayTeam: 0,
                        homeTeam: 2,
                    },
                    extraTime: {
                        awayTeam: null,
                        homeTeam: null,
                    },
                    fullTime: {
                        awayTeam: 2,
                        homeTeam: 2,
                    },
                    penalties: {
                        awayTeam: null,
                        homeTeam: null,
                    },
                };
            } */
            m.number = i + 1;
            m.finalScore = {
                homeTeam: m.score.penalties.homeTeam ?? m.score.extraTime.homeTeam ?? m.score.fullTime.homeTeam,
                awayTeam: m.score.penalties.awayTeam ?? m.score.extraTime.awayTeam ?? m.score.fullTime.awayTeam,
            };
            m.location = LOCATIONS[m.id] || "";
            m.homeTeam.name = COUNTRIES[m.homeTeam.name]?.name;
            m.awayTeam.name = COUNTRIES[m.awayTeam.name]?.name;
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
        }) || MatchController.matches || [];
        if (this.matches.length > 0) {
            MatchController.calculateUserPoints();
        }
    }

    private static updateMatchStatus(m: Match) {
        if (new Date(m.utcDate) < new Date()) {
            m.status = MatchStatus.IN_PLAY;
        }
    }

    private static round(v: number) {
        return Math.ceil(v * 10) / 10;
    }

    private static async calculateUserPoints() {
        const userRepository = getRepository(User);
        const users = await userRepository.find({ relations: ["tips"] });
        const allExpertTips = await MatchController.getAllExpertTips(getRepository(Tip));
        const matches: Record<string, Match> = {};
        for (const m of MatchController.matches) {
            const match = copy(m);
            const expertTipps = allExpertTips.filter((t) => t.matchId == match.id);
            MatchController.addExpertOdds(expertTipps, match);
            matches[match.id] = match;
        }
        const final = MatchController.matches.find((m) => m.stage == Stage.FINAL);
        let champion;
        if (final) {
            champion = final.score.winner == Winner.HOME_TEAM ? final.homeTeam.id : final.awayTeam.id;
        }
        for (const user of users) {
            user.points = user.tips.map((t) => MatchController.getPointsForTip(matches[t.matchId], t)).reduce((a, b) => a + b, 0);
            if (champion && user.champion == champion) {
                user.points += 80;
            }
        }
        await userRepository.save(users);
    }

    private static async loadTeams() {
        const request = await fetch(`https://api.football-data.org/v2/competitions//${EUROPEAN_CHAMPIONSHIP_ID}/teams?season=${CURRENT_SEASON_YEAR}`, {
            headers: {
                "X-Auth-Token": "79fe8894898e4ca6aee7c1fd9142f91c",
            },
        });
        this.teams = (await request.json())?.teams || this.teams || [];
        this.teams = this.teams.map((t) => {
            t.cc = COUNTRIES[t.name].cc;
            return t;
        });
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