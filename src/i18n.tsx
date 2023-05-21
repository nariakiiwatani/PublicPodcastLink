export default {
	select_channel: {
		label: {
			en: 'Enter RSS to add a channel',
			ja: 'RSSを入力して番組を追加'
		}
	},
	select_episode: {
		label: {
			en: 'Select episode',
			ja: 'エピソードを選択'
		}
	},
	header: {
		donation: {
			label: {
				en: 'Donate',
				ja: '寄付'
			},
			url: {
				en: 'https://donate.stripe.com/3cs8xhggxaMtdTq4gi',
				ja: 'https://donate.stripe.com/3cseVF4xP07PbLibIJ'
			}
		},
		export: {
			en: 'Export',
			ja: 'エクスポート'
		},
		export_modal_title: {
			en: 'Create Share URL',
			ja: '共有用リンクを作成'
		}
	},
	create_import_url: {
		all: {
			en: 'all',
			ja: '全て'
		},
		copy: {
			en: 'Click to copy',
			ja: 'クリックしてコピー'
		},
		selected: {
			en: (num:number)=>`${num>0?num:'no'} item${num>1?'s':''} selected.`,
			ja: (num:number)=>`${num} 番組を選択中`
		}
	},
	copy: {
		tooltip: {
			en: 'Copy to clipboard',
			ja: 'クリップボードにコピー'
		},
		pending: {
			en: 'Copying to clipboard...',
			ja: 'クリップボードにコピー中...'
		},
		success: {
			en: 'Copied to clipboard!',
			ja: 'コピーしました！'
		},
		fail: {
			en: 'Failed to copy text.',
			ja: 'コピーに失敗しました。'
		}
	}
};
