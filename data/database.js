
import neo4j from 'neo4j';
import utils from 'utility';
import uuid from 'node-uuid';
import config from '../config'
import fs from 'fs';
import path from 'path';


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

// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇
// ◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◆◆◆◆◆◆◆◆◆◇◇◇◇◆◆◆◆◆◆◆◆◆◇◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◇◇◇◇










//{			工具函数 (完工)
// 	query: 'MATCH (user {name: {email}}) RETURN user',
// 	params: {
// 		email: 'onetwo',
// 	},
// }			传递一个上面这样的 cypher query 进来，返回一个 Promise  ， 如果 cypher 返回false那会 reject ， 但有时候只返回空行，我们当做 CREATE 等指令执行完成
function runCypher(cypherQuery, userName=config.neo4jUserName, passWord=config.neo4jPassWord) {
	return new Promise(function (resolve, reject) {
		var db = new neo4j.GraphDatabase({
			url: config.neo4j,  // config.js 里写了 Neo4j 运行在哪里
			auth: {username: userName, password: passWord},  //登陆一下数据库
		});
		db.cypher(cypherQuery, function callback(err, result) {
			if (!result || result.length ==0) {
				resolve(null);   // 没啥结果的时候
			}else{
				// 还是有点结果的时候
				resolve(result);
			}
		});
	});
}


// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◇◇◇◆◆◆◇◇◇◇◇◆◆◆◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◇◇◆◆◆◆◆◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◇◇◆◆◆◆◆◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◇◆◇◇◆◆◆◇◆◆◇◆◆◆◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◆◆◆◆◆◆◆◇◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◆◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◆◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◆◆◆◆◆◆◆◇◆◆◆◇◆◆◇◆◆◆◆◆◇◇◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◇◇◆◆◆◆◇◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◇◇◆◆◆◆◇◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◇◇◆◆◆◆◇◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◇◆◆◆◆◇◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◆◆◆◆◆◇◇◇◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◆◆◆◆◆◇◇◇◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◆◆◆◆◆◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇
// ◇◇◆◆◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◆◆◆◇◆◆◆◆◆◆◆◆◇◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◆◆◆◇◆◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◇◇◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇

function addFeature(featureChineseName) {
	let newUUID = uuid.v4();
	return runCypher({
		query: 'MERGE (n:FEATURE {chineseName: {chineseName}, uuid: {uuid}}) RETURN n.uuid', 
		params: {
			chineseName: featureChineseName,
			uuid: newUUID,
		}, 
	}).then(results => {
		return new Promise(function (resolve, reject) {
			if(results) {
				let addedUUID = results[0]['n.uuid'];
				let newFeature = {
					id: addedUUID,
					text: featureChineseName,
				};
				resolve(newFeature);
			}
			reject(null);
		})
	})
}
//测试
// addFeature('树皮浅灰色')
// .then(result => console.log(result))
// .catch(err => console.log(err));




function addPlant(plantChineseName) {
	let newUUID = uuid.v4();
	return runCypher({
		query: 'MERGE (n:PLANT {chineseName: {chineseName}, uuid: {uuid}}) RETURN n.uuid', 
		params: {
			chineseName: plantChineseName,
			uuid: newUUID,
		}, 
	}).then(results => {
		return new Promise(function (resolve, reject) {
			if(results) {
				let addedUUID = results[0]['n.uuid'];
				let newPlant = {
					id: addedUUID,
					text: plantChineseName,
				};
				resolve(newPlant);
			}
			reject(null);
		})
	})
}
//测试
// addPlant('夹竹桃')
// .then(result => console.log(result))
// .catch(err => console.log(err));


function letPlantHasFeature(plantUUID,  featureUUID) {
	let newUUID = uuid.v4();
	return runCypher({
			query: 'MATCH (p:PLANT {uuid: {plantUUID}}), (f:FEATURE {uuid: {featureUUID}}) MERGE (p)-[r:HAS_FEATURE]->(f) ON CREATE SET r.uuid={relationshipUUID} RETURN r.uuid', 
			params: {
				plantUUID: plantUUID,
				featureUUID: featureUUID,
				relationshipUUID: newUUID,
			},
	}).then(results => {
		return new Promise(function (resolve, reject) {
			if(results) {
				let addedUUID = results[0]['r.uuid'];
				resolve(addedUUID);
			}
			reject(null);
		})
	})
}
//测试
// letPlantHasFeature('50e2af0f-c4ac-419a-af24-551fc7c8320a', 'f4b07f87-7c86-412c-807e-677b5cf326ae')
// .then(result => console.log(result))
// .catch(err => console.log(err));


function letPlantArrayHasFeature(plantArray, featureUUID) {
	let promiseArray = [];
	for(let plantUUID of plantArray) {
		promiseArray.push( letPlantHasFeature(plantUUID, featureUUID) );
	}
	return Promise.all( promiseArray ).then( ()=>getRelationShip() )
}
//测试
// letPlantArrayHasFeature(['3d79fc0c-99ee-46d4-88cd-e3e23932a8dc', 'da7c49b7-14be-44df-a85c-f9eeb8c2837c'], 'fa95404c-df7e-4aa5-9b7b-1a22b71faf86')
// .then( result => console.log('asdfasdf') );


