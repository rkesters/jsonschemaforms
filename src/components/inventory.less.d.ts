declare namespace InventoryLessNamespace {
	export interface IInventoryLess {
		add: string;
		editable: string;
		fiftyWidth: string;
		form: string;
		formElement: string;
		formGroup: string;
		metricTable: string;
		tableForm: string;
	}
}

declare const InventoryLessModule: InventoryLessNamespace.IInventoryLess & {
	/** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
	locals: InventoryLessNamespace.IInventoryLess;
};

export = InventoryLessModule;
