export type Podcast = {
	title: string;
	description: string;
	imageUrl: string;
	link: string;
	author: string;
	self_url: string;
	owner: {
		email: string;
	},
	src?: string
};

export type Episode = {
	id: string;
	title: string;
	description: string;
	link: string;
	audioUrl: string;
	type: string;
	imageUrl: string;
	pubDate: string;
	src?: string
};
