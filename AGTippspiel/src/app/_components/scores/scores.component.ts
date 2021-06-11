import { Component } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { User } from "../../_models/User";
import { Team } from "../../_models/Match";

@Component({
    selector: "app-scores",
    templateUrl: "./scores.component.html",
    styleUrls: ["./scores.component.scss"],
})
export class ScoresComponent {
    public users: User[] = [];
    public allUsers: User[] = [];
    public myPlace: number;
    public placesCount: number;
    public teams: Record<number, Team> = {};
    public views = [
        {
            id: "all",
            name: "Alle",
        },
        {
            id: "students",
            name: "Schüler",
        },
        {
            id: "parents",
            name: "Eltern",
        },
        {
            id: "teachers",
            name: "Lehrer",
        },
        {
            id: "grades-absolute",
            name: "Klassen (absolut)",
        },
        {
            id: "grades-relative",
            name: "Klassen (relativ)",
        },
    ];
    public currentView = this.views[0];
    constructor(private remoteService: RemoteService,
        public authenticationService: AuthenticationService) { }

    public ngOnInit() {
        this.remoteService.get("users").subscribe((data) => {
            if (data) {
                this.allUsers = data;
                this.filterAndDisplayData();
            }
        });
        this.remoteService.get("matches/teams").subscribe((d: Team[]) => {
            this.teams = {};
            for (const team of d) {
                this.teams[team.id] = team;
            }
        });
    }

    private filterAndDisplayData() {
        if (this.currentView.id == "all") {
            this.users = this.allUsers;
        } else if (this.currentView.id == "students") {
            this.users = this.allUsers.filter((u) => u.grade.length < 4);
        } else if (this.currentView.id == "ravk") {
            this.users = this.allUsers.filter((u) => u.grade == "RAVK");
        } else if (this.currentView.id == "teachers") {
            this.users = this.allUsers.filter((u) => u.grade.length > 4 && u.grade != "Eltern");
        } else if (this.currentView.id == "parents") {
            this.users = this.allUsers.filter((u) => u.grade == "Eltern");
        } else if (this.currentView.id == "grades-relative" || this.currentView.id == "grades-absolute") {
            const grades: Record<string, { points: number, users: number }> = {};
            for (const user of this.allUsers) {
                if (!grades[user.grade]) {
                    grades[user.grade] = {
                        points: 0,
                        users: 0,
                    };
                }
                grades[user.grade].points += user.points;
                grades[user.grade].users++;
            }

            grades.Experten = {
                points: this.allUsers.filter((u) => u.isExpert).reduce((a, b) => a + b.points, 0),
                users: this.allUsers.filter((u) => u.isExpert).length,
            };

            this.users = [];
            for (const [grade, d] of Object.entries(grades) as any) {
                let points = this.currentView.id == "grades-absolute" ? d.points : Math.round(d.points / d.users);
                if (Number.isNaN(points)) {
                    points = 0;
                }
                this.users.push({
                    grade,
                    points,
                } as any);
            }
            this.users.sort((a, b) => b.points - a.points);
        }
        let place = 1;
        let lastUser: User;
        for (const user of this.users) {
            if (lastUser && lastUser.points && user.points < lastUser.points) {
                place++;
            }
            user.place = place;
            lastUser = user;
        }
        if (this.authenticationService.loggedIn) {
            if (this.currentView.id == "grades-absolute" || this.currentView.id == "grades-relative") {
                this.myPlace = this.users.filter(
                    (u) => u.grade == this.authenticationService.currentUser.grade,
                )[0].place;
            } else {
                const user = this.users.filter(
                    (u) => u.username == this.authenticationService.currentUser.username,
                );
                if (user && user[0]) {
                    this.myPlace = user[0].place;
                } else {
                    this.myPlace = undefined;
                }
            }
            this.placesCount = this.users[this.users.length - 1]?.place || 0;
        }
    }

    public view(v: {id: string, name: string}): void {
        this.currentView = v;
        this.filterAndDisplayData();
    }
}
