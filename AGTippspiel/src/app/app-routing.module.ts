import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RulesComponent } from "./_components/rules/rules.component";
import { HomeComponent } from "./_components/home/home.component";
import { SigninComponent } from "./_components/signin/signin.component";
import { SignupComponent } from "./_components/signup/signup.component";
import { ScoresComponent } from "./_components/scores/scores.component";
import { AuthenticationGuard } from "./_guards/authentication.guard";
import { UsersComponent } from "./_components/users/users.component";
import { AdminGuard } from "./_guards/admin.guard";
import { MatchComponent } from "./_components/match/match.component";
import { ChampionComponent } from "./_components/champion/champion.component";

const routes: Routes = [
    {
        path: "rules",
        component: RulesComponent,
    },
    {
        path: "home",
        component: HomeComponent,
    },
    {
        path: "login",
        component: SigninComponent,
    },
    {
        path: "signup",
        component: SignupComponent,
    },
    {
        path: "matches",
        component: MatchComponent,
        canActivate: [AuthenticationGuard],
    },
    {
        path: "champion",
        component: ChampionComponent,
        canActivate: [AuthenticationGuard],
    },
    {
        path: "users",
        component: UsersComponent,
        canActivate: [AuthenticationGuard, AdminGuard],
    },
    {
        path: "scores",
        component: ScoresComponent,
    },
    {
        path: "**",
        redirectTo: "/home",
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled" })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
