import React from 'react';
import RedmineApi from "../script/redmineApi";
import BacklogApi from "../script/backlogApi";
import Moment from 'moment';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faStopwatch, faUser, faStar as fasStar, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import SingleIssue from "./singleIssue";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
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
            singleIssue: ''
        };
        store = new Store();
        let params = props.params;
        this.api = new RedmineApi(params);
        this.getIssues();
        setInterval(() => { this.updateIssues();}, 60000);
    }
    openIssue(e, issue){
        e.preventDefault();
        let issues = this.state.issues;
        issues[issue.id].updatedFlag = false;
        this.setState({
            issues: issues,
        });

        this.api.issue(issue.id).then( (response) => {
            this.setState({singleIssue: response});
            console.log("update");
        });
        this.setState({singleIssue: issue});
    }
    closeIssue(){
        console.log(this);
        this.setState({singleIssue: ""});
    }
    // 更新確認
    updateIssues() {
        this.api.updateIssues().then( (response) => {
            let updates = this.api.compareUpdates(this.state.issues, response);

            let issueList = [];
            Object.keys(updates).forEach( (issueId) => {
                issueList.push(this.createCassette(updates[issueId]));
            });
            this.setState({
                issues: updates,
                issueList: issueList
            });
            this.storeData();
        }, (e) => {console.log(e)});
    }
    // 0からのデータ取得
    getIssues(){
        this.api.issues().then( (response) => {
            let issues = response;
            this.setState({
                issues: issues,
            });
            this.restoreData()
        }, (e) => {console.log(e)});
    }
    // 保存してあるチケットをチェック
    restoreData(){
        let storedData = store.get('issueData' + this.props.spaceId);
        let issues = {};
        if (storedData != null && Object.keys(storedData).length > 0) {
            issues = this.api.compareUpdates(storedData, this.state.issues);
        } else {
            issues = this.state.issues;
        }
        let issueList = [];
        Object.keys(issues).forEach( (issueId) => {
            issueList.push(this.createCassette(issues[issueId]));
        });
        this.setState({
            issues: issues,
            issueList: issueList
        });
    }
    storeData() {
        let issues = this.state.issues;
        let storeData = {};
        Object.keys(issues).forEach( (issueId) => {
            storeData[issueId] = {
                updateDate: issues[issueId].updateDate,
                updatedFlag: issues[issueId].updatedFlag,
                dogEarFlag: issues[issueId].dogEarFlag,
                closedFlag: issues[issueId].closedFlag,
                storedItemFlag: true
            }
        });
        store.set('issueData' + this.props.spaceId, storeData);

    }
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
                    onClick={e => this.openIssue(e, issue)}
                >
                    {/*<Avatar>*/}
                    <Icon>star</Icon>
                    {/*</Avatar>*/}
                    <ListItemText
                        primary={primaryText}
                        secondary={secondaryText}/>
                </ListItem>
            </div>
        );
    }


}
