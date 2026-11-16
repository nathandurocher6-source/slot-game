// Studio Greybox Assets Configuration
// Procedural vector/canvas rendering is active by default for symbols.
// The official sound sprite sheet is loaded here.
export default {
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
} as const;
