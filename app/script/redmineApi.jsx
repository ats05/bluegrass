import {ipcRenderer} from "electron";
import axios from 'axios';
import Moment from 'moment';
import Api from './api'

export const path = {
    issues: "/issues.json",
    issue: "/issues",
    myself: "/users/current.json",
    watcher: ""
};

const ISSUE_PARAMS = {

};

// watcher_id=　でウォッチしてるチケットを取れる

export default class RedmineApi extends Api{
    static path() {
        return path
    }
    constructor(params, userData) {
        super(params.url, {
            key: params.key,
            auth: params.auth
        }, userData);

    }
    checkApi() {
        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.myself), {params: this.params, timeout: 5000})
                .then(response => {
                    console.log(response);
                    resolve(this._parseUserData(response.data.user));
                })
                .catch(error => reject(error))
            ;
        });
    }
    _parseUserData(json){
        return {
            userName: json.firstname + ' ' + json.lastname,
            userId: json.login,
            id: json.id,
            // mail: json.mail
        }
    }

    parseIssues(json, params = {}){
        let results = {};
        json.data.issues.forEach( (issue) => {
            results[issue.id] = this._parseIssue(issue, params);
        });
        return results;
    }
    // 担当しているチケットを取得
    _getIssues() {
        let params = {
            assigned_to_id: "me"
        };
        let payload = Object.assign(params, this.params);

        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.issues), {params: payload})
                .then(response => resolve(this.parseIssues(response)))
                .catch(error => reject(error))
            ;
        });
    }
    // 自身がウォッチしているチケットを取得
    _watchIssues(){
        let params = {
            watcher_id: "me"
        };
        let payload = Object.assign(params, this.params);

        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.issues), {params: payload})
                .then(response => resolve(this.parseIssues(response, {watchFlag: true})))
                .catch(error => reject(error))
            ;
        });
    }
    _currentIssues() {
        let params = {
            issue_id: Object.keys(this.issuesObject).join(",")
        };
        let payload = Object.assign(params, this.params);

        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.issues), {params: payload})
                // Redmineの場合、完了チケットは返ってこない
                .then(response => resolve(this.parseIssues(response)))
                .catch(error => reject(error))
            ;
        });
    }
    issue(issueId) {
        let params = {
            id: issueId,
            include: "journals"
        };
        let payload = Object.assign(this.params, params);
        let url = this.getUrl(path.issue) + "/" + issueId + ".json";

        return new Promise( (resolve, reject) => {
            axios.get(url, {params: payload})
                .then(response => resolve(this._parseIssue(response.data.issue)))
                .catch(error => reject(error))
            ;
        });
    }

    /*
    各種Issues関数でPromiseを返す→解決されたら全部まとめて返す
     */
    update() {

        let promiseList = [
            this._getIssues().then( (response) => {
                console.log("get assigned issues");
                console.log(response);
                this.compareUpdates(this.issuesObject, response);
            }, (e) => {console.log(e)}),
            this._watchIssues().then( (response) => {
                console.log("get watching issues");
                console.log(response);
                this.compareUpdates(this.issuesObject, response);
            }, (e) => {console.log(e)})
        ];

        // 既存のチケット情報が手元にある場合、チェック
        // if(Object.keys(this.issuesObject).length > 1) {
            // promiseList.push(this._watchIssues().then( (response) => {
            //     Redmineの場合、完了チケットは返ってこないので、idで比較して完了フラグを立てる
                // let currentIds = Object.keys(this.issuesObject);
                // let responseIds = Object.keys(response);
                //
                // Object.keys(currentIds).forEach( (currentId) => {
                //     if( !responseIds.includes(currentId)) {
                //         this.issuesObject[currentId].closedFlag = true;
                //     }
                // });
            // }, (e) => {console.log(e)}))
        // }

        return Promise.all(promiseList);
    }
    watchIssue(issueId) {
        let params = {
            user_id: this.id
        };
        let payload = Object.assign(this.params, params);

        // TODO Path整理
        let url = this.getUrl(path.issue) + "/" + issueId + "/watchers.json";

        return new Promise( (resolve, reject) => {
            axios.post(url, payload)
                .then(response => resolve(console.log(response)))
                .catch(error => reject(error))
            ;
        });
    }
    unWatchIssue(issueId) {
        let params = {
            user_id: this.id
        };
        let payload = Object.assign(this.params, params);

        // TODO Path整理
        let url = this.getUrl(path.issue) + "/" + issueId + "/watchers/" + this.id + ".json";

        return new Promise( (resolve, reject) => {
            axios.delete(url, {data: payload})
                .then(response => resolve(console.log(response)))
                .catch(error => reject(error))
            ;
        });
    }
    _parseIssue(issue, params = {}) {
        params = Object.assign({
            updatedFlag: false,
            dogEarFlag: false,
            closedFlag: issue.closed && Moment(issue.closed) > new Moment(),
            watchFlag : false
        }, params);

        return {
            id: issue.id,
            title: issue.subject,
            createDate: issue.created_on,
            closeDate: issue.closed ? issue.closed : null,
            startDate: issue.start_date,
            updateDate: issue.updated_on,
            endDate: issue.due_date,
            authorName: issue.author.name,
            projectName: issue.project.name,
            description: issue.description,
            statusName: issue.status.name,
            statusId: issue.status.id,
            priorityId: issue.priority.id,
            assigneeId: issue.assigned_to.id,
            assigneeName: issue.assigned_to.name,
            projectColorId: issue.project.id % self.PROJECT_COLOR_MAX,
            parentId: issue.parent ? issue.parent.id : '',
            parentIds: [],  // 階層化された親チケットのIDを並べる
            comments: this._parseComments(issue.journals),
            updatedFlag: false,
            dogEarFlag: false,
            closedFlag: params.closedFlag,
            watchFlag: params.watchFlag
        };
    }
    _parseComments(journals) {
        let comments = [];
        if(!journals) return null;
        console.log(journals);
        journals.forEach( (comment) => {
            comments.push({
                createDate: comment.created_on,
                body: comment.notes,
                authorName: comment.user.name,
                detail: comment.details
            });
        });
        return comments;
    }
    _parseCommentDetail(detail) {

    }

    getIssueUrl(issue) {
        return this.url + path.issue + "/" + issue.id;
    }
}
