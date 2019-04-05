import React from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import classnames from 'classnames';
import RedmineApi from "../script/redmineApi";
import BacklogApi from "../script/backlogApi";
import {faCheck} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import IconButton from '@material-ui/core/IconButton';
import Store from 'electron-config';


const STATUS_NONE = 0;
const STATUS_LOADING = 10;
const STATUS_SUCCESS = 20;
const STATUS_ERROR = 30;
const TYPE_REDMINE = "redmine";
const TYPE_BACKLOG = "backlog";
let store;

export default class NewSpaces extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spaceName: "",
            key: '',
            url: '',
            type: '',
            useAuth: false,
            authName: '',
            authPass: '',
            status: STATUS_NONE,
            config: null
        };
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        if(event.target.type === "checkbox") this.setState({[event.target.name]: event.target.checked});
        else this.setState({[event.target.name]: event.target.value});
        if(this.state.status === STATUS_ERROR || this.state.status === STATUS_SUCCESS) this.setState({status: STATUS_NONE});
    }
    checkApi(e){
        e.preventDefault();
        this.setState({status: STATUS_LOADING});
        let params = {
            url: this.state.url,
            key: this.state.key,
            auth: this.state.useAuth ? {username: this.state.authName, password: this.state.authPass} : null
        };

        // TODO ここらへんもっと綺麗にできる
        let api = null;
        switch (this.state.type) {
            case TYPE_REDMINE:
                api = new RedmineApi(params);
                break;
            case TYPE_BACKLOG:
                api = new BacklogApi(params);
                break;
            default:
                this.setState({status: STATUS_NONE});
                return;
        }

        api.checkApi()
            .then(response => {
                // データ保存したりする
                console.log(response);
                this.setState({config: response});
                this.setState({status: STATUS_SUCCESS});
            })
            .catch(error => {
                console.log(error);
                this.setState({status: STATUS_ERROR});
            })
        ;
    }
    setConfig(e) {
        e.preventDefault();
        let config = {
            userName: this.state.config.userName,
            userId: this.state.config.userId,
            id: this.state.config.id,
            spaceName: this.state.spaceName,
            service: this.state.type,
            url: this.state.url,
            key: this.state.key,
            auth: this.state.useAuth ? {username: this.state.authName, password: this.state.authPass} : ''
        };

        store = new Store();
        let storeData = null;
        if (this.props.spaceId === 0){
            storeData = [];
            storeData[this.props.spaceId] = config;
        }
        else {
            storeData = store.get('spaces');
            storeData[this.props.spaceId] = config;
        }
        store.set("spaces", storeData);
        console.log(storeData);

        this.props.complete();

    }

    render() {
        let checkButton;

        switch (this.state.status) {
            case STATUS_NONE:
                // checkButton = <Button onClick={e => this.checkApi(e)}>Connect</Button>;
                checkButton = (
                    <div>
                        <div className="checkButton__button"><Button onClick={e => this.checkApi(e)}>Connect</Button></div>
                    </div>);
                break;
            case STATUS_LOADING:
                checkButton = (
                    <div>
                        <div className="checkButton__button"><Button disabled onClick={e => this.checkApi(e)}>Connect</Button></div>
                        <div className="checkButton__loader">Loading</div>
                    </div>);
                break;
            case STATUS_SUCCESS:
                checkButton = (
                    <div>
                        <div className="checkButton__button">
                            <IconButton aria-label="Delete" color="primary" onClick={e => this.setConfig(e)}>
                                <FontAwesomeIcon icon={faCheck}/>
                            </IconButton>
                        </div>
                        <div className="checkButton__message">Hello, {this.state.config.userName}</div>
                    </div>);
                break;
            case STATUS_ERROR:
                checkButton = (
                    <div>
                        <div className="checkButton__button"><Button color="secondary" disabled onClick={e => this.checkApi(e)}>Connection Error</Button></div>
                    </div>);
                break;
        }

        return (
            <div>
              <form
                onSubmit={this.setConfig}
                className="newSpace__window">
                <div className="newSpace__content">
                    <TextField
                        label="SPACE NAME"
                        className="newSpace__input"
                        value={this.state.spaceName}
                        name="spaceName"
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
                        <MenuItem value={TYPE_REDMINE}>Redmine</MenuItem>
                        <MenuItem value={TYPE_BACKLOG}>Backlog</MenuItem>
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
                    <div className="checkButton__wrap">
                        {checkButton}
                    </div>
                </div>
            </form>
            </div>
        );
    }
}
