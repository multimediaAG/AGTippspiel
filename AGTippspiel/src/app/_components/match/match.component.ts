import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { User } from "../../_models/User";
import {
    Match, MatchStatus, Stage, Team,
} from "../../_models/Match";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-match",
    templateUrl: "./match.component.html",
    styleUrls: ["./match.component.scss"],
})
export class MatchComponent implements OnInit {
    public allMatches: Match[] = [];
    public upcomingMatches: Match[] = [];
    public finishedMatches: Match[] = [];
    public currentMatch: Match;
    public teams: Record<number, Team> = {};
    public experts: User[] = [];
    public untippedMatchCount = 0;
    public showUpcomingMatches = true;

    public stageNames: Record<Stage, string> = {
        [Stage.GROUP_STAGE]: "Gruppenphase",
        [Stage.LAST_16]: "Achtelfinale",
        [Stage.QUARTER_FINAL]: "Viertelfinale",
        [Stage.SEMI_FINAL]: "Halbfinale",
        [Stage.FINAL]: "Finale",
    }

    public tipHomeTeam: number;
    public tipAwayTeam: number;

    constructor(public authenticationService: AuthenticationService,
        private remoteService: RemoteService, private modalService: NgbModal,
        private alertService: AlertService) { }

    public ngOnInit(): void {
        this.remoteService.get("matches").subscribe((d: Match[]) => {
            this.allMatches = d.sort((a, b) => (new Date(a.utcDate) > new Date(b.utcDate)
                ? 1
                : a.utcDate == b.utcDate
                    ? 0
                    : -1
            ));
            this.finishedMatches = this.allMatches.filter((m) => (
                new Date().getTime() - new Date(m.utcDate).getTime()) > 0).reverse();
            this.upcomingMatches = this.allMatches.filter((m) => {
                const timeNow = new Date().getTime();
                const matchDate = new Date(m.utcDate);
                if ((timeNow - matchDate.getTime()) <= 0) {
                    return true;
                }
                const diffDays = new Date().getDate() - matchDate.getDate();
                const diffMonths = new Date().getMonth() - matchDate.getMonth();
                const diffYears = new Date().getFullYear() - matchDate.getFullYear();

                return (diffYears === 0 && diffMonths == 0 && diffDays === 0);
            });
            this.updateUntippedCount();
        });
        this.remoteService.get("matches/teams").subscribe((d: Team[]) => {
            this.teams = {};
            for (const team of d) {
                this.teams[team.id] = team;
            }
        });
        this.remoteService.get("users/experts").subscribe((d: User[]) => {
            this.experts = d;
        });
    }

    private updateUntippedCount() {
        this.untippedMatchCount = this.upcomingMatches
            .filter((m) => m.status == MatchStatus.SCHEDULED
            && (m.myTip.awayTeam === null
                || m.myTip.homeTeam === null)
            && m.homeTeam?.id
            && m.awayTeam?.id).length;
    }

    public onCountdownFinished(match: Match): void {
        match.status = MatchStatus.IN_PLAY;
        this.updateUntippedCount();
    }

    public saveTip(): void {
        this.currentMatch.myTip.homeTeam = this.tipHomeTeam;
        this.currentMatch.myTip.awayTeam = this.tipAwayTeam;
        this.remoteService.post(`matches/${this.currentMatch.id}/tip`, {
            scoreHomeTeam: this.currentMatch.myTip.homeTeam,
            scoreAwayTeam: this.currentMatch.myTip.awayTeam,
        }).subscribe((d: {success: boolean}) => {
            if (d.success) {
                this.alertService.success("Dein Tipp wurde erfolgreich gespeichert!");
                this.modalService.dismissAll();
                this.ngOnInit();
            }
        });
    }

    public getExpertPictureUrl(expert: User): string {
        return `/api/users/${expert.id}/expert/picture?authorization=${sessionStorage.getItem("jwt_token")}`;
    }

    public openMatchModal(match: Match, modal: any): void {
        this.currentMatch = match;
        this.tipHomeTeam = match.myTip.homeTeam;
        this.tipAwayTeam = match.myTip.awayTeam;
        this.modalService.open(modal, { size: "xl", scrollable: true });
    }
}
