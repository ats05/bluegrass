import React from 'react';
import RedmineApi from "../script/redmineApi";
import Moment from 'moment';
import classnames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faStopwatch, faUser, faStar as fasStar, faCaretRight} from '@fortawesome/free-solid-svg-icons'
import {faStar as farStar} from '@fortawesome/free-regular-svg-icons';

import Issues from "./issues";
import Store from 'electron-config';
import NewSpaces from "./newSpace";


export default class Spaces extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spaces: [],
            selectedIndex: 0,
            noConfig: true
        };

        const store = new Store();
        let config = store.get('spaces');
        if (!config) {
            this.state.noConfig = true;
            // store.set('spaces', config);
        }
        else {
            this.state.spaces = config;
            this.state.noConfig = false;
        }
        

    }

    // NewSpacesで入力したスペース設定を取り込む
    setConfig(config) {
        this.state.noConfig = false;
    }

    render() {

        if(this.state.noConfig) return <NewSpaces complete={this.setConfig}/>

        return (
            <div className="spaces">
                <div className="spaces__tabArea">
                    <div className="spaces__tab">
                        <span  className="spaces__tabItem">
                            <FontAwesomeIcon icon={faUser}/>
                        </span>
                    </div>
                    <div className="spaces__tab">
                        <span  className="spaces__tabItem">
                            <FontAwesomeIcon icon={fasStar}/>
                        </span>
                    </div>
                </div>
                <div className="spaces__issueArea">
                    <Issues params={this.state.spaces[0]}/>
                </div>
            </div>
        );
    }
}
