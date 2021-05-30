import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RemoteService } from "./remote.service";
import { User } from "../_models/User";

@Injectable({
    providedIn: "root",
})
export class AuthenticationService {
    public isLoggedIn = false;
    public currentUser: User;

    constructor(private remoteService: RemoteService) {
        const token = sessionStorage.getItem("jwt_token");
        const user = sessionStorage.getItem("currentUser");
        if (token && user) {
            this.isLoggedIn = true;
            this.currentUser = JSON.parse(user);
        }
    }

    public login(username: string, password: string): Observable<any> {
        return this.remoteService.post("auth/login",
            {
                password,
                username,
            });
    }
    public get loggedIn() {
        return this.isLoggedIn;
    }

    public logout() {
        sessionStorage.clear();
        this.isLoggedIn = false;
    }
}
