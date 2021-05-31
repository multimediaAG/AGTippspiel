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
            m.location = LOCATIONS[m.id] || "";
            m.homeTeam.name = COUNTRIES[m.homeTeam.name];
            m.awayTeam.name = COUNTRIES[m.awayTeam.name];
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