//@ts-check

'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
        patterns: [
            { from: 'src/installation_steps/build-setup/install_matter.sh', to: 'build-setup/install_matter.sh' },
            { from: 'src/installation_steps/build-setup/install_amp.sh', to: 'build-setup/install_amp.sh'},
            { from: 'src/installation_steps/build-setup/install_idf.sh', to: 'build-setup/install_idf.sh'},
            { from: 'src/installation_steps/pre-requisites/linux/ubuntu_prereqs.sh', to: 'pre-requisites/linux/ubuntu_prereqs.sh'},
            { from: 'src/installation_steps/pre-requisites/macos/mac_prereqs.sh', to: 'pre-requisites/macos/mac_prereqs.sh'},
            { from: 'src/pre_built_binaries/hello.sh', to: 'pre_built_binaries/hello.sh'},
        ],
    }),
  ],
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};
module.exports = [ extensionConfig ];