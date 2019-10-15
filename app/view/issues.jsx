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
const MYSELF_VALUE = 0;
const WATCHING_VALUE = 1;
const DOGEAR_VALUE = 2;

export default class Issues extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            issues: '',
            issueList: '',
            singleIssue: '',
            issueComments: '',
            update: '',
            filter: MYSELF_VALUE
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
    }
    componentWillMount() {
        setInterval(() => { this.updateIssues();}, 60000);
        this.updateIssues();
    }
    openIssue(e, index){
        e.preventDefault();
        let issue = this.api.getIssue(this.state.issueList[index].key);
        issue.updatedFlag = false;
        this.api.setIssue(issue.id, issue);
        if(!issue.closedFlag) this.setState({singleIssue: issue});
        else this.api.popIssue(issue.id);
        this.updateIssueList(index, issue);

        this.api.issue(issue.id).then((response) => {
            this.setState({singleIssue: response});
            if(response.closedFlag) {
                this.api.popIssue(response.id)
            }
        });
    }

    toggleWatch(e, index) {
        e.preventDefault();
        let issue = this.api.getIssue(this.state.issueList[index].key);
        issue.watchFlag = !issue.watchFlag;
        this.api.setIssue(issue.id, issue);
        this.updateIssueList(index, issue);

        if(issue.watchFlag) this.api.watchIssue(issue.id);
        else this.api.unWatchIssue(issue.id);
        // カセットにクリックイベントが行かないように止める
        e.stopPropagation();
    }
    toggleDogEar(e, index) {
        e.preventDefault();
        let issue = this.api.getIssue(this.state.issueList[index].key);
        issue.dogEarFlag = !issue.dogEarFlag;
        this.api.setIssue(issue.id, issue);

        this.updateIssueList(index, issue);

        // カセットにクリックイベントが行かないように止める
        e.stopPropagation();
    }

    // チケット一覧更新
    updateIssueList(index, issue) {
        let newIssueList = Object.assign([], this.state.issueList);
        newIssueList[index] = this.createCassette(index, issue);
        this.setState({issueList: newIssueList});
    }
    closeIssue(){
        this.setState({singleIssue: ""});
    }

    // 更新確認
    updateIssues() {
        this.api.update().then(() => {
            // この時点でthis.api.getIssues()は最新全チケット一覧を返してくれる
            let issues = this.api.getIssues();
            this.setState({
                issueList: this.reloadList(issues, this.state.filter)
            });
        });
    }

    reloadList(issues, filter) {
        let issueList = [];
        Object.keys(issues).forEach( (issueId) => {
            // TODO 分岐方法が汚い。
            if(filter == MYSELF_VALUE && issues[issueId].assigneeId != this.api.getId()) return;
            if(filter == WATCHING_VALUE && !issues[issueId].watchFlag) return;
            if(filter == DOGEAR_VALUE && !issues[issueId].dogEarFlag) return;
            issueList.push(this.createCassette(issueList.length, issues[issueId]));
        });
        return issueList;
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

    createCassette(index, issue) {
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
            <div className={statusClass} key={issue.id}>
                <ListItem
                    button
                    onClick={e => this.openIssue(e, index)}>
                    {/*</Avatar>*/}
                    <ListItemText
                        primary={primaryText}
                        secondary={secondaryText}/>
                </ListItem>
                <span className="issueItems__dogEarButton"></span>
                <div
                    className={classnames("issueItems__watcher", {"issueItems__watcher--watch": issue.watchFlag})}
                    onClick={e => this.toggleWatch(e, index)}>
                    <FontAwesomeIcon icon={fasStar}/>
                </div>
                <div
                    className="issueItems__dogEarButton"
                    onClick={e => this.toggleDogEar(e, index)}>
                </div>
            </div>
        );
    }

    filter(e) {
        e.preventDefault();
        this.setState({filter: event.target.value});
        let issues = this.api.getIssues();
        this.setState({
            issueList: this.reloadList(issues, event.target.value)
        });
    }

    // spacesからタブUIを移植
    // TODO クラス名は直す
    render() {
        return (
            <div className="spaces">
                <div className="spaces__tabArea">
                    <input type="radio" name="tab" value={MYSELF_VALUE} id="tabMyself" onClick={e => this.filter(e)}/>
                    <label htmlFor="tabMyself" className={classnames("spaces__tab", {"spaces__tab--active": this.state.filter == MYSELF_VALUE})}>
                        <span  className="spaces__tabItem">
                            <FontAwesomeIcon icon={faUser}/>
                        </span>
                    </label>
                    <input type="radio" name="tab" value={WATCHING_VALUE} id="tabWatching" onClick={e => this.filter(e)}/>
                    <label htmlFor="tabWatching" className={classnames("spaces__tab", {"spaces__tab--active": this.state.filter == WATCHING_VALUE})}>
                        <span  className="spaces__tabItem">
                            <FontAwesomeIcon icon={fasStar}/>
                        </span>
                    </label>
                    <input type="radio" name="tab" value={DOGEAR_VALUE} id="tabDogear" onClick={e => this.filter(e)}/>
                    <label htmlFor="tabDogear" className={classnames("spaces__tab", {"spaces__tab--active": this.state.filter == DOGEAR_VALUE})}>
                        <span  className="spaces__tabItem">
                            {/*<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="173.28571428571422 263.1655540720961 84.80106809078768 84.80106809078774" width="16" height="16"><defs><path d="M255.09 264.17L174.29 344.97L174.29 264.17L255.09 264.17Z" id="bhrrU0wbx"></path></defs><g><g><use xlink:href="#bhrrU0wbx" opacity="1" fill-opacity="1"></use></g></g></svg>*/}
                        </span>
                    </label>
                </div>
                <div className="spaces__issueArea">
                    <div>
                        <List>
                            {this.state.issueList}
                        </List>
                        <SingleIssue api={this.api} issue={this.state.singleIssue} closeIssue={() => this.closeIssue()}/>
                    </div>
                </div>
            </div>
        );
    }

}
