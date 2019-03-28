import React from 'react';
import RedmineApi from "../script/redmineApi";
import Moment from 'moment';
import classnames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faStopwatch, faUser, faStar as fasStar, faCaretRight} from '@fortawesome/free-solid-svg-icons'
import {faStar as farStar} from '@fortawesome/free-regular-svg-icons';

import Issues from "./issues";
import Store from 'electron-config';


export default class Spaces extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spaces: [],
            selectedIndex: 0
        };

        const store = new Store();
        let config = store.get('spaces');
        if (!config) {
            config = [
                {
                    url: 'http://hogeohge/',
                    key: 'xxxxxxxx'
                }];
            store.set('spaces', config);
        }
        this.state.spaces = config;

    }

    render() {
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
                    <Issues params={this.state.spaces[0]} spaceId="0"/>
                </div>
            </div>
        );
    }
}
