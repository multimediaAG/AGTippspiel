import { Component, Input, OnInit } from "@angular/core";
import { Match, MatchStatus } from "../../_models/Match";

@Component({
    selector: "app-match-countdown",
    templateUrl: "./match-countdown.component.html",
    styleUrls: ["./match-countdown.component.scss"],
})
export class MatchCountdownComponent implements OnInit {
    @Input() match: Match;
    public config;

    public ngOnInit(): void {
        const matchDate = new Date(this.match.utcDate);
        if (matchDate < new Date()) {
            return;
        }
        const names = [
            { singular: "Monat", plural: "Monate" },
            { singular: "Tag", plural: "Tage" },
            { singular: "Stunde", plural: "Stunden" },
            { singular: "Minute", plural: "Minuten" },
            { singular: "Sekunde", plural: "Sekunden" },
        ];
        this.config = {
            stopTime: matchDate.getTime(),
            format: "L:d:H:m:s",
            prettyText: (text) => {
                const parts = text.split(":");
                parts[0] -= 1;
                let string = "noch ";
                for (let i = 0; i < names.length; i++) {
                    string += `${parts[i] > 0 ? parts[i] > 1 ? `${parts[i]} ${names[i].plural}, ` : `1 ${names[i].singular}, ` : ""}`;
                }
                return string.slice(0, string.length - 2);
            },
        };
    }
}
