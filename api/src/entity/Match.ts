/* tslint:disable:max-classes-per-file */
export class Match {
    id: number;
    number: number;
    season: Season;
    utcDate: string;
    status: MatchStatus;
    stage: Stage;
    location: string;
    group: string;
    lastUpdated: string;
    myTip: {
        homeTeam: number | null;
        awayTeam: number | null;
    };
    expertTips: {
        [id: number]: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
    };
    expertOdds: {
        count: {
            homeTeam: number;
            draw: number;
            awayTeam: number;
        };
        points: {
            homeTeam: number;
            draw: number;
            awayTeam: number;
        };
    };
    finalScore: {
        homeTeam: number | null;
        awayTeam: number | null;
    };
    odds: {};
    homeTeam: {
        id: string;
        name: string;
    };
    awayTeam: {
        id: string;
        name: string;
    };
    score: {
        winner: Winner;
        duration: any;
        fullTime: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
        halfTime: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
        extraTime: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
        penalties: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
    };
}

export enum Winner {
    HOME_TEAM = "HOME_TEAM",
    AWAY_TEAM = "AWAY_TEAM",
    DRAW = "DRAW",
}

export enum MatchStatus {
    SCHEDULED = "SCHEDULED",
    LIVE = "LIVE",
    IN_PLAY = "IN_PLAY",
    PAUSED = "PAUSED",
    FINISHED = "FINISHED",
    POSTPONED = "POSTPONED",
    SUSPENDED = "SUSPENDED",
    CANCELED = "CANCELED",
}

export enum Stage {
    GROUP_STAGE = "GROUP_STAGE",
    LAST_16 = "LAST_16",
    QUARTER_FINAL = "QUARTER_FINAL",
    SEMI_FINAL = "SEMI_FINAL",
    FINAL = "FINAL",
}

export class Season {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchDay: number;
}

export class Team {
    id: number;
    area: {
        id: number;
        name: string;
    };
    name: string;
    shortName: string;
    tla: string;
    crestUrl: string;
    address: string;
    phone: string;
    website: string;
    email: string;
    founded: number;
    clubColors: string;
    venue: string;
    lastUpdated: string;
}