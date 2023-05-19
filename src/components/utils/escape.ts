function escapeHtml(unsafe: string) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

export function avoidXSS(unsafe: string) {
	return escapeHtml(unsafe).replace(/\n/g, '<br />')
}