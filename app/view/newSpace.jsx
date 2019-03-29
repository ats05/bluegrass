import React from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import classnames from 'classnames';


export default class NewSpaces extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            key: '',
            url: '',
            type: '',
            useAuth: false,
            authName: '',
            authPass: ''
        };
        this.handleChange = this.handleChange.bind(this);
    }

    setConfig() {

    }

    handleChange(event) {
        console.log(event.target);
        if(event.target.type === "checkbox") this.setState({[event.target.name]: event.target.checked});
        else this.setState({[event.target.name]: event.target.value});
    }


    render() {
        console.log(this.state);
        return (
            <form
                onSubmit={this.setConfig}
                className="newSpace__window">
                <div className="newSpace__content">
                    <TextField
                        label="SPACE NAME"
                        className="newSpace__input"
                        value={this.state.name}
                        name="name"
                        onChange={this.handleChange}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        id="standard-select-currency"
                        select
                        required
                        label="SERVICE TYPE"
                        className="newSpace__input"
                        value={this.state.type}
                        onChange={this.handleChange}
                        margin="normal"
                        name="type"
                    >
                        <MenuItem value="redmine">Redmine</MenuItem>
                        <MenuItem value="backlog">Backlog</MenuItem>
                        <MenuItem value="standalone" disabled>Standalone</MenuItem>
                    </TextField>
                    <TextField
                        required
                        label="URL"
                        className="newSpace__input"
                        value={this.state.url}
                        name="url"
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
                    <div className="newSpace__box">
                        USE BASIC AUTH
                        <Switch
                            checked={this.state.useAuth}
                            onChange={this.handleChange}
                            name="useAuth"
                            color="primary"
                        />
                    </div>
                    <div className={classnames("newSpace__auth", {"newSpace__auth--show": this.state.useAuth})}>
                        <TextField
                            label="NAME"
                            className="newSpace__input"
                            value={this.state.authName}
                            name="authName"
                            onChange={this.handleChange}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="PASS"
                            className="newSpace__input"
                            value={this.state.authPass}
                            name="authPass"
                            type="password"
                            onChange={this.handleChange}
                            margin="normal"
                            fullWidth
                        />
                    </div>

                </div>
            </form>
        );
    }
}
