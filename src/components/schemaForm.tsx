import { IChangeEvent, withTheme } from '@rjsf/core';
import { Theme5 as Mui5Theme } from '@rjsf/material-ui';

// Make modifications to the theme with your own fields and widgets

const Form = withTheme(Mui5Theme);
import network from '../schema/network.json';
import { JSONSchema7 } from 'json-schema';
import { useState } from 'react';
import * as patch from 'fast-json-patch';
import { diff } from 'jsondiffpatch';
import { ArrayField, MetricTable } from './mertricTable';
import { set } from 'lodash';

const Network: JSONSchema7 = network as JSONSchema7;
console.dir(Network);

function patchSchema(schema: JSONSchema7, data: any) {
	return patch.applyPatch(data, []).newDocument;
}

function idSchemaToPath(idSchema: string): string[] {
	const parts = idSchema.split('_');
	return parts.splice(1);
}

export function SchemaForm(): JSX.Element {
	const [data, setFormData] = useState({});
	const onChange = (event: IChangeEvent<any>) => {
		const delta = diff(data, event.formData);
		console.dir(delta);
		patchSchema(event.schema, event.formData);
		setFormData(event.formData);
	};
	const setData = (d: any, idSchema: string, ...rest: any[]) => {
		const path = idSchemaToPath(idSchema);
		console.group('setData');
		console.dir(rest);
		console.dir(d);
		setFormData(set(data, path, d));
	};
	const idPrefix = 'root';
	return (
		<div style={{ width: '50%' }}>
			<Form
				idPrefix={idPrefix}
				formContext={{ setFormData: setData, idPrefix }}
				liveValidate
				ArrayFieldTemplate={MetricTable}
				fields={{ArrayField}}
				schema={Network}
				formData={data}
				onChange={onChange}
				onBlur={(id: string, value: any) => {
					console.log(`${id} : ${value}`);
				}}
			></Form>
		</div>
	);
}
