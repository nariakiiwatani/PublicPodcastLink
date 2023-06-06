import { Box, Tabs, Tab } from '@mui/material'
import { useState } from 'react'

type TabPanelProps = {
	defaultValue?: number,
	labels: React.ReactNode[],
	children: React.ReactNode|React.ReactNode[]
}
export const TabPanel = ({ defaultValue, labels, children }: TabPanelProps) => {
	const [value, setValue] = useState(defaultValue??0)
	const handleChange = (_e: React.SyntheticEvent, value: number) => {
		setValue(value)
	}
	return (<>
		<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
			<Tabs value={value} onChange={handleChange}>
				{labels.map((label, i) => <Tab key={i} label={label} />)}
			</Tabs>
		</Box>
		<Box sx={{margin: 2}}>
			{Array.isArray(children) ? children.length > value && children[value] : children}
		</Box>
	</>)
}
