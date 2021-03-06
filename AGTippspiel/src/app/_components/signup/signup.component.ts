import { Component, OnInit } from "@angular/core";
import {
    FormBuilder, FormGroup, FormControl, Validators, AbstractControl,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { from } from "rxjs";
import { RemoteService } from "../../_services/remote.service";
import { grades } from "../../_data/grades";

@Component({
    selector: "app-signup",
    templateUrl: "./signup.component.html",
    styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit {
    public signupForm: FormGroup;
    public submitted = false;
    public loading = false;
    public grades: string[] = grades;

    public readonly maxUsernameLength: number = 20;
    public readonly minUsernameLength: number = 2;
    public readonly minPasswordLength: number = 6;
    public readonly minNameLength: number = 6;

    constructor(private formBuilder: FormBuilder, private httpClient: HttpClient,
        private router: Router, private remoteService: RemoteService) { }

    ngOnInit() {
        this.signupForm = this.formBuilder.group({
            username: new FormControl("", [Validators.minLength(this.minUsernameLength), Validators.maxLength(this.maxUsernameLength), Validators.required], this.usernameAvailable.bind(this)),
            grade: new FormControl("", [Validators.required]),
            name: new FormControl("", [Validators.minLength(this.minNameLength), Validators.pattern(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u), Validators.required]),
            password: new FormControl("", [Validators.minLength(this.minPasswordLength), Validators.required]),
            passwordVerify: new FormControl(""),
            showRealName: new FormControl(false),
        });
    }

    public get f() {
        return this.signupForm.controls;
    }

    public signup() {
        this.submitted = true;
        if (!this.signupForm.invalid && this.f.password.value == this.f.passwordVerify.value) {
            this.loading = true;
            this.httpClient.post("/api/users", {
                username: this.f.username.value,
                realName: this.f.name.value,
                password: this.f.password.value,
                passwordVerify: this.f.passwordVerify.value,
                grade: this.f.grade.value,
                showRealName: this.f.showRealName.value,
            }).subscribe((data: any) => {
                if (data && data.status) {
                    this.loading = false;
                    this.router.navigate(["/login"], { queryParams: { signupSuccessfull: true } });
                }
            });
        }
    }

    private usernameAvailable(control: AbstractControl) {
        return from(new Promise((resolve, reject) => {
            this.remoteService.get(`users/usernameAvailable/${control.value}`).subscribe((data) => {
                if (data.usernameAvailable) {
                    return resolve(null);
                }
                return resolve({
                    usernameTaken: true,
                });
            });
        }));
    }
}
