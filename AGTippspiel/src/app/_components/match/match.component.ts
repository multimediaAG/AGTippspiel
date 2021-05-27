import { Component, OnInit } from "@angular/core";
import { Match, Team } from "../../_models/Match";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-match",
    templateUrl: "./match.component.html",
    styleUrls: ["./match.component.scss"],
})
export class MatchComponent implements OnInit {
    public matches: Match[] = [];
    public teams: Record<number, Team> = {};

    constructor(public authenticationService: AuthenticationService,
        private remoteService: RemoteService) { }

    public ngOnInit(): void {
        this.remoteService.get("matches").subscribe((d: Match[]) => {
            this.matches = d.sort((a, b) => (new Date(a.utcDate) > new Date(b.utcDate)
                ? 1
                : a.utcDate == b.utcDate
                    ? 0
                    : -1
            ));
        });
        this.remoteService.get("matches/teams").subscribe((d: Team[]) => {
            this.teams = {};
            for (const team of d) {
                this.teams[team.id] = team;
            }
        });
    }
}
