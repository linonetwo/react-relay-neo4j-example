import 'babel/polyfill';

import TaoTao from './components/TaoTao';
import TaoTaoRoute from './routes/TaoTaoRoute';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';


ReactDOM.render(
	<Relay.RootContainer
		Component={TaoTao}
		route={new TaoTaoRoute()}
	/>,
	document.getElementById('root')
);
