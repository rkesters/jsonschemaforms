import { IChangeEvent, withTheme } from '@rjsf/core';
import { Theme5 as Mui5Theme } from '@rjsf/material-ui';

// Make modifications to the theme with your own fields and widgets

const Form = withTheme(Mui5Theme);
import network from '../schema/network.json';
import { JSONSchema7 } from 'json-schema';
import { useState } from 'react';
import * as patch from 'fast-json-patch';
import { diff } from 'jsondiffpatch';
import { MetricTable } from './mertricTable';

const Network: JSONSchema7 = network as JSONSchema7;
console.dir(Network);

function patchSchema(schema: JSONSchema7, data: any) {
	return patch.applyPatch(data, []).newDocument;
}

export function SchemaForm(): JSX.Element {
	const [data, setFormData] = useState({});
	const onChange = (event: IChangeEvent<any>) => {
		const delta = diff(data, event.formData);
		console.dir(delta);
		patchSchema(event.schema, event.formData);
		setFormData(event.formData);
	};


	return (
		<div style={{ width: '50%' }}>
			<Form
				ArrayFieldTemplate={MetricTable}
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
