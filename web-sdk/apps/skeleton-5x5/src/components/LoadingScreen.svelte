<script lang="ts">
	import { onMount } from 'svelte';
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	import { getContext } from '../game/context';
	import TransitionAnimation from './TransitionAnimation.svelte';
	import PressToContinue from './PressToContinue.svelte';

	import { pregenerateSymbolTextures } from '../game/symbolTextureCache';

	type Props = {
		onloaded: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	let loadingType = $state<'start' | 'transition'>('start');
	let isReady = $state(false);
	const progress = new Tween(0);

	onMount(async () => {
		pregenerateSymbolTextures();
		await progress.set(100, { duration: 500, easing: cubicOut });
		isReady = true;
	});

	const BAR_WIDTH = 260;
	const BAR_HEIGHT = 8;
</script>

<!-- Logo & Loading Progress -->
<FadeContainer show={loadingType === 'start'}>
	<CanvasSizeRectangle backgroundColor={0x080b10} zIndex={100} />

	<MainContainer>
		<Container
			x={context.stateLayoutDerived.mainLayout().width * 0.5}
			y={context.stateLayoutDerived.mainLayout().height * 0.48}
			zIndex={101}
		>
			<!-- Studio Logo / Title -->
			<Rectangle
				y={-40}
				width={180}
				height={28}
				borderRadius={8}
				backgroundColor={0x16202c}
				borderColor={0x2d3f57}
				borderWidth={1}
				anchor={0.5}
			/>

			<Text
				y={-40}
				text="STAKE ENGINE"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 12,
					fontWeight: '900',
					fill: 0x64b5f6,
					letterSpacing: 2.5,
				}}
			/>

			<Text
				y={4}
				text="5x5 GREYBOX SKELETON"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 26,
					fontWeight: '900',
					fill: 0xffffff,
					letterSpacing: 1,
				}}
			/>

			<!-- Progress Bar Background -->
			<Rectangle
				y={55}
				width={BAR_WIDTH}
				height={BAR_HEIGHT}
				borderRadius={4}
				backgroundColor={0x161e2a}
				borderColor={0x2b384c}
				borderWidth={1}
				anchor={0.5}
			/>

			<!-- Progress Bar Fill -->
			{#if progress.current > 0}
				<Rectangle
					x={-BAR_WIDTH * 0.5 + (BAR_WIDTH * (progress.current / 100)) * 0.5}
					y={55}
					width={BAR_WIDTH * (progress.current / 100)}
					height={BAR_HEIGHT - 2}
					borderRadius={3}
					backgroundColor={0x00e676}
					anchor={0.5}
				/>
			{/if}

			<!-- Percentage Text -->
			<Text
				y={75}
				text={isReady ? 'READY' : `${Math.round(progress.current)}%`}
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 11,
					fontWeight: '700',
					fill: 0x94a3b8,
					letterSpacing: 1.5,
				}}
			/>
		</Container>
	</MainContainer>
</FadeContainer>

<!-- Press to Continue Prompt -->
<FadeContainer show={loadingType === 'start' && isReady}>
	<PressToContinue onpress={() => (loadingType = 'transition')} />
</FadeContainer>

<!-- Transition between Loading Screen and Game -->
<FadeContainer show={loadingType === 'transition'}>
	<TransitionAnimation oncomplete={props.onloaded} />
</FadeContainer>
