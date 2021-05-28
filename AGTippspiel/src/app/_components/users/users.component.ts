import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";
import { User } from "../../_models/User";

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
    public users: User[] = [];
    public userCount = 0;
    public currentUser: User;
    constructor(private remoteService: RemoteService,
        private alertService: AlertService, private modalService: NgbModal) { }

    public ngOnInit(): void {
        this.remoteService.get("users/admin").subscribe((data) => {
            if (data) {
                this.users = data;
                this.userCount = data.length;
            }
        });
    }

    public resetUserPassword(user: User): void {
        // eslint-disable-next-line
        if (confirm(`Soll das Passwort für "${user.realName}" mit dem Nicknamen "${user.username}" wirklich zurückgesetzt werden?`)) {
            // eslint-disable-next-line
            const newPassword = prompt(`Neues Passwort für "${user.realName}" mit dem Nicknamen "${user.username}":`);
            if (newPassword) {
                this.remoteService.post(`users/${user.id}/password`, { password: newPassword }).subscribe((data) => {
                    if (data && data.status) {
                        this.alertService.success("Passwort erfolgreich geändert!");
                    }
                });
            }
        }
    }

    public changeAdminStatus(user: User, willBeAdmin: boolean): void {
        // eslint-disable-next-line
        if (confirm(willBeAdmin ? `Soll" ${user.realName}" mit dem Nicknamen "${user.username}" wirklich zum Administrator gemacht werden?` : `Soll "${user.realName}" mit dem Nicknamen "${user.username}" wirklich kein Administrator mehr sein?`)) {
            this.remoteService.post(`users/${user.id}/admin`, { admin: willBeAdmin }).subscribe((data) => {
                if (data && data.status) {
                    this.alertService.success(willBeAdmin ? "Benutzer erfolgreich zum Admin gemacht!" : "Adminstatus erfolgreich entfernt!");
                    this.ngOnInit();
                }
            });
        }
    }

    public deleteUser(user: User): void {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Soll" ${user.realName}" mit dem Nicknamen "${user.username}" wirklich gelöscht werden?`)) {
            this.remoteService.delete(`users/${user.id}`).subscribe((data) => {
                if (data && data.status) {
                    this.alertService.success("Benutzer erfolgreich gelöscht!");
                    this.ngOnInit();
                }
            });
        }
    }
}
