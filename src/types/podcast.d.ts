export type Podcast = {
	title: string;
	description: string;
	imageUrl: string;
	link: string;
};

export type Episode = {
	id: string;
	title: string;
	description: string;
	link: string;
	audioUrl: string;
	imageUrl: string;
	pubDate: string;
};
