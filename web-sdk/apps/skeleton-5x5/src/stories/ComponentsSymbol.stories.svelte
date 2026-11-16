<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/<Symbol>',
		component: Symbol,
		args: {
			x: 100,
			y: 100,
			rawSymbol: { name: 'S', scatter: true },
			state: 'static',
		},
	});
</script>

<script lang="ts">
	import { Container, Text } from 'pixi-svelte';
	import { StoryPixiApp } from 'components-storybook';

	import Symbol from '../components/Symbol.svelte';
	import { SYMBOL_STATES } from '../game/types';
	import assets from '../game/assets';

	const BASE = 140;

	const SPECIALS = [
		{ name: 'W' },
		{ name: 'S' },
		{ name: 'M', multiplier: 2 },
		{ name: 'M', multiplier: 50 },
		{ name: 'M', multiplier: 500 },
	];

	const HIGHS_AND_LOWS = [
		{ name: 'H1' },
		{ name: 'H2' },
		{ name: 'H3' },
		{ name: 'H4' },
		{ name: 'L1' },
		{ name: 'L2' },
		{ name: 'L3' },
		{ name: 'L4' },
		{ name: 'L5' },
	];
</script>

<Story name="Single Symbol">
	{#snippet template(args)}
		<StoryPixiApp {assets}>
			<Symbol {...args} oncomplete={() => console.log('complete')} />
		</StoryPixiApp>
	{/snippet}
</Story>

<Story name="Specials Grid">
	{#snippet template()}
		<StoryPixiApp {assets}>
			<Container scale={0.65} x={40} y={40}>
				{#each SPECIALS as symbol, rowIndex}
					{#each SYMBOL_STATES as state, columnIndex}
						{@const x = (columnIndex + 1) * BASE}
						{@const y = (rowIndex + 1) * BASE}
						<Text
							{x}
							y={y - 65}
							anchor={{ x: 0.5, y: 0 }}
							text={`${symbol.name}${symbol.multiplier ? ' x' + symbol.multiplier : ''} (${state})`}
							style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fill: 0x94a3b8 }}
						/>
						<Symbol {x} {y} rawSymbol={symbol} {state} loop />
					{/each}
				{/each}
			</Container>
		</StoryPixiApp>
	{/snippet}
</Story>

<Story name="Highs & Lows Grid">
	{#snippet template()}
		<StoryPixiApp {assets}>
			<Container scale={0.55} x={40} y={20}>
				{#each HIGHS_AND_LOWS as symbol, rowIndex}
					{#each SYMBOL_STATES as state, columnIndex}
						{@const x = (columnIndex + 1) * BASE}
						{@const y = (rowIndex + 1) * BASE}
						<Text
							{x}
							y={y - 65}
							anchor={{ x: 0.5, y: 0 }}
							text={`${symbol.name} (${state})`}
							style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fill: 0x94a3b8 }}
						/>
						<Symbol {x} {y} rawSymbol={symbol} {state} loop />
					{/each}
				{/each}
			</Container>
		</StoryPixiApp>
	{/snippet}
</Story>
