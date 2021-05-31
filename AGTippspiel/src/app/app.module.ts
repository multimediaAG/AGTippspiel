import { BrowserModule } from "@angular/platform-browser";
import { NgModule, LOCALE_ID } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ToastrModule } from "ngx-toastr";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { registerLocaleData } from "@angular/common";
import localeDe from "@angular/common/locales/de";
import { CountdownModule } from "ngx-countdown";
import { AngularFileUploaderModule } from "angular-file-uploader";
import { ServiceWorkerModule } from "@angular/service-worker";
import { SafePipe } from "./_pipes/safe.pipe";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SigninComponent } from "./_components/signin/signin.component";
import { SignupComponent } from "./_components/signup/signup.component";
import { NavbarComponent } from "./_components/navbar/navbar.component";
import { RulesComponent } from "./_components/rules/rules.component";
import { HomeComponent } from "./_components/home/home.component";
import { ScoresComponent } from "./_components/scores/scores.component";
import { FooterComponent } from "./_components/footer/footer.component";
import { ErrorInterceptor } from "./_interceptors/error.interceptor";
import { JwtInterceptor } from "./_interceptors/jwt.interceptor";
import { UsersComponent } from "./_components/users/users.component";
import { MatchComponent } from "./_components/match/match.component";
import { MatchCountdownComponent } from "./_components/match-countdown/match-countdown.component";
import { environment } from "../environments/environment";

registerLocaleData(localeDe);

@NgModule({
    declarations: [
        AppComponent,
        SigninComponent,
        SignupComponent,
        NavbarComponent,
        RulesComponent,
        HomeComponent,
        ScoresComponent,
        FooterComponent,
        UsersComponent,
        SafePipe,
        MatchComponent,
        MatchCountdownComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        CountdownModule,
        ToastrModule.forRoot(),
        AngularFileUploaderModule,
        ServiceWorkerModule.register("ngsw-worker.js", {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: "registerWhenStable:30000",
        }),
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: LOCALE_ID, useValue: "de-DE" },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
