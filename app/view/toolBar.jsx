import React from 'react';
import textile from 'textile-js';
import Moment from 'moment';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faComments, faStopwatch} from '@fortawesome/free-solid-svg-icons'
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if(nextProps.comments === "") return false;
        return true;
    }
    componentWillReceiveProps(nextProps, nextContext) {
    }
    openComments() {
    }
    render() {
    }
}
