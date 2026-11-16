<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Container, Rectangle, Text, type Sizes } from 'pixi-svelte';

	type Props = {
		children: Snippet<[{ frameSizes: Sizes }]>;
	};

	const props: Props = $props();
	const PANEL_SIZES = {
		width: 220,
		height: 52,
	};
</script>

<Container>
	<!-- Outer Frame -->
	<Rectangle
		width={PANEL_SIZES.width}
		height={PANEL_SIZES.height}
		borderRadius={12}
		backgroundColor={0x0c131c}
		backgroundAlpha={0.95}
		borderColor={0x2b3d56}
		borderWidth={1.5}
		anchor={0.5}
	/>

	<!-- Header Badge -->
	<Rectangle
		y={-PANEL_SIZES.height * 0.5}
		width={110}
		height={18}
		borderRadius={6}
		backgroundColor={0x162436}
		borderColor={0x2b3d56}
		borderWidth={1}
		anchor={0.5}
	/>

	<Text
		y={-PANEL_SIZES.height * 0.5}
		text="TUMBLE WIN"
		anchor={0.5}
		style={{
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: 9,
			fontWeight: '800',
			fill: 0x64b5f6,
			letterSpacing: 1,
		}}
	/>

	{@render props.children({ frameSizes: PANEL_SIZES })}
</Container>
