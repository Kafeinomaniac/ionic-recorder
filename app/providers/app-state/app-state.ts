import {Injectable} from "angular2/core";
import {LocalDB, DB_NO_KEY} from "../local-db/local-db";


// make sure APP_STATE_ITEM_NAME will never be entered by a user
const APP_STATE_ITEM_NAME: string =
    "Kwj7t9X2PTsPwLquD9qvZqaApMP8LGRjPFENUHnvrpmUE25rkrYHhzf9KBEradAU";


@Injectable()
export class AppState {
    lastViewedPage: string = "record";
    lastViewedFolderKey: number;

    constructor() {
        console.log("constructor():AppState");
        let localDB: LocalDB = LocalDB.Instance;
        localDB.getDB().subscribe((db: IDBDatabase) => {
            console.log("app state got db: " + db);
        });

        this.lastViewedFolderKey = DB_NO_KEY;
    }

    save() {
        /*
        // very brute force ...
        this.localDB.smartUpdate(
            APP_STATE_ITEM_NAME, {
                dbName: this.localDBName,
                dbVersion: this.localDBVersion,
                dbStoreName: this.localDBStoreName,
                unfiledFolderName: this.unfiledFolderName,
                lastViewedPage: this.lastViewedPage,
                lastViewedFolderKey: this.lastViewedFolderKey
            });
        */
    }
}
