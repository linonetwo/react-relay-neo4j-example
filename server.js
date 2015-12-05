import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import {Schema} from './data/schema';
import config from './config';


// Expose a GraphQL endpoint
var graphQLServer = express();
graphQLServer.use('/', graphQLHTTP({schema: Schema, pretty: true}));
graphQLServer.listen(config.graphQLPort, () => console.log(
  `GraphQL Server is now running on http://localhost:${config.graphQLPort}`
));

// Serve the Relay app
var compiler = webpack({
  entry: path.resolve(__dirname, 'js', 'app.js'),
  module: {
  loaders: [
    {
    exclude: /node_modules/,
    loader: 'babel',
    query: {stage: 0, plugins: ['./build/babelRelayPlugin']},
    test: /\.js$/,
    }
  ]
  },
  output: {filename: 'app.js', path: '/'}
}); 
var app = new WebpackDevServer(compiler, {
  contentBase: '/public/',
  proxy: {'/graphql': `http://localhost:${config.graphQLPort}`},
  publicPath: '/js/',
  stats: {colors: true}
});
// Serve static resources
app.use('/', express.static(path.resolve(__dirname, 'public')));
app.listen(config.port, () => {
  console.log(`App is now running on http://localhost:${config.port}`);
});
