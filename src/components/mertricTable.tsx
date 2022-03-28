import MaterialTable, { Action, Column } from '@material-table/core';
import { has, map, isBoolean, noop } from 'lodash';
import React, { useMemo, useState } from 'react';
import { JSONSchema7 } from 'json-schema';
import { ArrayFieldTemplateProps, IChangeEvent } from '@rjsf/core';
import { get as getByPointer } from 'pointer-props';
import { Add } from '@mui/icons-material';
import './inventory.less';

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
	console.dir(`idSchema ${JSON.stringify(idSchema, null, 2)}`);
	console.dir(`ref ${ref} -- sub ${JSON.stringify(sub, null, 2)}`);
	console.dir(
		`registry.rootSchema ${JSON.stringify(registry.rootSchema, null, 2)}`,
	);

	//console.dir(data);
	console.dir(rest);
	const header: Column<any>[] = useMemo((): Column<any>[] => {
		const f: () => Column<any>[] = () => {
			switch (sub.type) {
				case 'object':
					return map<any, Column<any> | undefined>(
						sub.properties,
						(prop: Column<any>, key) => {
							if (isBoolean(prop)) {
								return;
							}

							return { field: key, type: prop.type, title: prop.title ?? key };
						},
					).filter((k): k is Column<any> => {
						return !!k;
					});
				default:
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
			icon: 'delete',
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
			onClick: (_event: MouseEvent, _dataIn: any | any[]) => {},
			hidden: false,
		},
	];
	const [fields, setFields] = useState({});

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
			<div id="tableForm" className={'editable'}>
				<Widget
					className="form"
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
					onChange={(event: IChangeEvent) => {
						setFields(event.formData);
					}}
					onBlur={noop}
					onFocus={noop}
					required={false}
					registry={registry}
					name={rest.title}
					title={''}
				></Widget>
			</div>
		</div>
	);
}
