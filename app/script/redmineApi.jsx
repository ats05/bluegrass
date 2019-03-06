import {ipcRenderer} from "electron";
import axios from 'axios';
import Moment from 'moment';
import Api from './api'

let path = {
    issues: "issues.json"
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
            results[issue.id] = {
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
                assigneeName: issue.assigned_to.name,
                projectColorId: issue.project.id % self.PROJECT_COLOR_MAX,
                parentId: issue.parent ? issue.parent.id : '',
                updatedFlag: false,
                dogEarFlag: false
            };
        });
        return results;
    }
    // チケット一覧取得
    issues(project_id = null, status_id = null, sort = "updated_on") {
        let params = {
            assigned_to_id: "me"
        };
        let payload = Object.assign(this.params, params);

        return axios.get(this.getUrl(path.issues), {params: payload});
    }
    updateIssues(){
        let params = {
            assigned_to_id: "me"
        };
        let payload = Object.assign(this.params, params);
        return axios.get(this.getUrl(path.issues), {params: payload});
    }
}
