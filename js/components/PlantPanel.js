import React from 'react';
import Relay from 'react-relay';

import Mui from 'material-ui';
const { Paper, Card, CardHeader, CardActions, TextField, Avatar, FlatButton } = Mui;


let injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();


class PlantPanel extends React.Component {


	_handlePlantSubmit = (e) => {
		e.preventDefault();
		Relay.Store.update(
			new CreatePlantMutation({ // 把需要传到服务器的那个 speechList的id，还有要放进去的内容，赋值给左值
				plantListWithID: this.props.plantFromRelay,
				text: this.refs.plantInputField.getValue(),
			})
		);
		this.refs.plantInputField.clearValue();
	}




	render() {
	var {plantArray} = this.props.plantFromRelay;
	return (
		<div>
		<Paper zDepth={1} style={{width:'49%','float': 'right'}}>
			<Card >
				<CardHeader
					title="Plants"
					avatar={<Avatar style={{color:'#689F38', 'backgroundColor': '#C5E1A5'}}>P</Avatar>} />
				<form onSubmit={this._handlePlantSubmit}>
				<TextField
					floatingLabelText="New Plant"
					multiLine={false} 
					style={{width:'100%'}}
					ref="plantInputField"
					underlineFocusStyle={{'borderColor': '#DCEDC8'}}
					floatingLabelStyle={{'color': '#DCEDC8'}}
					/>
				</form>
				<CardActions>
					{plantArray.map(
						aPlant => {
							let {id, text} = aPlant; 
							return<FlatButton label={text} key={id} disabled={this.props.selected.contains(id)||this.props.mode=='pickFeatureForPlant'} onTouchTap={() => this.props.handlePlantClicking(text, id)} hoverColor={'#DCEDC8'} rippleColor={'#33691E'}/> 
						}
					)}
				</CardActions>
			</Card>
		</Paper>
		</div>
	);
	}
}
export default Relay.createContainer(PlantPanel, {
	fragments: {
	plantFromRelay: () => Relay.QL`
		fragment on NameOfPlantListType {
			plantArray {
				id,
				text,
			},
			${CreatePlantMutation.getFragment('plantListWithID')},
		}
	`,
	},
});


class CreatePlantMutation extends Relay.Mutation {
	static fragments = {
		plantListWithID: () => Relay.QL`
			fragment on NameOfPlantListType { id }
		`,
	};
	getMutation() {
		return Relay.QL`
			mutation{ createPlantField }
		`;
	}
	getFatQuery() { // 下面这东西on 的Object，居然就是 schema 里定义的Mutation的名字后面加个Payload
	return Relay.QL`
		fragment on NameOfCreateNewPlantasdfasdfPayload { 
			plantListFromMutationOutputFields { plantArray },
		}
	`;
	}
	getConfigs() { //下面这东西声明在schema的 outputFields ，但是好像是用来在断网情况下更新本地显示的，注意，它获取id只为了即时在这个id对应的列表里显示你做出过的修改
		return [{
			type: 'FIELDS_CHANGE',
			fieldIDs: { plantListFromMutationOutputFields: this.props.plantListWithID.id },
		}];
	}
	getVariables() {
		return { text: this.props.text };
	}
}


// 注入一个方便的用法，看数组是不是包含某个值
Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}
