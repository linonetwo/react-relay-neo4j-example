import React from 'react';
import Relay from 'react-relay';
import PlantPanel from './PlantPanel';
import FeaturePanel from './FeaturePanel';
import RelationshipPanel from './RelationshipPanel';


import Mui from 'material-ui';
const { Snackbar, FloatingActionButton } = Mui;


//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
let injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();


class TaoTao extends React.Component {


	constructor(props) {
		super(props);
		this.state = {selectedPlant: [], selectedFeature: [], info: '加油！', mode: null};
	}


	_handlePlantClicking = (name, uuid) => {
		// 如果现在没有处在选植物或是选特性的模式下，就设置一下当前处于选特征的模式，并保存我们正为之选特征的植物的 uuid
		if(!this.state.mode) {
			let infoToShow = '为植物 ' + name + ' 选择多个特征';
			this.setState({info:  infoToShow, mode: 'pickFeatureForPlant', selectedPlant: [uuid] });
			this.refs.snackbar.show();
		}else if(this.state.mode = 'pickPlantForFeature') {
			// 如果我们当前是在选择拥有某个特征的所有植物，那么点一个植物我们就要记下一个植物，方便过会提交
			let alreadySelected = this.state.selectedPlant;
			alreadySelected.push( uuid );
			this.setState({selectedPlant: alreadySelected});
		}
	};


	_handleFeatureClicking = (name, uuid) => {
		if(!this.state.mode) {
			let infoToShow = '选择多个属于 '+ name +' 的植物';
			this.setState({info:  infoToShow, mode: 'pickPlantForFeature', selectedFeature: [uuid] });
			this.refs.snackbar.show();
		}else if(this.state.mode = 'pickFeatureForPlant') {
			let alreadySelected = this.state.selectedFeature;
			alreadySelected.push( uuid );
			this.setState({selectedFeature: alreadySelected});
		}
	};


	_handleUndo = () => {
		this.setState({selectedPlant: [], selectedFeature: [], info:  '加油！', mode: null });
		this.refs.snackbar.dismiss();
	};


	_handleSubmit = () => {
		// 如果先点了一个特征，然后开始选择拥有这个特征的植物
		if(this.state.mode == 'pickPlantForFeature') {
			// selectedFeature 数组里应该只有一个uuid，也就是 selectedPlant 数组里一大串植物所拥有的同一个特征
			let feature = this.state.selectedFeature[0];
			const { forRelationship } = this.props.guanHaiTingTao;
			Relay.Store.update(
				new LetPlantArrayHasFeatureMutation({
					relationshipListWithID: forRelationship,
					plantUUIDArray: this.state.selectedPlant, 
					featureUUID: feature,
				})
			);
		}else if(this.state.mode == 'pickFeatureForPlant') {
			// 如果先点了一个植物，然后开始选择这个植物拥有的所有特征，selectedPlant 数组里应该只有一个uuid
			let plant = this.state.selectedPlant[0];
			const { forRelationship } = this.props.guanHaiTingTao;
			Relay.Store.update(
				new LetPlantHasFeatureArrayMutation({
					relationshipListWithID: forRelationship,
					plantUUID: plant,
					featureUUIDArray: this.state.selectedFeature,
				})
			);
		}


		this.setState({selectedPlant: [], selectedFeature: [], info:  '正在提交到林一二的服务器', mode: null });
		this.refs.snackbar.show();
	};




	render() {
		const {forPlant, forFeature, forRelationship} = this.props.guanHaiTingTao;
		return( <div>
				<PlantPanel plantFromRelay={forPlant} mode={this.state.mode} selected={this.state.selectedPlant} handlePlantClicking={this._handlePlantClicking}/>
				<FeaturePanel featureFromRelay={forFeature} mode={this.state.mode} selected={this.state.selectedFeature} handleFeatureClicking={this._handleFeatureClicking}/>
				<RelationshipPanel relationshipFromRelay={forRelationship} />


				<FloatingActionButton style={{'position': 'absolute', 'right':20, 'bottom':60, 'zIndex': 10}} backgroundColor='#CFD8DC' onTouchTap={this._handleSubmit}/>


				<Snackbar
					message={this.state.info}
					action="undo"
					autoHideDuration={this.state.mode==null?1000:20000}
					onActionTouchTap={this._handleUndo}
					style={{'zIndex': 9}}
					ref="snackbar"/>
			</div>);
		}
}
export default Relay.createContainer(TaoTao, {
	fragments: {
		guanHaiTingTao: () => Relay.QL`
			fragment on NameOfTaoTaoType {
				forPlant {
					${PlantPanel.getFragment('plantFromRelay')},
				},
				forFeature {
					${FeaturePanel.getFragment('featureFromRelay')},
				},
				forRelationship {
					${RelationshipPanel.getFragment('relationshipFromRelay')},
					${LetPlantArrayHasFeatureMutation.getFragment('relationshipListWithID')},
					${LetPlantHasFeatureArrayMutation.getFragment('relationshipListWithID')},
				},
				
			}
		`,
	}
});


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


class LetPlantArrayHasFeatureMutation extends Relay.Mutation {
	static fragments = {
		relationshipListWithID: () => Relay.QL`
			fragment on NameOfRelationshipListType { id }
		`,
	};
	getMutation() {
		return Relay.QL`
			mutation{ LetPlantArrayHasFeatureField }
		`;
	}
	getFatQuery() { // 下面这东西on 的Object，居然就是 schema 里定义的Mutation的名字后面加个Payload
	return Relay.QL`
		fragment on NameOfMutationOfLetPlantArrayHasFeatureasdfasdfPayload { 
			relationshipListFromMutationOutputFields { relationshipArray },
		}
	`;
	}
	getConfigs() { //下面这东西声明在schema的 outputFields ，但是好像是用来在断网情况下更新本地显示的，注意，它获取id只为了即时在这个id对应的列表里显示你做出过的修改
		return [{
			type: 'FIELDS_CHANGE',
			fieldIDs: { relationshipListFromMutationOutputFields: this.props.relationshipListWithID.id },
		}];
	}
	getVariables() {
		return { 
			plantUUIDArray: this.props.plantUUIDArray, 
			featureUUID: this.props.featureUUID,
		};
	}
}


class LetPlantHasFeatureArrayMutation extends Relay.Mutation {
	static fragments = {
		relationshipListWithID: () => Relay.QL`
			fragment on NameOfRelationshipListType { id }
		`,
	};
	getMutation() {
		return Relay.QL`
			mutation{ LetPlantHasFeatureArrayField }
		`;
	}
	getFatQuery() { // 下面这东西on 的Object，居然就是 schema 里定义的Mutation的名字后面加个Payload
	return Relay.QL`
		fragment on NameOfMutationOfLetPlantHasFeatureArrayasdfasdfPayload { 
			relationshipListFromMutationOutputFields { relationshipArray },
		}
	`;
	}
	getConfigs() { //下面这东西声明在schema的 outputFields ，但是好像是用来在断网情况下更新本地显示的，注意，它获取id只为了即时在这个id对应的列表里显示你做出过的修改
		return [{
			type: 'FIELDS_CHANGE',
			fieldIDs: { relationshipListFromMutationOutputFields: this.props.relationshipListWithID.id },
		}];
	}
	getVariables() {
		return { 
			plantUUID: this.props.plantUUID, 
			featureUUIDArray: this.props.featureUUIDArray,
		};
	}
}