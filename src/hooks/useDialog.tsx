import { useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

export const useDialog = () => {
	const [open, setOpen] = useState(false);

	const DialogNode = useCallback(({ title, children }:{ title:React.ReactNode, children:React.ReactNode }) => (
		<Dialog open={open} onClose={() => setOpen(false)}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>{children}</DialogContent>
		</Dialog>
	), [open]);

	const openDialog = () => setOpen(true);
	const closeDialog = () => setOpen(false);

	return {
		Dialog: DialogNode,
		open: openDialog,
		close: closeDialog
	};
};
