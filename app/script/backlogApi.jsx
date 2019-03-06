import {ipcRenderer} from "electron";
import axios from 'axios';
import Api from './api'

let path = {
    issues: "api/v2/issues"
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
            console.log(issue);
            results[issue.id] = {
                id: issue.issueKey,
                title: issue.summary,
                createDate: issue.created,
                startDate: issue.startDate,
                updateDate: issue.updated_on,
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
            };
        });
        return results;
    }

    issues(project_id = null, status_id = null, assigned_to_id = "me", sort = "updated_on") {
        return axios.get(this.getUrl(path.issues), {params: this.params});
    }
}
