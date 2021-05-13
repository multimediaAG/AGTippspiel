const EUROPEAN_CHAMPIONSHIP_ID = 2018;
const CURRENT_SEASON_YEAR = 2021;
import fetch from "node-fetch";
import { Request, Response } from "express";

export class MatchController {
    static matches: any;
    public static async init() {
        MatchController.loadMatches();
        setInterval(() => {
            MatchController.loadMatches();
        }, 60 * 1000)
    }

    public static getMatches = async (req: Request, res: Response) => {
        res.send(MatchController.matches);
      }

    private static async loadMatches() {
        const request = await fetch(`http://api.football-data.org/v2/competitions/2018/matches?season=2021`, {
            headers: {
                "X-Auth-Token": "change me",
            },
        });
        this.matches = await request.json();
        console.log("matches loaded")
    }
}