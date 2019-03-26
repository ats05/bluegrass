import {ipcRenderer} from "electron";
import axios from 'axios';
import Api from './api'

let path = {
    issues: "/api/v2/issues",
    issue: "/api/v2/issues/:issueIdOrKey",
    projects: "/api/v2/projects",
    comments: "/api/v2/issues/:issueIdOrKey/comments"
};

export default class BacklogApi extends Api{
    constructor(params) {
        super(params.url, {
            apiKey: params.key
        });
    }
    parseIssues(json){
        let results = [];
        json.data.forEach( (issue) => {
            results[issue.id] = this._parseIssue(issue);
        });
        return results;
    }
    _parseIssue(issue) {
        console.log(issue);
        return {
            id: issue.id,
            title: issue.issueKey + ' ' + issue.summary,
            createDate: issue.created,
            startDate: issue.startDate,
            updateDate: issue.updated,
            endDate: issue.dueDate,
            authorName: issue.createdUser.name,
            projectName: issue.projectId,   //TODO nameを取れるようにする
            description: issue.description,
            statusName: issue.status.name,
            statusId: issue.status.id,
            priorityId: issue.priority.id,
            assigneeName: issue.assignee.name,
            projectColorId: issue.projectId % self.PROJECT_COLOR_MAX,
            parentId: issue.parentIssueId ? issue.parentIssueId : '',
            comments: [],
            updatedFlag: false,
            dogEarFlag: false
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

    issues(project_id = null, status_id = null, assigned_to_id = "me", sort = "updated") {
        let params = {
            assigneeId: [],
            sort: sort,
            order: 'desc'
        };
        let payload = Object.assign(this.params, params);

        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.issues), {params: payload})
                .then(response => resolve(this.parseIssues(response)))
                .catch(error => reject(error))
            ;
        });
    }
    issue(issueId) {
        let params = {
        };
        let payload = Object.assign(this.params, params);
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
    updateIssues(){
    }

    comments(issueId, count = 20, order = 'asc') {
        let params = {
            count: count,
            order: order
        };
        let payload = Object.assign(this.params, params);
        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.comments).replace(':issueIdOrKey', issueId), {params: payload})
                .then(response => { return new Promise (resolve(this._parseComments(response.data)));})
                .catch(error => reject(error))
            ;
        });
    }
}