function letPlantHasFeatureArray(plantUUID, featureArray) {
	let promiseArray = [];
	for(let featureUUID of featureArray) {
		promiseArray.push( letPlantHasFeature(plantUUID, featureUUID) );
	}
	return Promise.all( promiseArray ).then( ()=>getRelationShip() )
}
//测试
// letPlantHasFeatureArray('3d79fc0c-99ee-46d4-88cd-e3e23932a8dc', ['04beb8c8-9bbe-4e34-a2e8-814994c40841', 'fa95404c-df7e-4aa5-9b7b-1a22b71faf86'] )
// .then( result => console.log('asdfasdf') );



// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◇◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◆◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◇◇◇◆◆◆◆◆◇◆◆◆◆◇◇◇◆◆◆◆◇◇◇◇◇◆◆◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◆◇◇◇◆◆◆◆◇◇◇◇◇◆◆◆◆◆◆◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◆◇◇◇◆◆◆◆◇◇◇◇◇◆◆◆◆◆◆◆◆◇◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◆◇◇◆◆◆◆◆◇◇◇◇◇◇◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◆◇◇◆◆◆◆◆◇◇◇◇◇◇◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◆◆◇◆◆◆◆◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◇◇◇◆◆◆◆◆◇◆◆◆◆◆◇◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◆◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◇
// ◇◇◆◆◆◆◇◇◇◆◆◆◆◆◇◇◇◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇
// ◇◇◆◆◆◆◇◇◇◆◆◆◆◆◆◇◇◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇
// ◇◇◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◆◇◇◇◇◇◇◇◇◇◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◇◇◆◆◆◆◇◇◆◆◆◆◆◇◇◇◇◇◆◆◆◆◇◇◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◆◆◆◆◆◇◇◇◆◆◆◆◆◇◇◇◇◇◇
// ◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◇◆◆◆◆◆◆◇◇◆◆◆◆◆◇◇◇◇◇◇
// ◇◆◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◆◆◆◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◆◆◆◇◇◆◆◆◆◆◆◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◆◇◆◆◆◆◆◆◆◆◆◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◆◆◆◇◇◇◇◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◆◆◇◇◇◇◇◇◇
// ◇◇◇◇◇◇◇◇◇◆◆◆◆◆◇◆◆◇◇◇◇◇◇◇◆◆◇◇◇◇◇◇◇◇◆◆◆◆◇◇◇◇◇◇◇◇◆◆◆◆◆◇◇◇◇◇◇◇◇◇




function getDatabase() {
	let promiseArray = [getPlant(), getFeature(), getRelationShip()];
	return Promise.all( promiseArray )
	.then( resultArray=>{
		// 似乎 node 还不支持 Promise.resolve(value)
		return new Promise(function (resolve, reject) {
			resolve({
				forPlant: resultArray[0],
				forFeature: resultArray[1],
				forRelationship: resultArray[2]
			})
		})
	})
	.catch(err => console.log(err));
}
// 测试
// getDatabase()
// .then( results => console.log(results))
// .catch(err => console.log(err));


function getPlant() {
	return runCypher({
		query: 'MATCH (p:PLANT) RETURN p.uuid AS id, p.chineseName AS text', 
	}).then(results => {
		return new Promise(function (resolve, reject) {
			let forPlant = {
				plantArray: [],
				id: '42',
			}
			if(results) {
				/* 
				[ { 'id': '50e2af0f-c4ac-419a-af24-551fc7c8320a',
				    'text': '侧柏' },
				  { 'id': '8b1bf568-277e-4a5b-9953-77e2dc9ff85d',
				    'text': 'bbb' } ]
				*/
				forPlant.plantArray = results;
				resolve(forPlant);
			}
			resolve(forPlant);
		})
	})
}


function getFeature() {
	return runCypher({
		query: 'MATCH (p:FEATURE) RETURN p.uuid AS id, p.chineseName AS text', 
	}).then(results => {
		return new Promise(function (resolve, reject) {
			let forFeature = {
				featureArray: [],
				id: '12',
			}
			if(results) {
				/* 
				[ { 'id': '50e2af0f-c4ac-419a-af24-551fc7c8320a',
				    'text': '侧柏' },
				  { 'id': '8b1bf568-277e-4a5b-9953-77e2dc9ff85d',
				    'text': 'bbb' } ]
				*/
				forFeature.featureArray = results;
				resolve(forFeature);
			}
			resolve(forFeature);
		})
	})
}


function getRelationShip() {
	return runCypher({
			query: 'MATCH (p:PLANT)-[r]->(f:FEATURE) RETURN {plant : {id: p.uuid, text: p.chineseName},id: r.uuid , feature: {id: f.uuid, text: f.chineseName} } AS result ORDER BY p.chineseName', 
	}).then(results => {
		// [ { result: 
		//    { plant: [Object],
		//      id: 'b2bbdf0a-8895-4603-86a9-7cb429bb8a2f',
		//      feature: [Object] } },
		// { result: 
		//    { plant: [Object],
		//      id: 'a7841392-8798-4055-b72f-655da46a64f4',
		//      feature: [Object] } } ]
		return new Promise(function (resolve, reject) {
			let forRelationship = {
				relationshipArray: [],
				id: '100',
			};
			if(results) {
				for(let result of results) {
					forRelationship.relationshipArray.push( result.result );
				}
				resolve(forRelationship);
			}
			resolve(forRelationship);
		})
	})
}




module.exports = {
	getDatabase,
	addPlant,
	addFeature,
	getPlant,
	getFeature,
	getRelationShip,
	letPlantArrayHasFeature,
	letPlantHasFeatureArray,
};
