import { Component } from "@angular/core";
import { CHAMPION_DEADLINE } from "../../_data/champion";

@Component({
    selector: "app-rules",
    templateUrl: "./rules.component.html",
    styleUrls: ["./rules.component.scss"],
})
export class RulesComponent {
    championDeadline = CHAMPION_DEADLINE;
}
