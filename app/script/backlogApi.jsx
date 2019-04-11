import {ipcRenderer} from "electron";
import axios from 'axios';
import Api from './api'

const path = {
    issues: "/api/v2/issues",
    issue: "/api/v2/issues/:issueIdOrKey",
    projects: "/api/v2/projects",
    comments: "/api/v2/issues/:issueIdOrKey/comments",
    myself: '/api/v2/users/myself'
};
let assignedProjects = [];

export default class BacklogApi extends Api{
    static path() {
        return path
    }
    constructor(params, userData) {
        super(params.url, {
            apiKey: params.key,
        }, userData);
        if (assignedProjects.length == 0) {
            this.projects().then((response) => {
                assignedProjects = response;
                console.log(assignedProjects);
            });
        }
    }
    checkApi() {
        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.myself), {params: this.params, timeout: 5000})
                .then(response => {
                    console.log(response);
                    resolve(this._parseUserData(response.data));
                })
                .catch(error => reject(error))
            ;
        });
    }
    _parseUserData(json){
        return {
            userName: json.name,
            userId: json.userId,
            id: json.id,
            // mail: json.mailAddress
        }
    }
    parseIssues(json, params = {}){
        let results = [];
        json.data.forEach( (issue) => {
            results[issue.id] = this._parseIssue(issue, params);
        });
        return results;
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
            issueKey: issue.issueKey,
            title: issue.issueKey + ' ' + issue.summary,
            createDate: issue.created,
            startDate: issue.startDate ? issue.startDate : '',
            updateDate: issue.updated,
            endDate: issue.dueDate ? issue.dueDate : '',
            authorName: issue.createdUser.name,
            projectName: this._getProjectName(issue.projectId),
            description: issue.description,
            statusName: issue.status.name,
            statusId: issue.status.id,
            priorityId: issue.priority.id,
            assigneeName: issue.assignee ? issue.assignee.name : '',
            projectColorId: issue.projectId % self.PROJECT_COLOR_MAX,
            parentId: issue.parentIssueId ? issue.parentIssueId : '',
            comments: [],
            updatedFlag: false,
            dogEarFlag: false,
            watchFlag: params.watchFlag
        }
    }
    _parseComments(comments) {
        console.log(comments);
        let results = [];
        if (!comments) return [];
        comments.forEach( (comment) => {
            // console.log(comment);
            results.push({
                createDate: comment.created,
                body: comment.content ? comment.content : '',
                authorName: comment.createdUser.name,
                updateDate: comment.updated
            });
        });
        return results;
    }
    _getProjectName(projectId) {
        if (!assignedProjects) {
            return '';
        }
        let project = assignedProjects.find( (element) => {return element.id == projectId});
        return project ? project.name : '';
    }

    _getIssues(project_id = null, status_id = null, assigned_to_id = "me", sort = "updated") {
        console.log('issues user id : ' + this.id);
        let params = {
            assigneeId: this.id ? [this.id] : [],  //TODO settingかなんかで自分が担当のチケットか自分が参加してるプロジェクトかってしたい
            sort: sort,
            order: 'desc'
        };
        let payload = Object.assign(params, this.params);

        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.issues), {params: payload})
                .then(response => resolve(this.parseIssues(response)))
                .catch(error => reject(error))
            ;
        });
    }
    issue(issueId) {
        console.log('issue');
        let params = {
        };
        let payload = Object.assign(params, this.params);
        let issue;

        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.issue).replace(':issueIdOrKey', issueId), {params: payload})
                .then(response => {
                    return new Promise(resolve => {
                        issue = this._parseIssue(response.data);
                        resolve(issue);
                    });
                })
                .then(response => {
                    return new Promise(resolve => { resolve(this.comments(issueId)); })
                })
                .then(response => {
                    issue.comments = response;
                    resolve(issue);
                })
                .catch(error => reject(error))
            ;
        });
    }
    /*
    各種Issues関数でPromiseを返す→解決されたら全部まとめて返す
 */
    update(){
        return Promise.all([
            this._getIssues().then( (response) => {
                console.log("get assigned issues");
                console.log(response);
                this.compareUpdates(this.issuesObject, response);
            }, (e) => {console.log(e)}),
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
    watchIssue(issueId) {

    }
    unWatchIssue(issueId) {

    }
    comments(issueId, count = 10, order = 'asc') {
        let params = {
            count: count,
            order: order
        };
        let payload = Object.assign(params, this.params);
        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.comments).replace(':issueIdOrKey', issueId), {params: payload})
                .then(response => { return new Promise (resolve(this._parseComments(response.data)));})
                .catch(error => reject(error))
            ;
        });
    }

    getIssueUrl(issue) {
        return this.url +  "/view/" + issue.issueKey;
    }

    projects(archived = false, all = false) {
        let params = {
            archived: archived,
            all: all
        };
        let payload = Object.assign(params, this.params);
        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.projects), {params: payload})
                .then(response => { return new Promise (resolve(response.data));})
                .catch(error => reject(error))
            ;
        });
    }
}
