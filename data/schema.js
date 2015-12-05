/**
 *	Copyright (c) 2015, Facebook, Inc.
 *	All rights reserved.
 *
 *	This source code is licensed under the BSD-style license found in the
 *	LICENSE file in the root directory of this source tree. An additional grant
 *	of patent rights can be found in the PATENTS file in the same directory.
 */

import {
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLID,
	GraphQLInt,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
} from 'graphql';

import {
	connectionArgs,
	connectionDefinitions,
	connectionFromArray,
	fromGlobalId,
	globalIdField,
	mutationWithClientMutationId,
	nodeDefinitions,
} from 'graphql-relay';

import { 
	getDatabase, 
	addPlant, 
	getPlant, 
	addFeature, 
	getFeature, 
	getRelationShip,
	letPlantArrayHasFeature,
	letPlantHasFeatureArray,
} from './database';



var PlantType = new GraphQLObjectType({
	name: 'NameOfPlantType',
	fields: () => ({
		id: {type: GraphQLID},
		text: {type: GraphQLString},
	}),
});

var PlantListType = new GraphQLObjectType({
	name: 'NameOfPlantListType',
	fields: () => ({
		plantArray: { type: new GraphQLList(PlantType) },
		id: { type: GraphQLString },
	}),
});


var FeatureType = new GraphQLObjectType({
	name: 'NameOfFeatureType',
	fields: () => ({
		id: {type: GraphQLID},
		text: {type: GraphQLString},
	}),
});

var FeatureListType = new GraphQLObjectType({
	name: 'NameOfFeatureListType',
	fields: () => ({
		featureArray: { type: new GraphQLList(FeatureType) },
		id: { type: GraphQLString },
	}),
});


var RelationshipType = new GraphQLObjectType({
	name: 'NameOfRelationshipType',
	fields: () => ({
		plant: {type: PlantType},
		id: {type: GraphQLID},
		feature: {type: FeatureType},
	}),
});

var RelationshipListType = new GraphQLObjectType({
	name: 'NameOfRelationshipListType',
	fields: () => ({
		relationshipArray: { type: new GraphQLList(RelationshipType) },
		id: { type: GraphQLString },
	}),
});


var TaoTaoType = new GraphQLObjectType({
	name: 'NameOfTaoTaoType',
	fields: () => ({
		forPlant: {type: PlantListType},
		forFeature: {type: FeatureListType},
		forRelationship: {type: RelationshipListType},
	}),
});



var MutationOfCreatePlant = mutationWithClientMutationId({
	name: 'NameOfCreateNewPlantasdfasdf',
	inputFields: {
		text: { type: new GraphQLNonNull(GraphQLString) },
	},
	outputFields: {
		plantListFromMutationOutputFields: {
			type: PlantListType,
			resolve: getPlant,
		},
	},
	mutateAndGetPayload: ({text}) => {
		let newPlant = addPlant(text);
		return newPlant;
	},
});


var MutationOfCreateFeature = mutationWithClientMutationId({
	name: 'NameOfCreateNewFeatureasdfasdf',
	inputFields: {
		text: { type: new GraphQLNonNull(GraphQLString) },
	},
	outputFields: {
		featureListFromMutationOutputFields: {
			type: FeatureListType,
			resolve: getFeature,
		},
	},
	mutateAndGetPayload: ({text}) => {
		let newFeature = addFeature(text);
		return newFeature;
	},
});


var MutationOfLetPlantArrayHasFeature = mutationWithClientMutationId({
	name: 'NameOfMutationOfLetPlantArrayHasFeatureasdfasdf',
	inputFields: {
		plantUUIDArray: { type: new GraphQLList(GraphQLString) },
		featureUUID: { type: new GraphQLNonNull(GraphQLString) },
	},
	outputFields: {
		relationshipListFromMutationOutputFields: {
			type: RelationshipListType,
			resolve: getRelationShip,
		},
	},
	mutateAndGetPayload: ({plantUUIDArray, featureUUID}) => {
		let relationships = letPlantArrayHasFeature(plantUUIDArray, featureUUID);
		return relationships;
	},
});


var MutationOfLetPlantHasFeatureArray = mutationWithClientMutationId({
	name: 'NameOfMutationOfLetPlantHasFeatureArrayasdfasdf',
	inputFields: {
		plantUUID: { type: new GraphQLNonNull(GraphQLString) },
		featureUUIDArray: { type: new GraphQLList(GraphQLString) },
	},
	outputFields: {
		relationshipListFromMutationOutputFields: {
			type: RelationshipListType,
			resolve: getRelationShip,
		},
	},
	mutateAndGetPayload: ({plantUUID, featureUUIDArray}) => {
		let relationships = letPlantHasFeatureArray(plantUUID, featureUUIDArray);
		return relationships;
	},
});


export var Schema =	new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'QueryThatLigoudanWants',
		fields: () => ({
			TaoTaoFIeld: {
				type: TaoTaoType,
				resolve: getDatabase,
			},
		}),
	}),
	mutation: new GraphQLObjectType({
		name: 'aaa',
		fields: () => ({
			createPlantField: MutationOfCreatePlant,
			createFeatureField: MutationOfCreateFeature,
			LetPlantArrayHasFeatureField: MutationOfLetPlantArrayHasFeature,
			LetPlantHasFeatureArrayField: MutationOfLetPlantHasFeatureArray,
		}),
	}),
});