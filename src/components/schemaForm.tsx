import { withTheme } from '@rjsf/core';
import { Theme5 as Mui5Theme } from '@rjsf/material-ui';

// Make modifications to the theme with your own fields and widgets

const Form = withTheme(Mui5Theme);
import network from '../schema/network.json';
import { JSONSchema7 } from 'json-schema';
import { useState } from 'react';

const Network: JSONSchema7 = network as JSONSchema7;
console.dir(Network);

export function SchemaForm(): JSX.Element {
	const [formData, setFormData] = useState({});
	return (
		<div style={{ width: '50%' }}>
			<Form
				schema={Network}
				formData={formData}
				onChange={({ formData }) => setFormData(formData)}
			></Form>
		</div>
	);
}
