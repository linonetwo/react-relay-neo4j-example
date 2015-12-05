#这是啥

一个用于整理各种植物的特征的工具，可以向列表中添加新植物和新特征：点击某种植物后，再点击几个特征，然后按右下角的按钮提交，就可以把植物特征信息变成 Neo4j 图论数据库中的节点和边，方便进一步分析。

#怎么运行
首先默认你已经配置好了 node 。
[下载 Neo4j 图论数据库](http://neo4j.com/download/)的社区版，neo4j-community 。
解压后运行   
> /neo4j/bin/neo4j start-no-wait

启动数据库后过几千毫秒，你可以打开 http://localhost:7474/ 然后按要求创建用户，项目使用的用户名是 neo4j 密码是 lkjhgfdsa 。  
如果你管不住自己的手使用了自己的用户名和密码，你恐怕得跑去修改项目根目录里 config.js 里的内容了。
创建用户后，你可以看到 Neo4j 的控制台，在左边的菜单里有许多预制的命令，例如
> MATCH (n) RETURN n LIMIT 100

可用于查看当前的节点情况。这种查询语言叫 Cypher ，语法与 SQL 类似，这有一个[翻译的入门教程](https://github.com/linonetwo/neo4j-tutorial-Chinese)  
  

cd 到本项目目录下，然后运行
> npm i
> npm run start
  
然后打开 http://localhost:3010/ 就可以看到网站了

#怎么理解这个应用
从项目根目录下的 server.js 开始看，它引用了 ./js/app.js  

./js/app.js 引用了 ./js/routes/TaoTaoRoute.js 和 ./js/components/TaoTao.js  

```<TaoTao />``` 是一个用于放 ```<FeaturePanel/>``` ```<PlantPanel/>``` 和 ```<RelationshipPanel/>``` 的容器，内有用于创建植物和特征之间关系的 Mutation   
  

```<FeaturePanel/>``` 和 ```<PlantPanel/>``` 差不多，都有用于向 Neo4j 中添加节点的 Mutation 
  
以上 React 组件外都包有 Relay 容器，Relay 容器向后台请求数据，后台与之对应的端点在根目录下的 ./data/schema.js 中定义  
schema.js 引用了 ./data/database.js ，database.js 提供了与 Neo4j 数据库通信的函数，每个函数都返回一个 Promise   

当你修改了 schema.js 后记得运行
> npm run update-schema  

它会用 schema.js 生成一个 schema.graphql 文件，用于指导 graphQL 服务器如何开启数据端点。
  
数据流动： 
> React <-> Relay <-> graphQL Server Endpoint <-> database.js <-> Neo4j RESTful Endpoint

#你在说什么
为什么不问问神奇海螺呢？  
[React 资源索引](http://nav.react-china.org/)   
[Relay 中文教程](https://github.com/lineves/Relay-Tutorial-Chinese)   
[ GraphQL 手册](http://graphql.org/docs/api-reference-type-system/)   