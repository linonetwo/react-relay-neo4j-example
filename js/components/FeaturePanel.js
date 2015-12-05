import React from 'react';
import Relay from 'react-relay';

import Mui from 'material-ui';
const { Paper, Card, CardHeader, CardActions, TextField, Avatar, FlatButton } = Mui;


let injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();


class FeaturePanel extends React.Component {
	_handleFeatureSubmit = (e) => {
		e.preventDefault();
		Relay.Store.update(
			new CreateFeatureMutation({ // 把需要传到服务器的那个 featureList的id，还有要放进去的内容，赋值给左值
				featureListWithID: this.props.featureFromRelay,
				text: this.refs.featureInputField.getValue(),
			})
		);
		this.refs.featureInputField.clearValue();
	}


	render() {
	var {featureArray} = this.props.featureFromRelay;
	return (
		<div>
		<Paper zDepth={1} style={{width:'49%','float': 'left'}}>
			<Card >
				<CardHeader
					title="Features"
					avatar={<Avatar style={{'color': '#212121', 'backgroundColor': '#9E9E9E'}}>F</Avatar>} />
				<form onSubmit={this._handleFeatureSubmit}>
				<TextField
					floatingLabelText="New Feature"
					multiLine={false} 
					style={{width:'100%'}}
					ref="featureInputField"
					underlineFocusStyle={{'borderColor': '#BDBDBD'}}
					floatingLabelStyle={{'color': '#BDBDBD'}}
					/>
				</form>
				<CardActions>
					{featureArray.map(
					aFeature => {let {id, text} = aFeature; return<FlatButton label={text} key={id} disabled={this.props.selected.contains(id)||this.props.mode=='pickPlantForFeature'} onTouchTap={() => this.props.handleFeatureClicking(text, id)}/> }
					)}
				</CardActions>
			</Card>
		</Paper>
		</div>
	);
	}
}
export default Relay.createContainer(FeaturePanel, {
	fragments: {
	featureFromRelay: () => Relay.QL`
		fragment on NameOfFeatureListType {
			featureArray {
				id,
				text,
			},
			${CreateFeatureMutation.getFragment('featureListWithID')},
		}
	`,
	},
});


class CreateFeatureMutation extends Relay.Mutation {
	static fragments = {
		featureListWithID: () => Relay.QL`
			fragment on NameOfFeatureListType { id }
		`,
	};
	getMutation() {
		return Relay.QL`
			mutation{ createFeatureField }
		`;
	}
	getFatQuery() { // 下面这东西on 的Object，居然就是 schema 里定义的Mutation的名字后面加个Payload
	return Relay.QL`
		fragment on NameOfCreateNewFeatureasdfasdfPayload { 
			featureListFromMutationOutputFields { featureArray },
		}
	`;
	}
	getConfigs() { //下面这东西声明在schema的 outputFields ，但是好像是用来在断网情况下更新本地显示的，注意，它获取id只为了即时在这个id对应的列表里显示你做出过的修改
		return [{
			type: 'FIELDS_CHANGE',
			fieldIDs: { featureListFromMutationOutputFields: this.props.featureListWithID.id },
		}];
	}
	getVariables() {
		return { text: this.props.text };
	}
}
