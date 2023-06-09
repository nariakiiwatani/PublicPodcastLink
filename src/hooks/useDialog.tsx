import { useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

export const useDialog = (defaultOpen?:boolean) => {
	const [open, setOpen] = useState(defaultOpen||false);

	const DialogNode = useCallback(({ title, children }:{ title:React.ReactNode, children:React.ReactNode }) => (
		<Dialog open={open} onClose={() => setOpen(false)}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>{children}</DialogContent>
		</Dialog>
	), [open]);

	const openDialog = useCallback(() => setOpen(true), [setOpen])
	const closeDialog = useCallback(() => setOpen(false), [setOpen])

	return {
		Dialog: DialogNode,
		open: openDialog,
		close: closeDialog,
	};
};
