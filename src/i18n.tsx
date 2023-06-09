
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
				en: 'Support This Project',
				ja: 'サポートする'
			},
			url: {
				en: 'https://donate.stripe.com/3cs8xhggxaMtdTq4gi',
				ja: 'https://donate.stripe.com/3cseVF4xP07PbLibIJ'
			}
		},
		about_donation: {
			en: 'About Supporting',
			ja: 'サポートについて'
		},
		donation_modal_title: {
			en: 'Create Share URL',
			ja: '共有用リンクを作成'
		},
		export: {
			en: 'Export',
			ja: 'エクスポート'
		},
		login: {
			en: 'Login',
			ja: 'ログイン'
		},
		to_dashboard: {
			en: 'Dashboard',
			ja: '管理画面へ'
		},
		logout: {
			en: 'Logout',
			ja: 'ログアウト'
		},
		export_modal_title: {
			en: 'Create Share URL',
			ja: '共有用リンクを作成'
		},
		change_password_title: {
			en: 'Change Password',
			ja: 'パスワードを変更'
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
	import_channels: {
		title: {
			en: 'Import Channels',
			ja: 'インポート'
		},
		all: {
			en: 'follow all',
			ja: '全てフォロー'
		}
	},
	donation: {
		list_header: {
			en: 'Supporters',
			ja: 'サポーター一覧'
		},
		title: {
			en: 'About Supporting',
			ja: 'サポートについて'
		},
		body: {
			en: <div>
				<p>
					<a href='https://publicpodcast.link' target='_blank'>PublicPodcast.link</a>
					<span> is provided as a unique tool to generate permanent links for podcasts. We're offering this platform to users for free, providing resources to make the podcast experience more convenient and efficient.</span>
				</p>
				<p>However, costs such as domain management and operational expenses are necessary to keep it publicly available. In order to continue and enhance this service, we need your donations.</p>
				<p>If you find PublicPodcast.link useful, we'd appreciate it if you could consider making a donation. Any amount makes a big difference.</p>
				<p>
					<span>We deeply appreciate your support and understanding. You can make a donation here: </span>
					<a href='https://donate.stripe.com/3cs8xhggxaMtdTq4gi' target='_blank'>Support PublicPodcast.link</a>
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
					<a href='https://buy.stripe.com/3cseVF4xP07PbLibIJ' target='_blank'>PublicPodcast.linkをサポートする</a>
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
	},
	login: {
		check_email: {
			en: 'Check your email for the login link!',
			ja: 'ログインリンクを記載したEメールを送信しました'
		},
		password_reset_success: {
			en: 'Successfully changed password.',
			ja: 'パスワードを変更しました'
		},
		reset_password_button:  {
			en: 'Reset Password',
			ja: '送信'
		},
		login_button:  {
			en: 'Log in',
			ja: 'ログイン'
		},
		login:  {
			en: 'Log in',
			ja: 'ログイン'
		},
		signup:  {
			en: 'Sign up',
			ja: 'サインアップ'
		},
		or_log_in: {
			en: 'or log in?',
			ja: 'パスワード設定済みの場合はこちら'
		},
		or_sign_up: {
			en: "or sign up / forgot password / don't use password?",
			ja: '未ログイン / パスワード再設定 / パスワード未設定の場合はこちら'
		}
	},
	owner: {
		title: {
			en: 'Dashboard',
			ja: '管理画面'
		},
		shared_members: {
			en: 'shared members',
			ja: '共同編集者'
		},
		related_links: {
			en: 'Related Links',
			ja: '関連リンク'
		},
		preview: {
			en: 'Preview',
			ja: 'プレビュー'
		},
		channel_list: {
			en: 'Channels you can edit',
			ja: '管理番組のリスト'
		},
		label_owned: {
			en: 'channels you own',
			ja: '所有する番組'
		},
		label_shared: {
			en: 'shared channels',
			ja: '共有された番組'
		},
		already_added: {
			en: 'already added',
			ja: '追加済み'
		},
		rss_fetch_failed: {
			en: 'failed to fetch RSS',
			ja: 'RSSの取得に失敗'
		},
		not_yours: {
			en: (url:string)=>`It seems you're not the owner. Please ask the owner to invite you via this URL( ${url} ).`,
			ja: (url:string)=>`あなたが所有していない番組のようです。所有者にこのURL( ${url} )を案内して、共同編集者として追加してもらってください。`
		},
		added: {
			en: 'added',
			ja: '追加しました'
		},
		tab: {
			channels: {
				en: 'Channels',
				ja: '番組管理'
			},
			playlist: {
				en: 'Playlist',
				ja: 'プレイリスト管理'
			},
			account: {
				en: 'Account',
				ja: 'アカウント'
			},
		},
		account: {
			change_password: {
				en: 'Change Password',
				ja: 'パスワードを変更'
			},
		}
	},
	related_links: {
		not_approved: {
			en: (origin: string) => `approval request for "${origin}" have sent. please wait for manual approval.`,
			ja: (origin: string) => `${origin}を追加できるようにするリクエストがサイト管理者に送信されました。手動での承認をお待ちください。`
		},
		not_url: {
			en: 'not an URL?',
			ja: 'URLではないようです'
		}
	}
};
