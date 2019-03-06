import {ipcRenderer} from "electron";
import axios from 'axios';
import Moment from 'moment';

const PROJECT_COLOR_MAX = 12;

let path = {};

export default class Api {
    constructor(url, params) {
        this.url = url;
        this.params = params;
    }
    getUrl(path){
        return this.url + path
    }
    compareUpdates(currentIssues, updates){
        updates.forEach( (update) => {
            if(currentIssues[update.id]) {
                let old = currentIssues[update.id];
                if(Moment(update.updateDate) > Moment(old.updateDate)) {
                    console.log("updated");
                    console.log(update.id);
                    update.updatedFlag = true;
                    currentIssues[update.id] = update;
                }
            }
            else {
                update.updatedFlag = true;
                currentIssues[update.id] = update;
            }
        });
        return currentIssues;
    }

}
