const path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/main.ts',
    test: './src/test.ts',
  },
  module: {
    rules:[{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
    },{
        test: /\.glsl?$/,
        type: 'asset/source',
        exclude: /node_modules/
    }]
},
resolve: {
    extensions: ['.ts', '.tsx', '.js']
},
output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
},
mode: 'development',
plugins: [new webpack.EnvironmentPlugin(['ASSET_KEY'])]
};