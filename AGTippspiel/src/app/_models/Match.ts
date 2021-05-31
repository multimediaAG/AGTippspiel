
/*    +-----------------------------------------------------------------------+    */
/*    |    Do not edit this file directly.                                    |    */
/*    |    It was copied by redundancyJS.                                     |    */
/*    |    To modify it, first edit the source file (see redundancy.json).    |    */
/*    |    Then, run "npx redundancyjs" in the terminal.                      |    */
/*    +-----------------------------------------------------------------------+    */

/* do not edit */ export class Match {
/* do not edit */     id: number;
/* do not edit */     number: number;
/* do not edit */     season: Season;
/* do not edit */     utcDate: string;
/* do not edit */     status: MatchStatus;
/* do not edit */     stage: Stage;
/* do not edit */     location: string;
/* do not edit */     group: string;
/* do not edit */     lastUpdated: string;
/* do not edit */     finalScore: {
/* do not edit */         homeTeam: number | null;
/* do not edit */         awayTeam: number | null;
/* do not edit */     };
/* do not edit */     odds: {};
/* do not edit */     homeTeam: {
/* do not edit */         id: string;
/* do not edit */         name: string;
/* do not edit */     };
/* do not edit */     awayTeam: {
/* do not edit */         id: string;
/* do not edit */         name: string;
/* do not edit */     };
/* do not edit */     score: {
/* do not edit */         winner: Winner;
/* do not edit */         duration: any;
/* do not edit */         fullTime: {
/* do not edit */             homeTeam: number | null;
/* do not edit */             awayTeam: number | null;
/* do not edit */         };
/* do not edit */         halfTime: {
/* do not edit */             homeTeam: number | null;
/* do not edit */             awayTeam: number | null;
/* do not edit */         };
/* do not edit */         extraTime: {
/* do not edit */             homeTeam: number | null;
/* do not edit */             awayTeam: number | null;
/* do not edit */         };
/* do not edit */         penalties: {
/* do not edit */             homeTeam: number | null;
/* do not edit */             awayTeam: number | null;
/* do not edit */         };
/* do not edit */     };
/* do not edit */ }
/* do not edit */ 
/* do not edit */ export enum Winner {
/* do not edit */     HOME_TEAM = "HOME_TEAM",
/* do not edit */     AWAY_TEAM = "AWAY_TEAM",
/* do not edit */     DRAW = "DRAW",
/* do not edit */ }
/* do not edit */ 
/* do not edit */ export enum MatchStatus {
/* do not edit */     SCHEDULED = "SCHEDULED",
/* do not edit */     LIVE = "LIVE",
/* do not edit */     IN_PLAY = "IN_PLAY",
/* do not edit */     PAUSED = "PAUSED",
/* do not edit */     FINISHED = "FINISHED",
/* do not edit */     POSTPONED = "POSTPONED",
/* do not edit */     SUSPENDED = "SUSPENDED",
/* do not edit */     CANCELED = "CANCELED",
/* do not edit */ }
/* do not edit */ 
/* do not edit */ export enum Stage {
/* do not edit */     GROUP_STAGE = "GROUP_STAGE",
/* do not edit */     LAST_16 = "LAST_16",
/* do not edit */     QUARTER_FINAL = "QUARTER_FINAL",
/* do not edit */     SEMI_FINAL = "SEMI_FINAL",
/* do not edit */     FINAL = "FINAL",
/* do not edit */ }
/* do not edit */ 
/* do not edit */ export class Season {
/* do not edit */     id: number;
/* do not edit */     startDate: string;
/* do not edit */     endDate: string;
/* do not edit */     currentMatchDay: number;
/* do not edit */ }
/* do not edit */ 
/* do not edit */ export class Team {
/* do not edit */     id: number;
/* do not edit */     area: {
/* do not edit */         id: number;
/* do not edit */         name: string;
/* do not edit */     };
/* do not edit */     name: string;
/* do not edit */     shortName: string;
/* do not edit */     tla: string;
/* do not edit */     crestUrl: string;
/* do not edit */     address: string;
/* do not edit */     phone: string;
/* do not edit */     website: string;
/* do not edit */     email: string;
/* do not edit */     founded: number;
/* do not edit */     clubColors: string;
/* do not edit */     venue: string;
/* do not edit */     lastUpdated: string;
/* do not edit */ }