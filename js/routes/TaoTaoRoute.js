import Relay from 'react-relay';

export default class extends Relay.Route {
	static routeName = 'LiShadan';
	static queries = {
		guanHaiTingTao: (Component) => Relay.QL`
			query GuanHaiTingTaoQuery {
				TaoTaoFIeld {
					${Component.getFragment('guanHaiTingTao')},
				}
			}
		`,
	};
}
