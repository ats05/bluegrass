import React from 'react';
import RedmineApi from "../script/redmineApi";
import Moment from 'moment';
import classnames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faStopwatch, faUser, faStar as fasStar, faCaretRight} from '@fortawesome/free-solid-svg-icons'
import {faStar as farStar} from '@fortawesome/free-regular-svg-icons';
import TextField from '@material-ui/core/TextField';

import Issues from "./issues";
import Store from 'electron-config';


export default class NewSpaces extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            key: '',
            url: '',
            auth: {}
        };
        this.handleChange = this.handleChange.bind(this);
    }

    setConfig() {

    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }



    render() {
        return (
            <form
                onSubmit={this.setConfig}
                className="newSpace__window"
            >
                <div className="newSpace__content">
                    <TextField
                        label="NAME"
                        className="newSpace__input"
                        value={this.state.name}
                        name="name"
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        required
                        label="URL"
                        className="newSpace__input"
                        value={this.state.url}
                        name="key"
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        required
                        label="API KEY"
                        className="newSpace__input"
                        value={this.state.key}
                        name="key"
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                    />
                </div>
            </form>
        );
    }
}
