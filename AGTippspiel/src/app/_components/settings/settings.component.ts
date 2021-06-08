import { Component, OnInit } from "@angular/core";
import { Team } from "../../_models/Match";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent {
    showRealName: boolean;

    constructor(private remoteService: RemoteService, private alertService: AlertService,
        private authenticationService: AuthenticationService) {
        this.showRealName = this.authenticationService.currentUser.showRealName;
    }

    public updateShowRealName(showRealName: string): void {
        this.remoteService.post("users/showRealName", { showRealName }).subscribe((d: {success: boolean}) => {
            if (d?.success) {
                this.alertService.success("Deine Einstellungen wurden erfolgreich gespeichert!");
            }
        });
    }
}
