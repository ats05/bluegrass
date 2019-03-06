import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Spaces from "../view/spaces";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


ReactDOM.render(
    <div>
        <MuiThemeProvider>
            <Spaces />
        </MuiThemeProvider>
    </div>,
  document.getElementById('content')

);
