<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'COMPONENTS/<WinCelebration>',
	});
</script>

<script lang="ts">
	import { StoryPixiApp } from 'components-storybook';
	import WinCelebration from '../components/WinCelebration.svelte';
	import { setContext } from '../game/context';
	import assets from '../game/assets';

	setContext();
</script>

<Story name="Tier Big Win (15x)" exportName="TierBigWin">
	{#snippet template()}
		<StoryPixiApp {assets}>
			<WinCelebration
				amount={1500}
				betAmount={1}
				oncomplete={() => console.log('Celebration complete')}
			/>
		</StoryPixiApp>
	{/snippet}
</Story>

<Story name="Tier Mega Win (35x)" exportName="TierMegaWin">
	{#snippet template()}
		<StoryPixiApp {assets}>
			<WinCelebration
				amount={3500}
				betAmount={1}
				oncomplete={() => console.log('Celebration complete')}
			/>
		</StoryPixiApp>
	{/snippet}
</Story>

<Story name="Tier Epic Win (75x)" exportName="TierEpicWin">
	{#snippet template()}
		<StoryPixiApp {assets}>
			<WinCelebration
				amount={7500}
				betAmount={1}
				oncomplete={() => console.log('Celebration complete')}
			/>
		</StoryPixiApp>
	{/snippet}
</Story>

<Story name="Tier Sensational Win (150x)" exportName="TierSensationalWin">
	{#snippet template()}
		<StoryPixiApp {assets}>
			<WinCelebration
				amount={15000}
				betAmount={1}
				oncomplete={() => console.log('Celebration complete')}
			/>
		</StoryPixiApp>
	{/snippet}
</Story>

<Story name="Tier MAX WIN (100,000x)" exportName="TierMaxWin">
	{#snippet template()}
		<StoryPixiApp {assets}>
			<WinCelebration
				amount={10000000}
				betAmount={1}
				isMaxWin={true}
				oncomplete={() => console.log('Max Win Celebration complete')}
			/>
		</StoryPixiApp>
	{/snippet}
</Story>
