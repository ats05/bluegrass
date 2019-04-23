import {ipcRenderer} from "electron";
import axios from 'axios';
import Moment from 'moment';

const PROJECT_COLOR_MAX = 12;

let path = {};
let assignedProjects = [];


export default class Api {
    constructor(url, params, userData = null) {
        this.url = url;
        this.params = params;
        this.issuesObject = {};
        if(userData != null) {
            this.id = userData.id;
            this.userId = userData.userID;
            this.userName = userData.userName;
        }
    }
    getUrl(path){
        return this.url + path
    }
    compareUpdates(currentIssues, updates){
        let updatedIds = [];

        Object.keys(updates).forEach( (updateId) => {
            let update = updates[updateId];
            if(currentIssues[update.id]) {
                let old = currentIssues[update.id];
                update.updatedFlag = old.updatedFlag;
                update.dogEarFlag = old.dogEarFlag;
                update.closedFlag = old.closedFlag;
                update.watchFlag = old.watchFlag;
                if(Moment(update.updateDate) > Moment(old.updateDate)) {
                    updatedIds.push(update.id.toString());
                    currentIssues[update.id] = update;
                }
                else if(old.storedItemFlag) {
                    currentIssues[update.id] = update;
                    updatedIds.push(update.id.toString());
                }
            }
            else {
                update.updatedFlag = true;
                updatedIds.push(update.id.toString());
                currentIssues[update.id] = update;
            }
        });

        this.issuesObject = Object.assign([], currentIssues);

        // return currentIssues;
    }

    // チケット一覧を返す
    getIssues() {
        return this.issuesObject;
    }
    // チケット単品を返す
    getIssue(issueId) {
        return this.issuesObject[issueId];
    }
    // 指定IDのチケットを更新する（リモートも更新）
    setIssue(issue, issueId = null) {
        if (issueId == null) issueId = issue.id;
        return this.issuesObject[issueId];
    }
    popIssue(issueId) {
        delete this.issuesObject[issueId];
    }
    getId(){
        return this.id;
    }

}
