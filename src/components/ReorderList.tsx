import React, { useEffect, useState, useCallback } from 'react'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import { Container, Draggable, DropResult } from "react-smooth-dnd"
import { Box, List } from '@mui/material'
import { useContextPack } from '../hooks/useContextPack'

export const useReorder = <T,>(items:T[]) => {
	const [value, setValue] = useState(items)
	useEffect(() => {
		setValue(items)
	}, [items])
	const update = useCallback((v: T[] | ((_: T[]) => T[])) => {
		if (typeof v === 'function') {
			const newValue = v(value);
			setValue(newValue);
			return newValue;
		} else {
			setValue(v);
			return v;
		}
	}, [value]);
	const add = (item: T) => {
		return update(prev => [...prev, item])
	}
	const del = (index: number) => {
		return update(prev => {
			const new_array = [...prev]
			new_array.splice(index, 1)
			return new_array
		})
	}
	const move = (index_from: number, index_to: number) => {
		return update(prev => {
			const new_array = [...prev]
			const [removed] = new_array.splice(index_from, 1)
			new_array.splice(index_to, 0, removed)
			return new_array
		})
	}
	return {
		value,
		add,
		del,
		move,
		set: setValue
	}
}
const DraggableContainer = (props:{children:React.ReactElement}&React.ComponentProps<typeof Container>) => {
	const { children, render:_, ...rest } = props
	return (<Container {...rest}>{children}</Container>)
}
const DraggableItem = (props:{children:React.ReactElement}&React.ComponentProps<typeof Draggable>) => {
	const { children, render:_, ...rest } = props
	return (<Draggable {...rest}>{children}</Draggable>)
}
type ReorderableListProps<T> = {
	items: T[]
	onChange: (items:T[]) => void
	children: React.ReactNode | ((item:T,index:number,arr:T[])=>React.ReactNode)
	component?: React.ElementType
	componentProps?:{[key:string]:any}
	dragHandleClass?: string
}
export const ReorderableList = <T,>({
	items,
	onChange,
	component:Component=List,
	componentProps={},
	dragHandleClass='dragHandle',
	children
}:ReorderableListProps<T>) => {
	const { value, move, set } = useReorder(items)
	const { ArrayProvider, ArrayProviderConsumer } = useContextPack<T>()
	useEffect(() => {
		set(items)
	}, [items])
	const handleDrop = async ({ removedIndex, addedIndex }: DropResult) => {
		if(removedIndex === null || addedIndex === null) {
			return
		}
		onChange(move(removedIndex, addedIndex))
	};
	const ItemWrapper = useCallback(({children}:{children:React.ReactNode}) =>
		<DraggableItem>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				padding="8px"
			>
				<DragHandleIcon className={dragHandleClass} sx={{ cursor: 'pointer' }} />
				{children}
			</Box>
		</DraggableItem>
	, [])
	const Wrapper = useCallback(() => (
		typeof children === 'function'
			? <ArrayProviderConsumer value={value}>
				{(v,i,a) => <ItemWrapper>{children(v,i,a)}</ItemWrapper>}
			</ArrayProviderConsumer>
			: <ArrayProvider value={value}>
				<ItemWrapper>{children}</ItemWrapper>
			</ArrayProvider>		
	), [children, value])
	return (
		<Component {...componentProps}>
			<DraggableContainer
				onDrop={handleDrop}
				dragHandleSelector={`.${dragHandleClass}`}
			>
				<Wrapper />
			</DraggableContainer >
		</Component>
	)
}