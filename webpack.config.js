const webpack = require('webpack');
const path = require('path');

let dev = process.NODE_ENV == 'development';

const devflowClass = require('devflow');
let devflow = new devflowClass();

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = devflow.webpackConfig({
	
	entry:{
		'app':['./index.js'],
	},
	
	resolve: {
		alias: {
			'app':path.resolve('./app-client'),
		},
	},
	
	plugins: [
		 //new CopyWebpackPlugin([
            //{
				//from: '../app-client/img',
				//to: '../dist-client/img',
			//},
        //], {
            //ignore: [
                
            //],
            //copyUnmodified: false
        //})
    ],
	
    module: {
		rules: [
			
			//expose globals
			/*
			{
				test: require.resolve('tether'),
				loader: "expose-loader",
				options: 'Tether'
			},
			*/
			
		],
    },
    externals: {
       
    },
    devtool: 'source-map',
    //devtool: 'eval-source-map',
},{
	shimDependencies: {
		
	},
	debugConfig: false,
	writeDistRevision: true,
	//exposeJquery: true,
	livereload: false,
	disableAMD: [
		
	]
});
