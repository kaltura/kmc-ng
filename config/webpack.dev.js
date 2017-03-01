const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev
const packageJson = require('../package.json');

/**
 * Webpack Plugins
 */
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');


/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(commonConfig({env: ENV}).metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: HMR
});

module.exports = function (options) {
  const webpackConfig = webpackMerge(commonConfig({env: ENV}), {

    /**
     * Developer tool to enhance debugging
     *
     */
    devtool: 'inline-source-map', //'cheap-module-source-map',

    output: {
      path: helpers.root('dist'),
      filename: 'js/[name].bundle.js',
      sourceMapFilename: 'js/[name].map',
      chunkFilename: 'js/[id].chunk.js'
    },

    module: {
      rules: [
		// TODO [kmcng] comment this rule
	      {
	      	test : /.*/,
		      include : helpers.root('node_modules/@kaltura-ng2')
	      },
        /*
         * css loader support for *.css files (styles directory only)
         * Loads external css styles into the DOM, supports HMR
         *
         */
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
	        include: [
	        	helpers.root('src/shared/kmcng-theme'),
	            helpers.root('node_modules')
            ]
        },


        /*
         * sass loader support for *.scss files (styles directory only)
         * Loads external sass styles into the DOM, supports HMR
         *
         */
	      {
		      test: /\.scss$/,
		      use: [
		      	'style-loader',
			     'css-loader',
			     'resolve-url-loader',
			      {
			      	loader : 'sass-loader',
				      options : {
					      sourceMap : true
				      }
			      }],
		      include: [
			      helpers.root('src/shared/kmcng-theme'),
			      helpers.root('node_modules')
		      ]
	      }
      ]
    },

    plugins: [
      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
      new DefinePlugin({
      	'__KMCng__' :
	        {
		        version : JSON.stringify(packageJson.version)
	        },
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env': {
          'ENV': JSON.stringify(METADATA.ENV),
          'NODE_ENV': JSON.stringify(METADATA.ENV),
          'HMR': METADATA.HMR
        }
      }),

      /**
       * Plugin: NamedModulesPlugin (experimental)
       * Description: Uses file names as module name.
       *
       * See: https://github.com/webpack/webpack/commit/a04ffb928365b19feb75087c63f13cadfc08e1eb
       */
       new NamedModulesPlugin()
    ],

    /**
     * Webpack Development Server configuration
     * Description: The webpack-dev-server is a little node.js Express server.
     * The server emits information about the compilation state to the client,
     * which reacts to those events.
     *
     * See: https://webpack.github.io/docs/webpack-dev-server.html
     */
    devServer: {
      port: METADATA.port,
      host: METADATA.host,
      historyApiFallback: true,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      }
    },

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

  });

	webpackConfig.plugins.push(
		/**
		 * Plugin LoaderOptionsPlugin (experimental)
		 *
		 * See: https://gist.github.com/sokra/27b24881210b56bbaff7
		 */
		new LoaderOptionsPlugin({
			debug: true,
			context : webpackConfig.context, // when using 'LoaderOptionsPlugin we must explicitly specify context otherwise some loaders will fail to work like sass-loader
			output: webpackConfig.output
		})
	);

  return webpackConfig;
}
