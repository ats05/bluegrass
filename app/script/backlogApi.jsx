import {ipcRenderer} from "electron";
import axios from 'axios';
import Api from './api'

let path = {
    issues: "/api/v2/issues",
    projects: "/api/v2/projects"
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
                id: issue.id,
                title: issue.summary,
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
            };
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

    updateIssues(){
    }

    getIssueUrl(issueId) {
        return "";
    }
}
