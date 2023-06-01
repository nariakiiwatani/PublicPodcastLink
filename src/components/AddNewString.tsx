import { TextFieldProps, Box, IconButton, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CancelIcon from '@mui/icons-material/Cancel'

type AddNewStringProps = {
	onAdd: (value: string) => Promise<boolean>
	textFieldProps?: TextFieldProps
}
export const AddNewString = ({onAdd, textFieldProps}:AddNewStringProps) => {
	const [value, setValue] = useState('')
	const [edit, setEdit] = useState(false)
	const text_field_ref = useRef<HTMLInputElement>(null)
	const handleEdit = () => {
		setEdit(true)
	}
	useEffect(() => {
		if(edit) {
			text_field_ref.current?.focus()
		}
	}, [edit])
	const handleCancel = () => {
		setEdit(false)
	}
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value)
	}
	const handleSubmit = (e: FormEvent<any>) => {
		e.preventDefault()
		onAdd(value)
		.then(success => {
			if(!success) return
			setValue('')
			setEdit(false)
		})
		.catch(console.error)
	}
	return (
		<Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
			<IconButton
				sx={{marginRight:1, overflow:'visible', width:'32px', height: 'auto'}}
				onClick={edit?handleCancel:handleEdit}
			>
				{edit ? <CancelIcon /> : <AddCircleIcon />}
			</IconButton>
			{edit
			? <>
			<form onSubmit={handleSubmit}>
				<TextField
					{...textFieldProps}
					disabled={textFieldProps?.disabled || !edit}
					value={edit?value:'Add New'}
					inputRef={text_field_ref}
					size='small'
					variant='standard'
					onChange={handleChange}
					onClick={handleEdit}
					sx={{
						minWidth: `${Math.max(value.length, 24) * 0.5}rem`
					}}
				/>
				<IconButton aria-label='submit' type='submit'>
					<CheckIcon />
				</IconButton>
			</form>
			</>
			: <Typography variant='body2' onClick={handleEdit}>Add New</Typography>}
		</Box>
	)
}
