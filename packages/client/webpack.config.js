const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const tsconfig = 'tsconfig.json';

module.exports = {
  entry: path.resolve(__dirname, 'src/index.tsx'),
  mode: 'production',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      path: false,
    },
    plugins: [new TsconfigPathsPlugin({ configFile: tsconfig })],
    // alias: {
    //   '@shared': path.resolve(__dirname, '../shared/src/'),
    //   '@components': path.resolve(__dirname, './src/components/'),
    //   '@services': path.resolve(__dirname, './src/services/'),
    // },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
      },
      {
        test: /.tsx?$/,
        use: {
          loader: 'swc-loader',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif)/,
        use: ['image-loader'],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: tsconfig,
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '.', 'index.html'),
    }),
    new MiniCssExtractPlugin(),
  ],
};
