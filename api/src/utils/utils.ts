import * as fs from "fs";
import * as path from "path";

export function log(action: string, data: any) {
   fs.appendFileSync(path.join("/data/agtippspiel.log"), JSON.stringify({
      time: Date.now(),
      action,
      data,
   }) + "\n");
}

export function copy(obj: any) {
    if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
       return obj;

    const temp = obj instanceof Date ? new (obj as any).constructor() : obj.constructor();

    for (const key in obj) {
       if (Object.prototype.hasOwnProperty.call(obj, key)) {
           obj.isActiveClone = null;
           temp[key] = copy(obj[key]);
           delete obj.isActiveClone;
       }
   }
   return temp;
}