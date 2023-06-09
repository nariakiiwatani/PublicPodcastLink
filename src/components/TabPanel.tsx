import { Box, Tabs, Tab } from '@mui/material'
import { useState, useMemo, useEffect } from 'react'

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
	useEffect(() => {
		if(value > labels.length-1) {
			setValue(0)
		}
	}, [value, labels])
	const safe_value = useMemo(() => Math.min(value, labels.length-1), [value, labels])
	return (<>
		<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
			<Tabs value={safe_value} onChange={handleChange}>
				{labels.map((label, i) => <Tab key={i} label={label} />)}
			</Tabs>
		</Box>
		<Box sx={{margin: 2}}>
			{Array.isArray(children) ? children.length > safe_value && children[safe_value] : children}
		</Box>
	</>)
}
