import MaterialTable, { Action, Column } from '@material-table/core';
import { has, map, isBoolean, noop } from 'lodash';
import React, { useMemo, useState } from 'react';
import {
	JSONSchema7,
	JSONSchema7Definition,
	JSONSchema7TypeName,
} from 'json-schema';
import { withTheme, ArrayFieldTemplateProps, FieldProps } from '@rjsf/core';
import { get as getByPointer } from 'pointer-props';
import { Add, Save, Close, Delete } from '@mui/icons-material';
import * as css from './inventory.less';
import { Theme5 as Mui5Theme } from '@rjsf/material-ui';

const Form = withTheme(Mui5Theme);
export function ArrayField(props: FieldProps) {
	console.group('ArrayField');
	console.dir(props);
	console.groupEnd();
	return (
		<div id="af">
			<MetricTable
				onSaved={(data: any) => {
					props.onChange(data);
				}}
				idSchema={props.idSchema}
				formData={props.formData}
				formContext={props.formContext}
				schema={props.schema}
				readonly={props.readonly}
				disabled={props.disabled}
				registry={props.registry}
				uiSchema={props.uiSchema}
				title={props.title}
				id={props.name}
				key={props.name}
			></MetricTable>
		</div>
	);
}

export interface MetricTableProps
	extends Pick<
		ArrayFieldTemplateProps<any[]>,
		| 'uiSchema'
		| 'title'
		| 'idSchema'
		| 'formData'
		| 'schema'
		| 'readonly'
		| 'disabled'
		| 'registry'
		| 'formContext'
	> {
	id: string;
	onSaved: (data: any) => void;
}

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
	const props: JSONSchema7 = hasRef(items)
		? getByPointer(registry.rootSchema, items.$ref)
		: items;
	const out: JSONSchema7 = {
		...props,
	};
	if (has(props.properties, 'if')) {
		out.properties = {
			...out.properties,
			...((out.then as any) ?? {}),
			...((out.else as any) ?? {}),
		};
		delete out.properties?.if;
		delete out.properties?.then;
		delete out.properties?.else;
	}
	return out;
}

export function MetricTable({
	idSchema,
	formData,
	schema,
	readonly,
	disabled,
	registry,
	title,
	uiSchema,
	id,
	onSaved,
}: MetricTableProps): React.ReactElement {
	const data: any[] = formData ?? [];
	//const id = idSchema.$id;
	console.dir(registry);
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
						(props: JSONSchema7, key) => {
							if (isBoolean(props)) {
								return;
							}
							const prop = getDefiniton(props, registry);
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
	}, [sub, registry]);

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
		onSaved(data);
		setFields({});
		setAdding(false);
	};
	const onClose = () => {
		setAdding(false);
	};

	return (
		<div id={id}>
			<MaterialTable
				key="MTC"
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
					<Form
						liveValidate
						ArrayFieldTemplate={MetricTable}
						fields={{ ArrayField }}
						schema={{...sub, definitions: registry.rootSchema.definitions}}
						formData={fields}
						onChange={(value: any) => {
							console.dir(value);
						}}
						onBlur={(id: string, value: any) => {
							console.log(`${id} : ${value}`);
						}}
						registry={registry}
					>
						<React.Fragment> </React.Fragment>
					</Form>
				</div>
			</div>
		</div>
	);
}
