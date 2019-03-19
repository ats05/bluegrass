import React from 'react';
import textile from 'textile-js';
import Moment from 'moment';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faComments, faStopwatch} from '@fortawesome/free-solid-svg-icons'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FlatButton from 'material-ui/FlatButton';
import {fullWhite} from 'material-ui/styles/colors';
import Icon from '@material-ui/core/Icon';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

export default class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: null,
            show: false,
            open: false
        };
        this.openComments = this.openComments.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if(nextProps.comments === "") return false;
        return true;
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let comments = [];
        console.log(nextProps);
        if(nextProps.comments === null) {
            this.setState({show: false, open: false});
            return false;
        }
        // this.setState({show: true});
        nextProps.comments.forEach( (comment) => {
            comments.push(
                <Card className="comments__card">
                    <CardContent>
                        <div className="comments__header">
                            <span className="comment__authorName">{comment.authorName}</span>
                            <span className="comment__date">{Moment(comment.createDate).format("YYYY-MM-DD HH:mm:ss")}</span>
                        </div>
                        <div>
                            <div className="comment__body" dangerouslySetInnerHTML={{__html: textile(comment.body)}}></div>
                        </div>
                    </CardContent>
                </Card>
            );
        });
        this.setState({comments: comments, show: true});
    }
    openComments() {
        this.setState({open: !this.state.open});
    }
    render() {

        let buttonClassNames = classnames("comments__button", {"comments__button--open": this.state.open});
        let areaClassNames = classnames("comments__area", {"comments__area--open": this.state.open});

        if (!this.state.show) return "";

        return (
            <div className="comments__wrap">
                <div className={areaClassNames}>
                    {this.state.comments}
                </div>
                <div className={buttonClassNames} onClick={this.openComments}>
                    <FontAwesomeIcon icon={faComments} className="comments__buttonIcon"/>
                </div>
            </div>
        )
    }
}
