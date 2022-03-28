export = {
	webpack: {
		configure: (config: any) => {
			console.log(`webpack configure`)

			config.module.rules =[
				{
					test: /\.tsx?$/,
					use: {
						loader: 'ts-loader',
						options: {
							projectReferences: true,
						},
					},
					exclude: /node_modules/,
				}
			]
			config.module.rules.push({
				test: /\.mjs$/,
				include: /node_modules/,
				type: 'javascript/auto',
			});
			config.module.rules.push({
				test: /\.css$/i,
				use: [
					{ loader: 'style-loader', options: { esModule: false } },
					{
						loader: 'css-loader',
						options: { modules: false },
					},
				],
			})
			config.module.rules.push({
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
			});
			console.dir(config.module.rules);

			return config;
		},
	},
};
