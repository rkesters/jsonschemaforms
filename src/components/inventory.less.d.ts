declare namespace InventoryLessNamespace {
	export interface IInventoryLess {
		fiftyWidth: string;
		formElement: string;
		formGroup: string;
		metricTable: string;
		viewInventory: string;
		viewInventoryContainer: string;
	}
}

declare const InventoryLessModule: InventoryLessNamespace.IInventoryLess & {
	/** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
	locals: InventoryLessNamespace.IInventoryLess;
};

export = InventoryLessModule;
