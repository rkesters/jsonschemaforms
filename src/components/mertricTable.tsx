import MaterialTable, { Action, Column } from '@material-table/core';
import { isArray } from 'lodash';
import React, { useMemo } from 'react';
import invertoryCSS from './inventory.less';

export type MetricTableProps = {
	data: any[];
	isEditing: boolean;
	selection: Partial<any> | undefined;
	setSelection: React.Dispatch<React.SetStateAction<Partial<any> | undefined>>;
	onDeleteMetric: (metricToDelete: any) => void;
};


export function MetricTable({ data, isEditing, selection, setSelection, onDeleteMetric }: MetricTableProps): React.ReactElement {
	const headCells: Column<any>[] = useMemo(
		() => [
			{ field: 'metric.label', type: 'string', title: 'Metric' },
			{
				field: 'healthy',
				type: 'numeric',
				title: 'Healthy',
				render: (rowData) => {
					return `=`;
				},
			},
			{
				field: 'degraded',
				type: 'numeric',
				title: 'Degraded',
				render: (rowData) => (rowData.degraded ? `= ${rowData.degraded.value}` : ''),
			},
			{
				field: 'failed',
				type: 'numeric',
				title: 'Failed',
				render: (rowData) => ` =  ${rowData.failed.value}`,
			},
		],
		[],
	);

	const actions: Action<any>[] = [
		{
			disabled: !isEditing,
			icon: 'delete',
			isFreeAction: false,
			position: 'row',
			tooltip: 'Delete Metric',
			onClick: (_event: MouseEvent, dataIn: any | any[]) => {
				const toDelete = isArray(dataIn) ? dataIn[0] : dataIn;
				setSelection(undefined);
				onDeleteMetric(toDelete);
			},
			hidden: false,
		},
	];

	return (
		<div className={invertoryCSS.metricTable}>
			<MaterialTable
				columns={headCells}
				data={data}
				actions={actions}
				onRowClick={(event, rowData?: any) => {
					// if the rowData.tableDate.id could be used on condidtional render
					if (!rowData) {
						return;
					}
					setSelection(rowData);
				}}
				options={{
					padding: 'dense',
					paging: data?.length > 5,
					pageSizeOptions: [5],
					showTitle: false,
					search: false,
					toolbar: false,
					rowStyle: (rowData) => {
						const isSelected = selection?.id === rowData.id;
						return {
							backgroundColor: isSelected ? 'rgb(133,15,136,0.5)' : '#fff',
						};
					},
				}}
				components={{
					// eslint-disable-next-line react/display-name, @typescript-eslint/naming-convention
					Container: (props: any) => <div style={{ borderColor: 'white' }}>{props.children}</div>,
				}}
			/>
		</div>
	);
}
