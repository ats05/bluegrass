import {ipcRenderer} from "electron";
import axios from 'axios';
import Moment from 'moment';

const PROJECT_COLOR_MAX = 12;

let path = {};
let userId = '';
let assignedProjects = [];
let issues = {};

export default class Api {
    constructor(url, params) {
        this.url = url;
        this.params = params;
    }
    getUrl(path){
        return this.url + path
    }
    compareUpdates(currentIssues, updates){
        let updatedIds = [];

        console.log(currentIssues);

        Object.keys(updates).forEach( (updateId) => {
            let update = updates[updateId];
            if(currentIssues[update.id]) {
                let old = currentIssues[update.id];
                update.updatedFlag = old.updatedFlag;
                update.dogEarFlag = old.dogEarFlag;
                update.closedFlag = old.closedFlag;
                if(Moment(update.updateDate) > Moment(old.updateDate)) {
                    update.updatedFlag = true;
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

        // updatesの中になかったものはクローズフラグを立てる
        // 一次対応；保存済みチケットの中で完了してたものは一覧から削除
        // TODO 完了なのか、担当変更なのか確認できるようにする
        Object.keys(currentIssues).forEach((issueId) => {
            if(!updatedIds.includes(issueId)) {
                console.log(currentIssues[issueId]);
                if(currentIssues[issueId].storedItemFlag) delete currentIssues[issueId];
                else currentIssues[issueId].closedFlag = true;
            }
        });

        return currentIssues;
    }

}
