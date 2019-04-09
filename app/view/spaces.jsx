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

let store;
let noConfig;
let spaces = [];

/*
Spaces やりたきこと
Space = ワークスペース　BacklogとかRedmineの1アカウントで利用できる範囲

マウント時
- 設定ファイルを読んで、保存されてるSpaceの情報を取得
- ひとつもなかった場合、初期設定画面を開く

 */
export default class Spaces extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spacesLength: 0,
        };
        noConfig = true;
        this.loadConfig();
    }

    // NewSpacesで入力したスペース設定を取り込む
    loadConfig() {
        store = new Store();
        let config = store.get('spaces');
        if (!Array.isArray(config) || config.length === 0) {
            this.state.spacesLength = 0;
            noConfig = true;
        }
        else {
            spaces = config;
            this.state.spacesLength = config.length;
            noConfig = false;
        }
    }

    render() {

        // TODO ここら辺なんとかする
        // TODO Spaceの追加機能
        if(noConfig) return <NewSpaces complete={() => this.loadConfig()} spaceId={this.state.spacesLength}/>;

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
                    <Issues params={spaces[0]} spaceId="0"/>
                </div>
            </div>
        );
    }
}
