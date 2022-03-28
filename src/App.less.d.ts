declare namespace AppLessNamespace {
	export interface IAppLess {
		App: string;
		'App-header': string;
		'App-link': string;
		'App-logo': string;
		'App-logo-spin': string;
	}
}

declare const AppLessModule: AppLessNamespace.IAppLess & {
	/** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
	locals: AppLessNamespace.IAppLess;
};

export = AppLessModule;
