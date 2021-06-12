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
    private experts: { count: number; totalTips: number; points: number; };
    constructor(private remoteService: RemoteService,
        public authenticationService: AuthenticationService) { }

    public ngOnInit() {
        this.remoteService.get("users").subscribe((data: {users: User[], experts: { count: number, totalTips: number, points: number }}) => {
            if (data && data.users && data.experts) {
                this.allUsers = data.users;
                this.experts = data.experts;
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
            this.users = [...this.allUsers];
            this.addExpertAverageUser();
        } else if (this.currentView.id == "students") {
            this.users = this.allUsers.filter((u) => u.grade.length < 4);
            this.addExpertAverageUser();
        } else if (this.currentView.id == "teachers") {
            this.users = this.allUsers.filter((u) => u.grade.length > 4 && u.grade != "Eltern");
            this.addExpertAverageUser();
        } else if (this.currentView.id == "parents") {
            this.users = this.allUsers.filter((u) => u.grade == "Eltern");
            this.addExpertAverageUser();
        } else if (this.currentView.id == "grades-relative" || this.currentView.id == "grades-absolute") {
            const grades: Record<string, { points: number, tipCount: number }> = {};
            for (const user of this.allUsers) {
                if (!grades[user.grade]) {
                    grades[user.grade] = {
                        points: 0,
                        tipCount: user.tipCount,
                    };
                }
                grades[user.grade].points += user.points;
                grades[user.grade].tipCount += user.tipCount;
            }

            this.users = [];
            for (const [grade, d] of Object.entries(grades)) {
                let points = this.currentView.id == "grades-absolute" ? d.points : Math.round(d.points / d.tipCount);
                if (Number.isNaN(points)) {
                    points = 0;
                }
                this.users.push({
                    grade,
                    points,
                } as any);
            }
            if (this.currentView.id == "grades-absolute") {
                this.users.push({
                    grade: "Experten",
                    points: this.experts.points,
                } as any);
            } else {
                this.users.push({
                    grade: "Experten",
                    points: this.experts.points / this.experts.count,
                } as any);
            }
        }
        this.users = this.users.map((u) => {
            u.points = this.round(u.points);
            return u;
        });
        this.users = this.users.sort((a, b) => b.points - a.points);
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

    private addExpertAverageUser() {
        this.users.push({
            isExpert: true,
            realName: "Experten",
            username: "Team",
            grade: "",
            showRealName: true,
            points: this.round(this.experts.points / this.experts.count),
        } as Partial<User> as User);
    }

    public round(v: number): number {
        return Math.round(v * 10) / 10;
    }

    public view(v: {id: string, name: string}): void {
        this.currentView = v;
        this.filterAndDisplayData();
    }
}
