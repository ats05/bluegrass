import {ipcRenderer} from "electron";
import axios from 'axios';
import Moment from 'moment';
import Api from './api'

export const path = {
    issues: "/issues.json",
    issue: "/issues",
    myself: "/users/current.json"
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
        return Promise.all([
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
        ]);
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
    _parseIssue(issue, params = {}) {
        params = Object.assign({
            updatedFlag: false,
            dogEarFlag: false,
            closedFlag: false,
            watchFlag : false
        }, params);
        return {
            id: issue.id,
            title: issue.subject,
            createDate: issue.created_on,
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
            closedFlag: false,
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
