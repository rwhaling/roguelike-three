const path = require('path');
var webpack = require('webpack');

module.exports = {
entry: './src/main.ts',
module: {
    rules:[{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
    }]
},
resolve: {
    extensions: ['.ts', '.tsx', '.js']
},
output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
},
mode: 'development',
plugins: [new webpack.EnvironmentPlugin(['ASSET_KEY'])]
};