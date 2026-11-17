<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Container, Rectangle, Text, type Sizes } from 'pixi-svelte';

	type Props = {
		isEquation?: boolean;
		isPulse?: boolean;
		children: Snippet<[{ frameSizes: Sizes }]>;
	};

	const props: Props = $props();
	const PANEL_SIZES = $derived({
		width: props.isEquation ? 340 : 220,
		height: 52,
	});
</script>

<Container>
	<!-- Outer Glow Aura when Multiplier Applied -->
	{#if props.isPulse || props.isEquation}
		<Rectangle
			width={PANEL_SIZES.width + 12}
			height={PANEL_SIZES.height + 12}
			borderRadius={16}
			backgroundColor={0x00ff88}
			backgroundAlpha={0.35}
			borderColor={0x00ff88}
			borderWidth={2}
			anchor={0.5}
		/>
	{/if}

	<!-- Outer Frame -->
	<Rectangle
		width={PANEL_SIZES.width}
		height={PANEL_SIZES.height}
		borderRadius={12}
		backgroundColor={0x0c131c}
		backgroundAlpha={0.96}
		borderColor={props.isEquation ? 0x00ff88 : 0x2b3d56}
		borderWidth={props.isEquation ? 2 : 1.5}
		anchor={0.5}
	/>

	<!-- Header Badge -->
	<Rectangle
		y={-PANEL_SIZES.height * 0.5}
		width={props.isEquation ? 140 : 110}
		height={18}
		borderRadius={6}
		backgroundColor={props.isEquation ? 0x072818 : 0x162436}
		borderColor={props.isEquation ? 0x00ff88 : 0x2b3d56}
		borderWidth={1}
		anchor={0.5}
	/>

	<Text
		y={-PANEL_SIZES.height * 0.5}
		text={props.isEquation ? 'WIN MULTIPLIED' : 'TUMBLE WIN'}
		anchor={0.5}
		style={{
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: 9,
			fontWeight: '800',
			fill: props.isEquation ? 0x69f0ae : 0x64b5f6,
			letterSpacing: 1,
		}}
	/>

	{@render props.children({ frameSizes: PANEL_SIZES })}
</Container>
