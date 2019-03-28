import React from 'react';

import textile from 'textile-js';
import Moment from 'moment';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCopy, faChevronRight} from '@fortawesome/free-solid-svg-icons'
import Fab from '@material-ui/core/Fab';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Tooltip from '@material-ui/core/Tooltip';

const copyLebel = "Copy URL";
const copiedLebel = "Copied!";

export default class ActionButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            copyTooltip: copyLebel
        };
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.props.api === null) return false;
        if (this.props.issue === null) return false;
        return true;
    }
    componentWillReceiveProps(nextProps, nextContext) {
    }

    closeIssue(e) {
        e.preventDefault();
        this.props.closeIssue(e);
    }

    // うまくいかね
    copied() {
        this.state = {
            copyTooltip: copiedLebel
        };
        // setTimeout(() => { this.setState({copyTooltip: copyLebel}) }, 2000);
    }

    render() {
        return (
            <div className="actionButtons__area">
                <div className="actionButtons__list">
                    <div className="actionButtons__item">
                        <Tooltip disableFocusListener disableTouchListener placement="left" title={this.state.copyTooltip} >
                            <CopyToClipboard text={this.props.api.getIssueUrl(this.props.issue)} onClick={this.copied()}>
                                <Fab size="small" aria-label="Copy">
                                    <FontAwesomeIcon icon={faCopy} className="actionButtons__copy"/>
                                </Fab>
                            </CopyToClipboard>
                        </Tooltip>
                    </div>
                    <div className="actionButtons__item">
                        <Fab size="small" aria-label="close" onClick={e => this.closeIssue(e)}>
                            <FontAwesomeIcon icon={faChevronRight} className="actionButtons__close"/>
                        </Fab>
                    </div>
                </div>
            </div>
        )
    }
}
