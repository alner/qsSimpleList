var webpack = require('webpack');
//var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
//var CopyWebpackPlugin = require('copy-webpack-plugin');
//var proxy = require('http-proxy-middleware');
var path = require('path');
var serverConfig = require('./server.config.json');

var name = path.basename(__dirname);
var outputFilename = name + '.js';
var devServerHost = serverConfig.devServerHost || "http://localhost";
var devServerPort = parseInt(serverConfig.devServerPort, 10) || 8080;

// default configuration
var config = {
  entry: {
    js: [
      //"webpack-dev-server/client?http://localhost:" + devServerPort,
      //"webpack/hot/only-dev-server",
      "./src/component.js" // input file
    ]
  },
  output: {
    path: path.resolve(serverConfig.buildFolder),
    filename: outputFilename, // output file
//    publicPath: 'http://localhost:8080/sense'
  },
  externals: {
		//"react": "React",
    //"react-dom": "ReactDOM",
    "js/qlik": "Qlik"
	},
  plugins: [
    //new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules']
  },
  module: {
    noParse: ["react", "react.min", "react-dom", "react-dom.min", "js/qlik"],
    loaders: [
      {
        test: /\.jsx?$/,
        //exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        loaders: ['babel']
      },
      {
        test:  /\.css$/,
        loader: "style-loader!css-loader"
      }
    ]
  }
};

if(process.env.NODE_ENV !== 'production') {
  console.log('DEVELOPMENT configuration');
  config.devtool = 'inline-source-map'; //'#eval-source-map';
    //config.devtool = 'source-map';
  config.debug = true;
  config.output.path = path.resolve(serverConfig.deployFolder);
//  config.entry.js.unshift("webpack/hot/dev-server");
  config.entry.js.unshift("webpack-dev-server/client?http://localhost:" + devServerPort + "/", "webpack/hot/dev-server");
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  /*
  config.plugins.push(new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:devServerPort/ during development
        host: 'localhost',
        port: devServerPort+1,
        // proxy the Webpack Dev Server endpoint
        // (which should be serving on http://localhost:3100/)
        // through BrowserSync
        proxy: {
          // middleware: [proxy({
          //   target: serverConfig.url,
          //   ws: true
          // })],
          target: serverConfig.url,
          // //devServerHost + ':' + devServerPort,
          ws: true
        }
      },
      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: true
      }
    ));
	*/
} else {
  console.log('PRODUCTION configuration');
  config.plugins.push(new webpack.DefinePlugin({
    'process.env': {NODE_ENV: JSON.stringify('production')}
  }));
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    // Compression specific options
    compress: {
      warnings: false,
      // Drop `console` statements
      drop_console: true
    },
    output: {
      comments: false,
    },
  }));
  config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
  // config.plugins.push(new CopyWebpackPlugin([{
  //   from: 'build',
  //   to: path.resolve(serverConfig.deployFolder)
  // }]));
}

module.exports = config;
