<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' };
</script>

<script lang="ts">
	import { Container, Rectangle } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();
	let glowActive = $state(false);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			glowActive = true;
		},
		boardFrameGlowHide: () => {
			glowActive = false;
		},
	});

	const boardLayout = $derived(context.stateGameDerived.boardLayout());
	const FRAME_PADDING = 14;
	const FRAME_WIDTH = $derived(boardLayout.width + FRAME_PADDING * 2);
	const FRAME_HEIGHT = $derived(boardLayout.height + FRAME_PADDING * 2);
</script>

<Container x={boardLayout.x} y={boardLayout.y} scale={boardLayout.scale ?? 1}>
	<!-- Glow Aura (Active in Free Spins) -->
	{#if glowActive}
		<Rectangle
			width={FRAME_WIDTH + 14}
			height={FRAME_HEIGHT + 14}
			borderRadius={26}
			backgroundColor={0x8a2be2}
			backgroundAlpha={0.25}
			borderColor={0xff007f}
			borderWidth={2}
			borderAlpha={0.8}
			anchor={0.5}
		/>
	{/if}

	<!-- Outer Frame Panel -->
	<Rectangle
		width={FRAME_WIDTH}
		height={FRAME_HEIGHT}
		borderRadius={20}
		backgroundColor={0x0e131b}
		backgroundAlpha={0.96}
		borderColor={glowActive ? 0xff007f : 0x253245}
		borderWidth={glowActive ? 2.5 : 2}
		anchor={0.5}
	/>

	<!-- Inner Board Shadow Area -->
	<Rectangle
		width={boardLayout.width + 4}
		height={boardLayout.height + 4}
		borderRadius={14}
		backgroundColor={0x080b10}
		backgroundAlpha={0.8}
		borderColor={0x19212d}
		borderWidth={1}
		anchor={0.5}
	/>

	<!-- Column Dividers for 5x5 Grid Clarity -->
	{#each [1, 2, 3, 4] as colIndex}
		{@const colX = -boardLayout.width * 0.5 + colIndex * SYMBOL_SIZE}
		<Rectangle
			x={colX}
			y={0}
			width={1}
			height={boardLayout.height}
			backgroundColor={0x1c2533}
			backgroundAlpha={0.6}
			anchor={0.5}
		/>
	{/each}

	<!-- Row Dividers for 5x5 Grid Clarity -->
	{#each [1, 2, 3, 4] as rowIndex}
		{@const rowY = -boardLayout.height * 0.5 + rowIndex * SYMBOL_SIZE}
		<Rectangle
			x={0}
			y={rowY}
			width={boardLayout.width}
			height={1}
			backgroundColor={0x1c2533}
			backgroundAlpha={0.6}
			anchor={0.5}
		/>
	{/each}
</Container>
