import React from 'react';
import Relay from 'react-relay';

import Mui from 'material-ui';
const { Paper, Card, CardHeader, CardActions, CardText, TextField, Avatar, FlatButton, List, ListItem } = Mui;


let injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();


class RelationshipPanel extends React.Component {
	render() {
	var {relationshipArray} = this.props.relationshipFromRelay;
	var groupedList = []; // 把同一个植物拥有的特征都放到一起
	let tempPlant = relationshipArray[0].plant  // 第一个植物
	let tempFeatureArray = [];
	relationshipArray.map(
		item => {
			// relationshipArray 是按照 plant.text 排序过的，所以只要现在考察的植物还是同一个，就把 feature 放到 tempFeatureArray 里
			if(item.plant.text == tempPlant.text) {
				tempFeatureArray.push( item.feature );
			} else {
				// 当考察到下一个植物的时候，就把上个植物的所有特征保存起来，并开始考察下一个植物
				groupedList.push({
					plant: tempPlant,
					id: item.plant.id,
					featureArray: tempFeatureArray,
				})
				tempPlant = item.plant;
				tempFeatureArray = [];
			}
		}
	)
	groupedList.push({
		plant: tempPlant,
		id: relationshipArray.pop().plant.id,
		featureArray: tempFeatureArray,
	})

	
	return (
		<div>
		<Paper zDepth={5} style={{'float': 'left', 'marginTop': 20, 'width': '100%'}}>
			<Card >
			<CardText>
			<List subheader="Relationship">
				{
					
					groupedList.map(
						item => {
							return <ListItem
								leftAvatar={<Avatar style={{'color':'#689F38', 'backgroundColor': '#C5E1A5'}}>{item.plant.text.substring(0,1)}</Avatar>}
								primaryText={item.plant.text}
								secondaryText={
									<p>
										{item.featureArray.map(
											singleFeature => singleFeature.text+' '
										)}
									</p>
								}
								key={item.plant.id}
								/>
						}
					)
				}
			</List>
			</CardText>
			</Card>
		</Paper>
		</div>
	);
	}
}
export default Relay.createContainer(RelationshipPanel, {
	fragments: {
	relationshipFromRelay: () => Relay.QL`
		fragment on NameOfRelationshipListType {
			relationshipArray {
				plant {
					id,
					text,
				},
				id,
				feature {
					id,
					text,
				},
			},
		}
	`,
	},
});


