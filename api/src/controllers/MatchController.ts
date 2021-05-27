const EUROPEAN_CHAMPIONSHIP_ID = 2018;
const CURRENT_SEASON_YEAR = 2021;

import fetch from "node-fetch";
import { Request, Response } from "express";
import { Match, Team } from "../entity/Match";

export class MatchController {
    static matches: Match[];
    static teams: Team[];
    public static async init() {
        MatchController.loadTeams();
        MatchController.loadMatches();
        setInterval(() => {
            MatchController.loadMatches();
        }, 60 * 1000)
    }

    public static getMatches = async (req: Request, res: Response) => {
        res.send(MatchController.matches);
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
            return m;
        }) || this.matches || [];
    }

    

    private static async loadTeams() {
        const request = await fetch(`https://api.football-data.org/v2/competitions//${EUROPEAN_CHAMPIONSHIP_ID}/teams?season=${CURRENT_SEASON_YEAR}`, {
            headers: {
                "X-Auth-Token": "79fe8894898e4ca6aee7c1fd9142f91c",
            },
        });
        this.teams = (await request.json())?.teams || this.teams || [];
    }
}