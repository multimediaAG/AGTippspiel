import * as fs from "fs";
import * as path from "path";

export function log(action: string, data: any) {
   fs.appendFileSync(path.join("/data/agtippspiel.log"), JSON.stringify({
      time: Date.now(),
      action,
      data,
   }) + "\n");
}