import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import minifiPlugin from 'terser-webpack-plugin';
import * as webpack from 'webpack';

const config  = {
	stats: 'minimal',
	entry: './src/index.tsx',
	devtool: process.env.WEBPACK_MODE === 'production' ? 'source-map' : 'cheap-module-source-map',
	mode: (process.env.WEBPACK_MODE) || 'development',
	optimization: {
		splitChunks: {
			name: 'vendor',
			chunks: 'all',
		},
		usedExports: true,
		minimizer: [
			new minifiPlugin({
				parallel: true,
				terserOptions: {
					ecma: 2015 ,
					sourceMap: { content: 'inline' },
				},
			}),
		],
		minimize: process.env.WEBPACK_MODE === 'production',
	},
	devServer: {
		historyApiFallback: true,
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					{ loader: 'style-loader', options: { esModule: false } },
					{
						loader: 'css-loader',
						options: { modules: false },
					},
				],
			},
			{
				test: /\.less$/i,
				use: [
					{ loader: 'style-loader', options: { esModule: false } },
					{
						loader: '@teamsupercell/typings-for-css-modules-loader',
					},
					{
						loader: 'css-loader',
						options: { modules: true },
					},
					'less-loader',
				],
			},
			{
				test: /\.tsx?$/,
				use: {
					loader: 'ts-loader',
					options: {
						projectReferences: true,
					},
				},
				exclude: /node_modules/,
			},
			{
				test: /\.(woff|woff2|eot|ttf|svg|png|jpg|jpeg|gif)$/,
				type: 'asset/resource',
			},
			{
				test: /\.js$/,
				// exclude some modules that cause warnings because of missing sourcemaps
				exclude: /(rrule|react-double-scrollbar)/,
				enforce: 'pre',
				use: ['source-map-loader'],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: {
			// Needed when library is linked via `npm link` to app
			'@mui/material': path.resolve('./node_modules/@mui/material'),
			'@mui/icons-material': path.resolve('./node_modules/@mui/icons-material'),
			react: path.resolve('./node_modules/react'),
			'react-hooks-sse': path.resolve('./node_modules/react-hooks-sse'),
			'react-pluggable': path.resolve('./node_modules/react-pluggable'),
		},
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		assetModuleFilename: 'assets/[name][ext][query]',
		clean: true,
	},
	// plugins: [
	// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 	new ProgressBarPlugin() ,
	// 	new HtmlWebpackPlugin({
	// 		// Also generate a test.html
	// 		template: 'src/index.html',
	// 		showErrors: true,
	// 	}),
	// 	new CopyWebpackPlugin({
	// 		patterns: [
	// 			{
	// 				from: path.resolve(__dirname, 'src/assets'),
	// 				to: 'assets',
	// 			},
	// 		],
	// 	}),
	// 	new webpack.WatchIgnorePlugin({ paths: [/less\.d\.ts$/] }),
	// 	new webpack.EnvironmentPlugin({ NODE_ENV: process.env.WEBPACK_MODE ?? 'development', DEBUG: false }),
	// ],
};

export default config;