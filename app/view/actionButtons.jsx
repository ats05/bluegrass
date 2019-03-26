import React from 'react';

import textile from 'textile-js';
import Moment from 'moment';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCopy, faChevronRight} from '@fortawesome/free-solid-svg-icons'
import Fab from '@material-ui/core/Fab';
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default class ActionButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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

    render() {
        return (
            <div className="actionButtons__area">
                <div className="actionButtons__list">
                    <div className="actionButtons__item">
                        <CopyToClipboard text={this.props.api.getIssueUrl(this.props.issue.id)} onCopy={() => this.setState({copied: true})}>
                            <Fab size="small" aria-label="Copy to clipboard">
                                <FontAwesomeIcon icon={faCopy} className="actionButtons__copy"/>
                            </Fab>
                        </CopyToClipboard>
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
