var webpack = require('webpack');
var path = require('path');
var serverConfig = require('./server.config.json');

var name = path.basename(__dirname);
var outputFilename = name + '.js';
var devServerPort = serverConfig.serverPort || 8080;

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
    path: path.resolve(__dirname, serverConfig.buildFolder),
    filename: outputFilename // output file
  },
  externals: {
		"react": "React",
    "react-dom": "ReactDOM",
    "js/qlik": "Qlik"
	},
  plugins: [
    //new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    modulesDirectories: ['node_modules']
  },
  module: {
    noParse: ["react", "react.min", "react-dom", "react-dom.min", "js/qlik"],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
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
    //config.debug = true;
  // config.js.unshift("webpack/hot/only-dev-server");
    config.entry.js.unshift("webpack-dev-server/client?http://localhost:" + devServerPort);
    //config.plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
  console.log('PRODUCTION configuration');
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
  config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
}

module.exports = config;
