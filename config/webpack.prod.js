const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OptimizeJsPlugin = require('optimize-js-plugin');

/**
 * Webpack Constants
 */
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const METADATA = webpackMerge(commonConfig({
	env: ENV
}).metadata, {
	host: HOST,
	port: PORT,
	ENV: ENV,
	HMR: false
});

module.exports = function (env) {
	var webpackConfig = webpackMerge(commonConfig({
		env: ENV
	}), {

		devtool: 'source-map',

		output: {
			path: helpers.root('dist'),
			filename: 'js/[name].[chunkhash].bundle.js',
			sourceMapFilename: 'js/[name].[chunkhash].bundle.map',
			chunkFilename: 'js/[id].[chunkhash].chunk.js'
		},

		module: {
			rules: [

              /*
               * Extract CSS files from .src/styles directory to external CSS file
               */
				{
					test: /\.css$/,
					loader: ExtractTextPlugin.extract({
						fallbackLoader: 'style-loader',
						loader: 'css-loader'
					}),
					include: [
						helpers.root('node_modules')
					]
				},

              /*
               * Extract and compile SCSS files from .src/styles directory to external CSS file
               */
				{
					test: /\.scss$/,
					loader: ExtractTextPlugin.extract({
						fallbackLoader: 'style-loader',
						loader: 'css-loader!resolve-url-loader!sass-loader?sourceMap'
					}),
					include: [
						helpers.root('src','styles'),
						helpers.root('node_modules')
					]
				},

			]

		},

		plugins: [
			/**
			 * Plugin: ExtractTextPlugin
			 * Description: Extracts imported CSS files into external stylesheet
			 *
			 * See: https://github.com/webpack/extract-text-webpack-plugin
			 */
			new ExtractTextPlugin('[name].[contenthash].css'),

			/**
			 * Plugin: DefinePlugin
			 * Description: Define free variables.
			 * Useful for having development builds with debug logging or adding global constants.
			 *
			 * Environment helpers
			 *
			 * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
			 */
			// NOTE: when adding more properties make sure you include them in custom-typings.d.ts
			new DefinePlugin({
				'ENV': JSON.stringify(METADATA.ENV),
				'HMR': METADATA.HMR,
				'process.env': {
					'ENV': JSON.stringify(METADATA.ENV),
					'NODE_ENV': JSON.stringify(METADATA.ENV),
					'HMR': METADATA.HMR,
				}
			}),


			/**
			 * Plugin: UglifyJsPlugin
			 * Description: Minimize all JavaScript output of chunks.
			 * Loaders are switched into minimizing mode.
			 *
			 * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
			 */
			// NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
			new UglifyJsPlugin({
				// beautify: true, //debug
				// mangle: false, //debug
				// dead_code: false, //debug
				// unused: false, //debug
				// deadCode: false, //debug
				// compress: {
				//   screw_ie8: true,
				//   keep_fnames: true,
				//   drop_debugger: false,
				//   dead_code: false,
				//   unused: false
				// }, // debug
				//comments: true, //debug

				sourceMap: true,

				beautify: false, //prod
				output: {
					comments: false
				}, //prod
				mangle: {
					screw_ie8: true,
					keep_fnames: true// This is a must to support constructor.name with minified code
				}, //prod
				compress: {
					screw_ie8: true,
					warnings: false,
					conditionals: true,
					unused: true,
					comparisons: true,
					sequences: true,
					dead_code: true,
					evaluate: true,
					if_return: true,
					join_vars: true,
					negate_iife: false // we need this for lazy v8
				} // prod
			}),

			/**
			 * Plugin: NormalModuleReplacementPlugin
			 * Description: Replace resources that matches resourceRegExp with newResource
			 *
			 * See: http://webpack.github.io/docs/list-of-plugins.html#normalmodulereplacementplugin
			 */

			new NormalModuleReplacementPlugin(
				/angular2-hmr/,
				helpers.root('config/empty.js')
			)
		],

      /*
       * Include polyfills or mocks for various node stuff
       * Description: Node configuration
       *
       * See: https://webpack.github.io/docs/configuration.html#node
       */
		node: {
			global: true,
			crypto: 'empty',
			process: false,
			module: false,
			clearImmediate: false,
			setImmediate: false
		}

	});

	webpackConfig.plugins.push(
		/**
		 * Plugin LoaderOptionsPlugin (experimental)
		 *
		 * See: https://gist.github.com/sokra/27b24881210b56bbaff7
		 */
		new LoaderOptionsPlugin({
			minimize : true,
			debug: false,
			context : webpackConfig.context, // when using 'LoaderOptionsPlugin we must explicitly specify context otherwise some loaders will fail to work like sass-loader
			output: webpackConfig.output
			//options: {} // this is currently disabled since sass-loader fail to work once 'LoaderOptionsPlugin' explicitly set options - it has a PR for that - https://github.com/webpack-contrib/css-loader/pull/356
		})
	);

	return webpackConfig;
}
