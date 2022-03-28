import MaterialTable, { Action, Column } from '@material-table/core';
import { has, map, isBoolean, noop } from 'lodash';
import React, { useMemo, useState } from 'react';
import {
	JSONSchema7,
	JSONSchema7Definition,
	JSONSchema7TypeName,
} from 'json-schema';
import { ArrayFieldTemplateProps, IChangeEvent } from '@rjsf/core';
import { get as getByPointer } from 'pointer-props';
import { Add, Save, Close, Delete } from '@mui/icons-material';
import * as css from './inventory.less';

export type MetricTableProps = {
	data: any[];
	isEditing: boolean;
	selection: Partial<any> | undefined;
	setSelection: React.Dispatch<React.SetStateAction<Partial<any> | undefined>>;
	onDeleteMetric: (metricToDelete: any) => void;
	schema: JSONSchema7;
};

function hasRef(value: unknown): value is { $ref: string } {
	return has(value, '$ref');
}

const typeMapping: Record<JSONSchema7TypeName, Column<any>['type']> = {
	string: 'string',
	number: 'numeric',
	integer: 'numeric',
	boolean: 'boolean',
	object: 'string',
	array: 'string',
	null: 'string',
};
function getDefiniton(
	items: JSONSchema7Definition[] | JSONSchema7Definition | undefined,
	registry: any,
): JSONSchema7 {
	return hasRef(items) ? getByPointer(registry.rootSchema, items.$ref) : items;
}

export function MetricTable({
	idSchema,
	formData,
	schema,
	readonly,
	disabled,
	registry,
	...rest
}: ArrayFieldTemplateProps<any[]>): React.ReactElement {
	const data: any[] = formData;
	//const id = idSchema.$id;
	const ref = hasRef(schema.items) ? schema.items.$ref : null;
	const sub: JSONSchema7 = ref
		? getByPointer(registry.rootSchema, ref)
		: schema.items;
	const Widget = registry.fields['SchemaField'];

	const [adding, setAdding] = useState(false);

	const header: Column<any>[] = useMemo((): Column<any>[] => {
		const f: () => Column<any>[] = () => {
			switch (sub.type) {
				case 'object':
					return map<Record<string, JSONSchema7>, Column<any> | undefined>(
						sub.properties as Record<string, JSONSchema7>,
						(prop: JSONSchema7, key) => {
							if (isBoolean(prop)) {
								return;
							}
							switch (prop.type) {
								case 'array':
									return {
										field: key,
										type: 'string',
										title: prop.title ?? key,
										render: (data: any, _type: 'row' | 'group') => {
											const def = getDefiniton(prop.items, registry);
											switch (def.type) {
												case 'array':
													console.error('Array of Array not supported');
													return 'Error';
													break;
												case 'object':
													map(data, (value, key) => {
														return `(${key}, ${value})`;
													}).join(',');
													break;
												case 'null':
													return 'Null Type';
													break;
												default:
													return data;
											}
										},
									};
									break;
								case 'string':
								case 'number':
								case 'integer':
									return {
										field: key,
										type: typeMapping[prop.type],
										title: prop.title ?? key,
									};
							}
						},
					).filter((k): k is Column<any> => {
						return !!k;
					});
				default:
					console.error(`Unknown type ${sub.type}`);
					return [];
			}
		};
		return (f() ?? []).filter((k): k is Column<any> => {
			return !!k;
		});
	}, [sub]);

	const actions: Action<any>[] = [
		{
			disabled: readonly || disabled,
			icon: Delete,
			isFreeAction: false,
			position: 'row',
			tooltip: 'Delete Metric',
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			onClick: (_event: MouseEvent, _dataIn: any | any[]) => {},
			hidden: false,
		},
		{
			disabled: false,
			position: 'toolbar',
			icon: Add,
			isFreeAction: true,
			tooltip: 'Add',
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			onClick: (_event: MouseEvent, _dataIn: any | any[]) => {
				setAdding(true);
			},
			hidden: false,
		},
	];
	const [fields, setFields] = useState({});
	const onSave = () => {
		data.push(fields);
		setFields({});
		setAdding(false);
	};
	const onClose = () => {
		setAdding(false);
	};

	return (
		<div>
			<MaterialTable
				columns={header}
				data={data}
				actions={actions}
				onRowClick={(event, rowData?: any) => {
					// if the rowData.tableDate.id could be used on condidtional render
					if (!rowData) {
						return;
					}
					//setSelection(rowData);
				}}
				options={{
					padding: 'dense',
					paging: data?.length > 5,
					pageSizeOptions: [5],
					showTitle: false,
					search: false,
					toolbar: true,
					rowStyle: _rowData => {
						const isSelected = false; //selection?.id === rowData.id;
						return {
							backgroundColor: isSelected ? 'rgb(133,15,136,0.5)' : '#fff',
						};
					},
				}}
				components={{
					// eslint-disable-next-line react/display-name, @typescript-eslint/naming-convention
					Container: (props: any) => (
						<div style={{ borderColor: 'white' }}>{props.children}</div>
					),
				}}
			/>
			<div id={css.tableForm} className={css.editable}>
				<div className={adding ? css.add : ''}>
					<div>
						<Save onClick={onSave}> </Save>
						<Close onClick={onClose}></Close>
					</div>
					<Widget
						idSchema={idSchema}
						schema={sub}
						uiSchema={{ ...rest.uiSchema, classNames: undefined }}
						disabled={disabled}
						readonly={readonly}
						hideError={false}
						autofocus={true}
						errorSchema={{}}
						formContext={null}
						rawErrors={{}}
						formData={fields}
						onChange={(data: any) => {
							console.log(`'onChnage' ${JSON.stringify(data, null, 2)}`);
							setFields(data);
						}}
						onBlur={noop}
						onFocus={noop}
						required={false}
						registry={registry}
						name={rest.title}
						title={''}
					>
						<React.Fragment> </React.Fragment>
					</Widget>
				</div>
			</div>
		</div>
	);
}
