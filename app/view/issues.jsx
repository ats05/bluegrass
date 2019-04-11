import React from 'react';
import RedmineApi from "../script/redmineApi";
import BacklogApi from "../script/backlogApi";
import Moment from 'moment';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faStopwatch, faUser, faStar as fasStar, faCaretRight, faUserEdit} from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import SingleIssue from "./singleIssue";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Store from 'electron-config';


let store;

export default class Issues extends React.Component {
    constructor(props) {
        super(props);
        // ほんとはissuesをapiのインスタンスに渡したい
        this.state = {
            issues: '',
            issueList: '',
            singleIssue: '',
            issueComments: ''
        };
        store = new Store();
        let params = {
            url: props.config.url,
            key: props.config.key,
            auth: props.config.auth,
            service: props.config.service
        };
        let userData = {
            id: props.config.id,
            userID: props.config.userId,
            userName: props.config.userName
        };
        if(params.service === "redmine") this.api = new RedmineApi(params, userData);
        else if(params.service === "backlog") this.api = new BacklogApi(params, userData);
        this.toggleWatch = this.toggleWatch.bind(this);
        setInterval(() => { this.updateIssues();}, 60000);
        this.updateIssues();
    }
    openIssue(e, issueId){
        e.preventDefault();
        let issue = this.api.getIssue(issueId);
        issue.updatedFlag = false;
        this.api.setIssue(issueId, issue);
        this.setState({singleIssue: issue});

        this.api.issue(issueId).then((response) => {
            this.setState({singleIssue: response});
        });
    }
    toggleWatch(e, issueId) {
        e.preventDefault();
        let issue = this.api.getIssue(issueId);
        issue.watchFlag = !issue.watchFlag;
        this.api.setIssue(issueId, issue);

        // カセットにクリックイベントが行かないように止める
        e.stopPropagation();
    }
    toggleDogEar(e, issue) {
        e.preventDefault();
        let issues = this.state.issues;
        issues[issue.id].dogEarFlag = !issues[issue.id].dogEarFlag;
        this.setState({
            issues: issues,
        });
        // カセットにクリックイベントが行かないように止める
        // e.stopPropagation();
    }

    closeIssue(){
        console.log(this);
        this.setState({singleIssue: ""});
    }

    // 更新確認
    updateIssues() {
        this.api.update().then(() => {
            // この時点でthis.api.getIssues()は最新全チケット一覧を返してくれる
            let issues = this.api.getIssues();
            let issueList = [];
            Object.keys(issues).forEach( (issueId) => {
                issueList.push(this.createCassette(issues[issueId]));
            });
            this.setState({
                issueList: issueList
            });
        });

    }
    //
    // // 保存してあるチケットをチェック
    // restoreData(){
    //     let storedData = store.get('issueData' + this.props.spaceId);
    //     let issues = {};
    //     if (storedData != null && Object.keys(storedData).length > 0) {
    //         issues = this.api.compareUpdates(storedData, this.api.getIssues());
    //     } else {
    //         issues = this.api.getIssues();
    //     }
    //     let issueList = [];
    //     Object.keys(issues).forEach( (issueId) => {
    //         issueList.push(this.createCassette(issues[issueId]));
    //     });
    //     this.setState({
    //         issueList: issueList
    //     });
    // }
    // storeData() {
    //     let issues = this.state.issues;
    //     let storeData = {};
    //     Object.keys(issues).forEach( (issueId) => {
    //         storeData[issueId] = {
    //             updateDate: issues[issueId].updateDate,
    //             updatedFlag: issues[issueId].updatedFlag,
    //             dogEarFlag: issues[issueId].dogEarFlag,
    //             closedFlag: issues[issueId].closedFlag,
    //             watchFlag: issues[issueId].watchFlag,
    //             storedItemFlag: true
    //         }
    //     });
    //     store.set('issueData' + this.props.spaceId, storeData);
    //
    // }
    render() {
        return (
            <div>
                <List>
                    {this.state.issueList}
                </List>
                <SingleIssue api={this.api} issue={this.state.singleIssue} closeIssue={() => this.closeIssue()}/>
            </div>
        );
    }
    createCassette(issue) {
        let moment = Moment.now();
        let inProgress = Moment(issue.startDate) <= moment;
        let expired = moment >= Moment(issue.endDate);

        let limitClass = classnames(
            "issueItems__limit",
            {"issueItems__limit--inProgress": inProgress},
            {"issueItems__limit--expired": expired}
        );

        let startDate = Moment(issue.startDate).format("YYYY-MM-DD");
        let endDate = Moment(issue.endDate).format("YYYY-MM-DD");

        let statusClass = classnames(
            "issueItems__content",
            {"issueItems__content--dogEar": issue.dogEarFlag},
            {"issueItems__content--updated": issue.updatedFlag},
            {"issueItems__content--closed": issue.closedFlag},
        );

        let primaryText =
            <span className="issueItems__title">{issue.title}</span>;
        let secondaryText =
            <span className="issueItems__header">
                <span className="issueItems__id">#{issue.id}</span>
                <span className={classnames("issueItems__projectName", "color-project" + issue.projectColorId)}>{issue.projectName}</span>
                <span className={limitClass}>
                    <FontAwesomeIcon icon={faStopwatch} className="issueItems__limitIcon"/>
                    <span>{startDate}</span><FontAwesomeIcon icon={faCaretRight} className="issueItems__limit__caret"/><span>{endDate}</span></span>
                <span className="issueItems__assigneeName">
                    <FontAwesomeIcon icon={faUser} className="issueItems__assigneeIcon"/>
                    <span>{issue.assigneeName}</span>
                </span>
            </span>;
        return (
            <div className={statusClass}>
                <ListItem
                    button
                    onClick={e => this.openIssue(e, issue.id)}>
                    {/*</Avatar>*/}
                    <ListItemText
                        primary={primaryText}
                        secondary={secondaryText}/>
                </ListItem>
                {/*<span className="issueItems__dogEarButton"></span>*/}
                <div
                    className={classnames("issueItems__watcher", {"issueItems__watcher--watch": issue.watchFlag})}
                    onClick={e => this.toggleWatch(e, issue.id)}>
                    <FontAwesomeIcon icon={fasStar}/>
                </div>
                <div
                    className="issueItems__dogEarButton"
                    onClick={e => this.toggleDogEar(e, issue.id)}>
                </div>

            </div>
        );
    }


}
