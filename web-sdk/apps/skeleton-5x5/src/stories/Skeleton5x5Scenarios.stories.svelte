<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'SKELETON_5X5/Scenarios',
	});
</script>

<script lang="ts">
	import {
		StoryGameTemplate,
		StoryLocale,
		type TemplateArgs,
		templateArgs,
	} from 'components-storybook';

	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import { playBet } from '../game/utils';
	import {
		losingRound,
		tumbleMultRound,
		freeSpinsRound,
		bigWinRound,
		megaWinRound,
		epicWinRound,
		sensationalWinRound,
		maxWinRound,
	} from './data/skeleton_scenarios';

	setContext();
</script>

{#snippet template(args: TemplateArgs<any>)}
	<StoryGameTemplate
		skipLoadingScreen={args.skipLoadingScreen}
		action={async () => {
			await args.action?.(args.data);
		}}
	>
		<StoryLocale lang="en">
			<Game />
		</StoryLocale>
	</StoryGameTemplate>
{/snippet}

<!-- 1. Spin Perdant (Loss) -->
<Story
	name="1. Spin Perdant (Loss)"
	exportName="ScenarioLosingSpin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet(losingRound);
		},
	})}
	{template}
/>

<!-- 2. Séquence de Cascades & Multiplicateurs -->
<Story
	name="2. Cascades & Multiplicateurs (Tumble + Multipliers)"
	exportName="ScenarioTumbleMultipliers"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet(tumbleMultRound);
		},
	})}
	{template}
/>

<!-- 3. Entrée en Free Spins (3 Scatters) -->
<Story
	name="3. Entree Free Spins (3 Scatters + Bonus Round)"
	exportName="ScenarioFreeSpinsEntry"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet(freeSpinsRound);
		},
	})}
	{template}
/>

<!-- 4. Célébration - Big Win (15x) -->
<Story
	name="4. Celebration - Big Win (15x)"
	exportName="CelebrationBigWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet(bigWinRound);
		},
	})}
	{template}
/>

<!-- 5. Célébration - Mega Win (35x) -->
<Story
	name="5. Celebration - Mega Win (35x)"
	exportName="CelebrationMegaWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet(megaWinRound);
		},
	})}
	{template}
/>

<!-- 6. Célébration - Epic Win (75x) -->
<Story
	name="6. Celebration - Epic Win (75x)"
	exportName="CelebrationEpicWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet(epicWinRound);
		},
	})}
	{template}
/>

<!-- 7. Célébration - Sensational Win (150x) -->
<Story
	name="7. Celebration - Sensational Win (150x)"
	exportName="CelebrationSensationalWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet(sensationalWinRound);
		},
	})}
	{template}
/>

<!-- 8. Célébration - MAX WIN x100 000 (Wincap) -->
<Story
	name="8. Celebration - MAX WIN (100,000x Wincap)"
	exportName="CelebrationMaxWin"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
		action: async () => {
			await playBet(maxWinRound);
		},
	})}
	{template}
/>

<!-- 9. Mode Casino Interactif (Live Spin, Bet +/-, Buy Bonus) -->
<Story
	name="9. Mode Casino Interactif (Live Spin, Bet +/-, Buy Bonus)"
	exportName="ScenarioInteractiveCasino"
	args={templateArgs({
		skipLoadingScreen: true,
		data: {},
	})}
	{template}
/>
