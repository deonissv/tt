const path = require("path");
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, '.'),
        },
        client: {
            overlay: false
        },
        hot: true,
        port: 5500,
    },
});
