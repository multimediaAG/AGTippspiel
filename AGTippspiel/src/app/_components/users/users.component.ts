import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";
import { User } from "../../_models/User";
import { AuthenticationService } from "../../_services/authentication.service";

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
    public users: User[] = [];
    public userCount = 0;
    public currentExpert: User;
    public uploadConfig: any;
    public timestamp = Date.now();

    constructor(private remoteService: RemoteService,
        private alertService: AlertService, private modalService: NgbModal,
        private authService: AuthenticationService) { }

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

    public getPreviewImageUrl(): string {
        return `/api/users/${this.currentExpert.id}/expert/picture?authorization=${sessionStorage.getItem("jwt_token")}&timestamp=${this.timestamp}`;
    }

    public refreshImage(): void {
        this.timestamp = Date.now();
    }

    public openExpertModal(expert: User, modal: any): void {
        this.currentExpert = expert;
        this.uploadConfig = {
            formatsAllowed: ".jpg,.jpeg",
            multiple: false,
            uploadAPI: {
                url: `/api/users/${this.currentExpert.id}/expert/picture`,
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwt_token")}`,
                },
            },
            hideResetBtn: true,
            hideProgressBar: true,
            replaceTexts: {
                selectFileBtn: "Dateien auswählen",
                resetBtn: "Zurücksetzen",
                uploadBtn: "Hochladen",
                dragNDropBox: "Drag and Drop",
                attachPinBtn: "Dateien auswählen",
                afterUploadMsg_success: "Erfolgreich hochgeladen!",
                afterUploadMsg_error: "Upload fehlgeschlagen",
                sizeLimit: "Maximale Größe",
            },
        };
        this.modalService.open(modal, { size: "lg" });
    }

    public saveExpert(): void {
        this.remoteService.post(`users/${this.currentExpert.id}/expert/info`, {
            text: this.currentExpert.expertText,
            position: this.currentExpert.expertPosition,
            index: this.currentExpert.expertIndex,
        }).subscribe((data) => {
            if (data && data.status) {
                this.alertService.success("Änderungen erfolgreich gespeichert!");
                this.ngOnInit();
            }
        });
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

    public changeExpertStatus(user: User, willBeExpert: boolean): void {
        // eslint-disable-next-line
        if (confirm(willBeExpert ? `Soll" ${user.realName}" mit dem Nicknamen "${user.username}" wirklich zum Experten gemacht werden?` : `Soll "${user.realName}" mit dem Nicknamen "${user.username}" wirklich kein Experte mehr sein?`)) {
            this.remoteService.post(`users/${user.id}/expert`, { expert: willBeExpert }).subscribe((data) => {
                if (data && data.status) {
                    this.alertService.success(willBeExpert ? "Benutzer erfolgreich zum Experten gemacht!" : "Expertenstatus erfolgreich entfernt!");
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
