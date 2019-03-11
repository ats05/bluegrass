import {ipcRenderer} from "electron";
import axios from 'axios';
import Moment from 'moment';
import Api from './api'

let path = {
    issues: "issues.json",
    issue: "issues"
};

export default class RedmineApi extends Api{
    constructor(params) {
        super(params.url, {
            key: params.key,
            auth: params.auth
        });
    }
    parseIssues(json){
        let results = [];
        json.data.issues.forEach( (issue) => {
            results[issue.id] = this._parseIsuse(issue);
        });
        return results;
    }
    // チケット一覧取得（parseして返す）
    issues(project_id = null, status_id = null, sort = "updated_on") {
        let params = {
            assigned_to_id: "me"
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
            id: issueId,
            include: "journals"
        };
        let payload = Object.assign(this.params, params);
        let url = this.getUrl(path.issue) + "/" + issueId + ".json";

        return new Promise( (resolve, reject) => {
            axios.get(url, {params: payload})
                .then(response => resolve(this._parseIsuse(response.data.issue)))
                .catch(error => reject(error))
            ;
        });
    }
    updateIssues(){
        let params = {
            assigned_to_id: "me"
        };
        let payload = Object.assign(this.params, params);

        return new Promise( (resolve, reject) => {
            axios.get(this.getUrl(path.issues), {params: payload})
                .then(response => resolve(this.parseIssues(response)))
                .catch(error => reject(error))
            ;
        });
    }
    _parseIsuse(issue) {
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
            comments: this._parseComments(issue.journals),
            updatedFlag: false,
            dogEarFlag: false
        };
    }
    _parseComments(journals) {
        let comments = [];
        if(!journals) return null;
        journals.forEach( (comment) => {
            comments.push({
                createDate: comment.created_on,
                body: comment.note,
                authorName: comment.user.name
            });
        });
        return comments;
    }
}
