const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

const tsconfig = 'tsconfig.json';
const rootDir = path.resolve(__dirname, '..', '..');
const entryFile = path.resolve(__dirname, 'src', 'main.ts');
const hmrFile = 'webpack/hot/poll?100';

module.exports = env => {
  const isProduction = env.production !== 'undefined' && env.production === true;
  const isDev = !isProduction;

  console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

  const mode = isProduction ? 'production' : 'development';
  const devtool = isProduction ? false : 'source-map';
  const outDir = isProduction ? 'build' : 'dist';
  const entry = isDev ? [hmrFile, entryFile] : entryFile;
  const nodeExternalsOptions = {
    modulesDir: path.resolve(rootDir, 'node_modules'),
    ...(isDev && { allowlist: [hmrFile] }),
  };

  return {
    entry: entry,
    optimization: {
      minimize: isProduction,
    },
    target: 'node',
    mode,
    devtool,
    externals: [nodeExternals(nodeExternalsOptions)],
    ignoreWarnings: [/^(?!CriticalDependenciesWarning$)/],
    externalsPresets: {
      node: true,
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: {
            loader: 'swc-loader',
            options: swcDefaultConfig,
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      modules: [
        path.resolve(__dirname, '..', '..', '/**/node_modules'),
        path.resolve(__dirname, '..', '..', 'node_modules'),
        path.resolve(__dirname, 'node_modules'),
        'node_modules',
      ],
      extensions: ['.tsx', '.ts', '.js'],
      plugins: [new TsconfigPathsPlugin({ configFile: tsconfig })],
    },
    plugins: [
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@nestjs/microservices',
            '@nestjs/microservices/microservices-module',
            '@nestjs/websockets',
            '@nestjs/platform-socket.io',
            '@nestjs/websockets/socket-module',
            '@nestjs/platform-express',
            'cache-manager',
            'class-validator',
            'class-transformer',
          ];

          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: tsconfig,
        },
      }),
      ...(isDev
        ? [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.WatchIgnorePlugin({ paths: [/\.js$/, /\.d\.ts$/] }),
            new RunScriptWebpackPlugin({ name: 'main.js', autoRestart: false }),
          ]
        : []),
    ],
    output: {
      path: path.join(rootDir, outDir),
      filename: '[name].js',
      sourceMapFilename: '[name].js.map',
      clean: true,
    },
  };
};
