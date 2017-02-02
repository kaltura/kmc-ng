/**
 * @author: @AngularClass
 */

const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
const AssetsPlugin = require('assets-webpack-plugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ngcWebpack = require('ngc-webpack');

// KMCng - adjustments
const appScriptsFolders = [helpers.root('src/app'),helpers.root('src/applications'),helpers.root('src/shared')];
// KMCng - end of adjustments

/*
 * Webpack Constants
 */
const HMR = helpers.hasProcessFlag('hot');
const AOT = helpers.hasNpmFlag('aot');

// KMCng - adjustments
const METADATA = {
  title: 'Kaltura - Open Source Video Platform',
  baseUrl: '/',
  isDevServer: helpers.isWebpackDevServer()
};
// KMCng - end of adjustments

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (options) {
	isProd = options.env === 'production';
	return {

		/*
		 * Cache generated modules and chunks to improve performance for multiple incremental builds.
		 * This is enabled by default in watch mode.
		 * You can pass false to disable it.
		 *
		 * See: http://webpack.github.io/docs/configuration.html#cache
		 */
		//cache: false,

		/*
		 * The entry point for the bundle
		 * Our Angular.js app
		 *
		 * See: http://webpack.github.io/docs/configuration.html#entry
		 */

		// KMCng - adjustments
		entry: {
			'polyfills': './src/polyfills.ts',
			'theme': './src/theme.ts',
			'vendors': './src/vendors.ts',
			'kaltura': './src/kaltura-vendor.ts',
			'app': './src/main.ts' // our angular app
		},
		// KMCng - end of adjustments

		/*
		 * Options affecting the resolving of modules.
		 *
		 * See: http://webpack.github.io/docs/configuration.html#resolve
		 */
		resolve: {

			/*
			 * An array of extensions that should be used to resolve modules.
			 *
			 * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
			 */
			extensions: ['.ts', '.js', '.json'],

			// KMCng - adjustments
			// An array of directory names to be resolved to the current directory
			modules: [helpers.root('src/shared'), helpers.root('node_modules')],
			// KMCng - end of adjustments
		},

		/*
		 * Options affecting the normal modules.
		 *
		 * See: http://webpack.github.io/docs/configuration.html#module
		 */
		module: {

			rules: [

				/*
				 * Typescript loader support for .ts
				 *
				 * Component Template/Style integration using `angular2-template-loader`
				 * Angular 2 lazy loading (async routes) via `ng-router-loader`
				 *
				 * `ng-router-loader` expects vanilla JavaScript code, not TypeScript code. This is why the
				 * order of the loader matter.
				 *
				 * See: https://github.com/s-panferov/awesome-typescript-loader
				 * See: https://github.com/TheLarkInn/angular2-template-loader
				 * See: https://github.com/shlomiassaf/ng-router-loader
				 */
				{
					test: /\.ts$/,
					use: [
						{
							loader: '@angularclass/hmr-loader',
							options: {
								pretty: !isProd,
								prod: isProd
							}
						},
						{ // MAKE SURE TO CHAIN VANILLA JS CODE, I.E. TS COMPILATION OUTPUT.
							loader: 'ng-router-loader',
							options: {
								loader: 'async-import',
								genDir: 'compiled',
								aot: AOT
							}
						},
						{
							loader: 'awesome-typescript-loader',
							options: {
								configFileName: 'tsconfig.webpack.json'
							}
						},
						{
							loader: 'angular2-template-loader'
						}
					],
					exclude: [/\.(spec|e2e)\.ts$/]
				},

				/*
				 * Json loader support for *.json files.
				 *
				 * See: https://github.com/webpack/json-loader
				 */
				{
					test: /\.json$/,
					use: 'json-loader'
				},

				// KMCng - adjustments
				/*
				 * to string and css loader support for *.css files (from Angular components)
				 * Returns file content as string
				 *
				 */
				{
					test: /\.css$/,
					use: ['to-string-loader', 'css-loader'],
					include: [helpers.root('node_modules')]
				},
				// KMCng - end of adjustments

				// KMCng - adjustments
				/*
				 * to string and sass loader support for *.scss files (from Angular components)
				 * Returns compiled css content as string
				 *
				 */
				{
					test: /\.scss$/,
					use: ['to-string-loader', 'css-loader', 'sass-loader'],
					include: appScriptsFolders
				},

				// KMCng - end of adjustments

				// KMCng - adjustments
				/* Raw loader support for *.html
				 * Returns file content as string
				 *
				 * See: https://github.com/webpack/raw-loader
				 */
				{
					test: /\.html$/,
					use: 'raw-loader'
				},

				// KMCng - end of adjustments

				// KMCng - adjustments
				// copy those assets to output
				{
					test: /\.(png|jpe?g|gif|svg|ico)$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: 'assets/[name].[hash].[ext]'
							}
						}
					]
				},
				// load fonts
				{
					test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: 'url-loader',
							options: {
								name: 'fonts/[name].[hash].[ext]',
								limit : '10000',
								mimetype : 'application/font-woff'
							}
						}
					]
				},
				{
					test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: 'url-loader',
							options: {
								name: 'fonts/[name].[hash].[ext]',
								limit : '10000',
								mimetype : 'application/octet-stream'
							}
						}
					]
				},
				{test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: 'fonts/[name].[hash].[ext]'
							}
						}
					]},
				{
					test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: 'url-loader',
							options: {
								name: 'assets/[name].[hash].[ext]',
								limit : '10000',
								mimetype : 'image/svg+xml'
							}
						}
					]
				}
				// KMCng - end of adjustments
			]
		},

		/*
		 * Add additional plugins to the compiler.
		 *
		 * See: http://webpack.github.io/docs/configuration.html#plugins
		 */
		plugins: [
			new AssetsPlugin({
				path: helpers.root('dist'),
				filename: 'webpack-assets.json',
				prettyPrint: true
			}),

			/*
			 * Plugin: ForkCheckerPlugin
			 * Description: Do type checking in a separate process, so webpack don't need to wait.
			 *
			 * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
			 */
			new CheckerPlugin(),
			/*
			 * Plugin: CommonsChunkPlugin
			 * Description: Shares common code between the pages.
			 * It identifies common modules and put them into a commons chunk.
			 *
			 * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
			 * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
			 */
			new CommonsChunkPlugin({
				name: 'polyfills',
				chunks: ['polyfills']
			}),
			// This enables tree shaking of the vendor modules
			new CommonsChunkPlugin({
					name: 'vendor',
					chunks: ['main'],
					minChunks: module => /node_modules/.test(module.resource)
	}),
	// Specify the correct order the scripts will be injected in
	// KMCng - adjustments
	new CommonsChunkPlugin({
		name: ['polyfills', 'vendors', 'kaltura', 'theme'].reverse()
	}),
		// KMCng - end of adjustments

		/**
		 * Plugin: ContextReplacementPlugin
		 * Description: Provides context to Angular's use of System.import
		 *
		 * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
		 * See: https://github.com/angular/angular/issues/11580
		 */
		new ContextReplacementPlugin(
			// The (\\|\/) piece accounts for path separators in *nix and Windows
			/angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
			helpers.root('src'), // location of your src
			{
				// your Angular Async Route paths relative to this root directory
			}
		),

		// KMCng - adjustments
		/*
		 * Plugin: CopyWebpackPlugin
		 * Description: Copy files and directories in webpack.
		 *
		 * Copies project static assets.
		 *
		 * See: https://www.npmjs.com/package/copy-webpack-plugin
		 */
		new CopyWebpackPlugin(
			[ 
				{ 
					from: 'src/config', 
					to: 'config' 
				}, 
				{ 
					from: 'src/i18n', 
					to: 'i18n' 
				}, 
				{ 
					from: 'src/favicon.ico', 
					to: '' 
				} ]),
		// KMCng - end of adjustments

		/*
		 * Plugin: HtmlWebpackPlugin
		 * Description: Simplifies creation of HTML files to serve your webpack bundles.
		 * This is especially useful for webpack bundles that include a hash in the filename
		 * which changes every compilation.
		 *
		 * See: https://github.com/ampedandwired/html-webpack-plugin
		 */
		// KMCng - adjustments
		new HtmlWebpackPlugin({
			template: 'src/index.ejs',
			title: METADATA.title,
			chunksSortMode: 'dependency',
			metadata: METADATA,
			inject: 'head'
		}),
		// KMCng - end of adjustments



		/*
		 * Plugin: ScriptExtHtmlWebpackPlugin
		 * Description: Enhances html-webpack-plugin functionality
		 * with different deployment options for your scripts including:
		 *
		 * See: https://github.com/numical/script-ext-html-webpack-plugin
		 */
		new ScriptExtHtmlWebpackPlugin({
			defaultAttribute: 'defer'
		}),

		/*
		 * Plugin: HtmlElementsPlugin
		 * Description: Generate html tags based on javascript maps.
		 *
		 * If a publicPath is set in the webpack output configuration, it will be automatically added to
		 * href attributes, you can disable that by adding a "=href": false property.
		 * You can also enable it to other attribute by settings "=attName": true.
		 *
		 * The configuration supplied is map between a location (key) and an element definition object (value)
		 * The location (key) is then exported to the template under then htmlElements property in webpack configuration.
		 *
		 * Example:
		 *  Adding this plugin configuration
		 *  new HtmlElementsPlugin({
		 *    headTags: { ... }
		 *  })
		 *
		 *  Means we can use it in the template like this:
		 *  <%= webpackConfig.htmlElements.headTags %>
		 *
		 * Dependencies: HtmlWebpackPlugin
		 */
		new HtmlElementsPlugin({
			headTags: require('./head-config.common')
		}),

		/**
		 * Plugin LoaderOptionsPlugin (experimental)
		 *
		 * See: https://gist.github.com/sokra/27b24881210b56bbaff7
		 */
		new LoaderOptionsPlugin({}),

		// Fix Angular 2
		new NormalModuleReplacementPlugin(
			/facade(\\|\/)async/,
			helpers.root('node_modules/@angular/core/src/facade/async.js')
		),
		new NormalModuleReplacementPlugin(
			/facade(\\|\/)collection/,
			helpers.root('node_modules/@angular/core/src/facade/collection.js')
		),
		new NormalModuleReplacementPlugin(
			/facade(\\|\/)errors/,
			helpers.root('node_modules/@angular/core/src/facade/errors.js')
		),
		new NormalModuleReplacementPlugin(
			/facade(\\|\/)lang/,
			helpers.root('node_modules/@angular/core/src/facade/lang.js')
		),
		new NormalModuleReplacementPlugin(
			/facade(\\|\/)math/,
			helpers.root('node_modules/@angular/core/src/facade/math.js')
		),

		new ngcWebpack.NgcWebpackPlugin({
			disabled: !AOT,
			tsConfig: helpers.root('tsconfig.webpack.json'),
			resourceOverride: helpers.root('config/resource-override.js')
		})

	],

	/*
	 * Include polyfills or mocks for various node stuff
	 * Description: Node configuration
	 *
	 * See: https://webpack.github.io/docs/configuration.html#node
	 */
	node: {
		global: true,
			crypto
	:
		'empty',
			process
	:
		true,
			module
	:
		false,
			clearImmediate
	:
		false,
			setImmediate
	:
		false
	}

}
	;
}
