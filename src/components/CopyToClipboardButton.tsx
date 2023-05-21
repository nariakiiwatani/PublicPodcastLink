import React, { useState } from 'react';
import { IconButton, Snackbar, Alert, Tooltip } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';

type CopyToClipboardButtonProps = {
	value: string;
	Icon: React.ReactNode
};

export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({ value, Icon }) => {
	const { t } = useTranslation('copy')
	const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'completed' | 'error'>('idle');

	const handleCopy = async () => {
		try {
			setCopyStatus('copying');
			await navigator.clipboard.writeText(value);
			setCopyStatus('completed');
		} catch (err) {
			setCopyStatus('error');
			console.error('Failed to copy text');
		}
	};

	const handleClose = () => {
		setCopyStatus('idle');
	};

	const tooltip = ((status: string) => {
		switch(status) {
			case 'copying': return t.pending
			case 'completed': return t.success
			case 'error': t.fail
		}
		return t.tooltip
	})(copyStatus)
	const duration = 2000
	return (
		<div>
			<Tooltip title={tooltip}>
				<IconButton
					color="inherit"
					onClick={handleCopy}
					disabled={copyStatus === 'copying'}
				>{Icon}
				</IconButton>
			</Tooltip>
			<Snackbar open={copyStatus === 'copying'} autoHideDuration={duration} onClose={handleClose}>
				<Alert onClose={handleClose} severity="info" sx={{ width: '100%' }}>
					{t.pending}
				</Alert>
			</Snackbar>
			<Snackbar open={copyStatus === 'completed'} autoHideDuration={duration} onClose={handleClose}>
				<Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
					{t.success}
				</Alert>
			</Snackbar>
			<Snackbar open={copyStatus === 'error'} autoHideDuration={duration} onClose={handleClose}>
				<Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
					{t.fail}
				</Alert>
			</Snackbar>
		</div>
	);
};
