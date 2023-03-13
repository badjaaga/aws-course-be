const sw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  entry: sw.lib.entries,
  mode: sw.lib.webpack.isLocal ? 'development' : 'production',
  target: 'node',
  plugins: [new webpack.IgnorePlugin({
    resourceRegExp: /^pg-native$/,
})]
};
