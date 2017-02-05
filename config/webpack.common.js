
const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlElementsPlugin = require('./html-elements-plugin');

const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

const appScriptsFolders = [helpers.root('src/app'),helpers.root('src/applications'),helpers.root('src/shared')];

/*
 * Webpack Constants
 */
const METADATA = {
	title: 'Kaltura - Open Source Video Platform',
	baseUrl: '/',
	isDevServer: helpers.isWebpackDevServer()
};

module.exports =  function (options) {

	return {
		entry: {
			'polyfills': './src/polyfills.ts',
			'theme': './src/theme.ts',
			'vendors': './src/vendors.ts',
			'kaltura': './src/kaltura-vendor.ts',
			'app': './src/main.ts' // our angular app
		},

		resolve: {
			extensions: ['.ts', '.js', '.json'],
			modules: [
				helpers.root('src', 'shared'),
				helpers.root('node_modules')
			]
		},

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
							loader: 'awesome-typescript-loader'
						},
						'angular2-template-loader'
					],
					exclude: [/\.(spec|e2e)\.ts$/]
				},

				/*
				 * to string and css loader support for *.css files (from Angular components)
				 * Returns file content as string
				 *
				 */
				{
					test: /\.css$/,
					use: ['to-string-loader', 'css-loader'],
					exclude: [
						helpers.root('src', 'styles')
					]
				},

				/*
				 * to string and sass loader support for *.scss files (from Angular components)
				 * Returns compiled css content as string
				 *
				 */
				{
					test: /\.scss$/,
					use: ['to-string-loader', 'css-loader','resolve-url-loader',
						{
							loader : 'sass-loader',
							options : {
								sourceMap : true
							}
						}],
					exclude: [
						helpers.root('src', 'styles')
					]
				},

				/* Raw loader support for *.html
				 * Returns file content as string
				 *
				 * See: https://github.com/webpack/raw-loader
				 */
				{
					test: /\.html$/,
					loader: 'raw-loader'
				},


				/* File loader for supporting images, for example, in CSS files.
				 */
				{
					test: /\.(png|jpe?g|gif|svg|ico)$/,
					loader: 'file-loader'
				},

				{
					test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
					loader: 'url-loader',
					options: {
						name: 'fonts/[name].[hash].[ext]',
						mimetype: 'application/font-woff'
					}
				},
				{
					test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
					loader: 'url-loader',
					options: {
						name: 'fonts/[name].[hash].[ext]',
						mimetype: 'application/octet-stream'
					}
				},
				{
					test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
					loader: 'url-loader',
					options: {
						name: 'fonts/[name].[hash].[ext]'
					}
				},
				{
					test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
					loader: 'url-loader',
					options: {
						name: 'assets/[name].[hash].[ext]',
						mimetype: 'application/image/svg+xml'
					}
				}
			]
		},
		plugins: [
			/*
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
				name: ['polyfills', 'vendors', 'kaltura', 'theme'].reverse()
			}),

			/*
			 * Plugin: CopyWebpackPlugin
			 * Description: Copy files and directories in webpack.
			 *
			 * Copies project static assets.
			 *
			 * See: https://www.npmjs.com/package/copy-webpack-plugin
			 */
			new CopyWebpackPlugin([
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
				}
			]),


			/*
			 * Plugin: HtmlWebpackPlugin
			 * Description: Simplifies creation of HTML files to serve your webpack bundles.
			 * This is especially useful for webpack bundles that include a hash in the filename
			 * which changes every compilation.
			 *
			 * See: https://github.com/ampedandwired/html-webpack-plugin
			 */
			new HtmlWebpackPlugin({
				template: 'src/index.ejs',
				title: METADATA.title,
				chunksSortMode: 'dependency',
				metadata: METADATA,
				inject: 'head'
			}),

			/*
			 * Plugin: HtmlElementsPlugin
			 * Description: Generate html tags based on javascript maps.
			 *
			 * Dependencies: HtmlWebpackPlugin
			 */
			new HtmlElementsPlugin({
				headTags: require('./head-config.common')
			}),

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
			process: true,
			module: false,
			clearImmediate: false,
			setImmediate: false
		}
	}
};
