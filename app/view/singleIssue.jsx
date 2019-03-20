import React from 'react';
import textile from 'textile-js';
import RedmineApi from "../script/redmineApi";
import Moment from 'moment';
import classnames from 'classnames';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faTasks,
    faStopwatch,
    faCaretRight,
    faUser,
    faUserEdit,
    faEdit,
    faSyncAlt
} from '@fortawesome/free-solid-svg-icons'
import FlatButton from 'material-ui/FlatButton';
import {fullWhite} from 'material-ui/styles/colors';
import Icon from '@material-ui/core/Icon';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Comments from "./comments";

export default class SingleIssue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.props.api === null) return false;
        if (this.props.issue === null) return false;
        return true;
    }

    componentWillReceiveProps(nextProps, nextContext) {

    }

    render() {
        let show = this.props.issue !== '';
        let issue = this.props.issue;
        if (!issue) return false;
        let classes = classnames("singleIssue__area", {"singleIssue__area--open": show});

        let moment = Moment.now();
        let inProgress = Moment(issue.startDate) <= moment;
        let expired = moment >= Moment(issue.endDate);

        let limitClass = classnames(
            "singleIssue__statusList__body",
            "singleIssue__statusList__limit",
            {"singleIssue__statusList__limit--inProgress": inProgress},
            {"singleIssue__statusList__limit--expired": expired}
        );
        let startDate = Moment(issue.startDate).format("YYYY-MM-DD");
        let endDate = Moment(issue.endDate).format("YYYY-MM-DD");
        let createDate = Moment(issue.createDate).format("YYYY-MM-DD");
        let updateDate = Moment(issue.updateDate).format("YYYY-MM-DD HH:mm:ss");

        return (
            <div>
                <Comments comments={issue.comments}/>
                <div className={classes}>
                    <div className="singleIssue__parentList">
                        {this.buildParentList(issue)}
                    </div>
                    <div className="singleIssue__title">{issue.title}</div>
                    {/*TODO ReadMoreボタン*/}
                    <div className="singleIssue__description singleIssue__description--close"
                         dangerouslySetInnerHTML={{__html: textile(issue.description)}}></div>
                    <div className="singleIssue__statusList">
                        <div className="singleIssue__statusList__row">
                            <div className="singleIssue__statusList__title"><FontAwesomeIcon icon={faTasks}
                                                                                             className="singleIssue__statusList__icon"/>ステータス
                            </div>
                            <div className="singleIssue__statusList__body">{issue.statusName}</div>
                        </div>
                        <div className="singleIssue__statusList__row">
                            <div className="singleIssue__statusList__title"><FontAwesomeIcon icon={faStopwatch}
                                                                                             className="singleIssue__statusList__icon"/>期限
                            </div>
                            <div className={limitClass}>{startDate}<FontAwesomeIcon icon={faCaretRight}
                                                                                    className="singleIssue__statusList__limitIcon"/>{endDate}
                            </div>
                        </div>
                        <div className="singleIssue__statusList__row">
                            <div className="singleIssue__statusList__title"><FontAwesomeIcon icon={faUser}
                                                                                             className="singleIssue__statusList__icon"/>担当者
                            </div>
                            <div className="singleIssue__statusList__body">{issue.assigneeName}</div>
                        </div>
                    </div>
                    <div className="singleIssue__statusList">
                        <div className="singleIssue__statusList__row">
                            <div className="singleIssue__statusList__title"><FontAwesomeIcon icon={faEdit}
                                                                                             className="singleIssue__statusList__icon"/>作成日
                            </div>
                            <div className="singleIssue__statusList__body">{createDate}</div>
                        </div>
                        <div className="singleIssue__statusList__row">
                            <div className="singleIssue__statusList__title"><FontAwesomeIcon icon={faSyncAlt}
                                                                                             className="singleIssue__statusList__icon"/>更新日
                            </div>
                            <div className="singleIssue__statusList__body">{updateDate}</div>
                        </div>
                        <div className="singleIssue__statusList__row">
                            <div className="singleIssue__statusList__title"><FontAwesomeIcon icon={faUserEdit}
                                                                                             className="singleIssue__statusList__icon"/>作成者
                            </div>
                            <div className="singleIssue__statusList__body">{issue.authorName}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    buildParentList(issue) {
        // 親チケットを遡る
        if (!issue.parentId) return;

        let parents = {};

        return <div>
            <a className="singleIssue__parentList__parentItem">#{issue.parentId}</a>
            <a className="singleIssue__parentList__parentItem">#{issue.parentId}</a>
            <a className="singleIssue__parentList__parentItem">#{issue.parentId}</a>
            <a className="singleIssue__parentList__currentItem">#{issue.id}</a>
        </div>
    }

}
