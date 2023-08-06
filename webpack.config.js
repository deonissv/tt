const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        bundle: './src/client/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, "./src/"),
        }
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
    },
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
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/client/public', 'index.html')
        }),
        new MiniCssExtractPlugin(),
    ]
}