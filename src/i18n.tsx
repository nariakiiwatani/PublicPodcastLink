
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
		about_donation: {
			en: 'About donation',
			ja: '寄付について'
		},
		donation_modal_title: {
			en: 'Create Share URL',
			ja: '共有用リンクを作成'
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
			en: (num: number) => `${num > 0 ? num : 'no'} item${num > 1 ? 's' : ''} selected.`,
			ja: (num: number) => `${num} 番組を選択中`
		}
	},
	donation: {
		list_header: {
			en: 'Donators',
			ja: '寄付者'
		},
		title: {
			en: 'About donation',
			ja: '寄付について'
		},
		body: {
			en: <div>
				<p>
					<a href='https://publicpodcast.link' target='_blank'>PublicPodcast.link</a>
					<span>is provided as a unique tool to generate permanent links for podcasts. We're offering this platform to users for free, providing resources to make the podcast experience more convenient and efficient.</span>
				</p>
				<p>However, costs such as domain management and operational expenses are necessary to keep it publicly available. In order to continue and enhance this service, we need your donations.</p>
				<p>If you find PublicPodcast.link useful, we'd appreciate it if you could consider making a donation. Any amount makes a big difference.</p>
				<p>
					<span>We deeply appreciate your support and understanding. You can make a donation here: </span>
					<a href='https://donate.stripe.com/3cs8xhggxaMtdTq4gi' target='_blank'>Donation for PublicPodcast.link</a>
				</p>
			</div>,
			ja: <div>
				<p>
					<a href='https://publicpodcast.link' target='_blank'>PublicPodcast.link</a>
					<span>は、ポッドキャストのパーマリンクを作成できるユニークなツールとして提供しています。</span>
					<span>私たちはこのプラットフォームを利用者の皆様に無料で提供し、ポッドキャストの体験を簡単で効率的にするためのリソースを提供したいと考えています。</span>
				</p>
				<p>しかし、公開維持のためにはドメイン管理費用が必要です。このサービスを続け、改善し続けるためには、皆様からの寄付が必要です。</p>
				<p>あなたがPublicPodcast.linkを有用と感じていただけるなら、寄付を検討していただけると幸いです。どんな額でも、大きな違いを生み出す力があります。</p>
				<p>
					<span>皆様のご支援とご理解に心より感謝いたします。ここから寄付をしていただけます： </span>
					<a href='https://buy.stripe.com/3cseVF4xP07PbLibIJ' target='_blank'>PublicPodcast.linkへの寄付</a>
				</p>
			</div>
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
