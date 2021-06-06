import { Component } from "@angular/core";
import { Team } from "../../_models/Match";
import { RemoteService } from "../../_services/remote.service";
import { CHAMPION_DEADLINE } from "../../_data/champion";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-champion",
    templateUrl: "./champion.component.html",
    styleUrls: ["./champion.component.scss"],
})
export class ChampionComponent {
    championDeadline = CHAMPION_DEADLINE;
    closed = new Date() >= this.championDeadline;
    tip: number;
    teams: Team[];
    tipTeamName: string;
    loaded = false;

    constructor(private remoteService: RemoteService, private alertService: AlertService) {
        //
    }

    public updateTip(teamId: string): void {
        this.remoteService.post("champion", { teamId }).subscribe((d: {success: boolean}) => {
            if (d?.success) {
                this.alertService.success("Dein Tipp wurde erfolgreich gespeichert!");
            }
        });
    }

    public ngOnInit(): void {
        this.remoteService.get("champion").subscribe((data: { tip: number, teams: Team[] }) => {
            this.tip = data.tip;
            this.teams = data.teams;
            this.loaded = true;
            if (this.tip) {
                this.tipTeamName = this.teams.find((t) => t.id == this.tip)?.name;
            }
        });
    }
}
