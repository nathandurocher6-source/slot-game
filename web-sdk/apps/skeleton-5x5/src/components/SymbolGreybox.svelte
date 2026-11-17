<script lang="ts">
	import { Container, Rectangle, BaseSprite } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicIn, cubicOut } from 'svelte/easing';
	import { stateBet } from 'state-shared';
	import type { RawSymbol, SymbolState } from '../game/types';
	import { getSymbolTexture, getSymbolStyle } from '../game/symbolTextureCache';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();

	const style = $derived(getSymbolStyle(props.rawSymbol));
	const isWinning = $derived(props.state === 'win' || props.state === 'postWinStatic');
	const symbolTexture = $derived(getSymbolTexture(props.rawSymbol, isWinning));

	const scale = new Tween(1);
	const alpha = new Tween(1);
	const flashAlpha = new Tween(0);
	const sparkleAlpha = new Tween(0);

	$effect(() => {
		const s = props.state;
		const isTurbo = stateBet.isTurbo;

		if (s === 'win') {
			const dur1 = isTurbo ? 25 : 40;
			const dur2 = isTurbo ? 80 : 160;
			const sDur1 = isTurbo ? 60 : 120;
			const sDur2 = isTurbo ? 50 : 100;
			flashAlpha.set(0.65, { duration: dur1 }).then(() => flashAlpha.set(0, { duration: dur2 }));
			sparkleAlpha.set(1.0, { duration: 40 }).then(() => sparkleAlpha.set(0.3, { duration: 80 }));

			const targetScale = style.isMultiplier ? 1.25 : 1.18;
			scale
				.set(targetScale, { duration: sDur1, easing: cubicOut })
				.then(() => scale.set(1.02, { duration: sDur2, easing: cubicIn }))
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'explosion') {
			const eDur1 = isTurbo ? 35 : 70;
			const eDur2 = isTurbo ? 65 : 130;
			scale
				.set(1.3, { duration: eDur1, easing: cubicOut })
				.then(() =>
					Promise.all([
						scale.set(0, { duration: eDur2, easing: cubicIn }),
						alpha.set(0, { duration: eDur2, easing: cubicIn }),
					]),
				)
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'land') {
			const lDur1 = isTurbo ? 30 : 60;
			const lDur2 = isTurbo ? 45 : 90;
			scale
				.set(0.9, { duration: lDur1, easing: cubicOut })
				.then(() => scale.set(1.0, { duration: lDur2, easing: backOut }))
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'spin') {
			scale.set(0.95, { duration: isTurbo ? 25 : 50 });
			alpha.set(0.85, { duration: isTurbo ? 25 : 50 });
			flashAlpha.set(0);
			sparkleAlpha.set(0);
		} else {
			scale.set(1.0, { duration: isTurbo ? 25 : 60 });
			alpha.set(1.0, { duration: isTurbo ? 25 : 60 });
			flashAlpha.set(0);
			sparkleAlpha.set(0);
		}
	});

	const TILE_WIDTH = 88;
	const TILE_HEIGHT = 88;
	const RADIUS = 14;
</script>

<Container
	x={props.x}
	y={props.y}
	scale={{ x: scale.current, y: scale.current }}
	alpha={alpha.current}
>
	<!-- Outer Glow Aura when Winning or Multiplier Bomb -->
	{#if isWinning || style.isMultiplier}
		<Rectangle
			width={TILE_WIDTH + 10}
			height={TILE_HEIGHT + 10}
			borderRadius={RADIUS + 5}
			backgroundColor={style.isMultiplier ? 0x00ff88 : style.border}
			backgroundAlpha={isWinning ? 0.45 : 0.2}
			borderColor={isWinning ? 0xffffff : style.textColor}
			borderWidth={isWinning ? 3 : 1.5}
			anchor={0.5}
		/>
	{/if}

	<!-- Pre-cached High-Performance Texture Sprite (Zero Vector/Text Draw Calls on Frame) -->
	<BaseSprite
		texture={symbolTexture}
		anchor={0.5}
		width={TILE_WIDTH}
		height={TILE_HEIGHT}
	/>

	<!-- Procedural Sparkles on Corners when Winning -->
	{#if isWinning}
		<!-- Top-Left Sparkle -->
		<Rectangle
			x={-TILE_WIDTH * 0.44}
			y={-TILE_HEIGHT * 0.44}
			width={8}
			height={8}
			rotation={Math.PI / 4}
			backgroundColor={0xffffff}
			backgroundAlpha={sparkleAlpha.current}
			anchor={0.5}
		/>
		<!-- Top-Right Sparkle -->
		<Rectangle
			x={TILE_WIDTH * 0.44}
			y={-TILE_HEIGHT * 0.44}
			width={8}
			height={8}
			rotation={Math.PI / 4}
			backgroundColor={0xffffff}
			backgroundAlpha={sparkleAlpha.current}
			anchor={0.5}
		/>
		<!-- Bottom-Left Sparkle -->
		<Rectangle
			x={-TILE_WIDTH * 0.44}
			y={TILE_HEIGHT * 0.44}
			width={8}
			height={8}
			rotation={Math.PI / 4}
			backgroundColor={0xffffff}
			backgroundAlpha={sparkleAlpha.current}
			anchor={0.5}
		/>
		<!-- Bottom-Right Sparkle -->
		<Rectangle
			x={TILE_WIDTH * 0.44}
			y={TILE_HEIGHT * 0.44}
			width={8}
			height={8}
			rotation={Math.PI / 4}
			backgroundColor={0xffffff}
			backgroundAlpha={sparkleAlpha.current}
			anchor={0.5}
		/>
	{/if}

	<!-- White/Gold Flash Overlay on Win Trigger -->
	{#if flashAlpha.current > 0.01}
		<Rectangle
			width={TILE_WIDTH}
			height={TILE_HEIGHT}
			borderRadius={RADIUS}
			backgroundColor={style.isMultiplier ? 0x00ff88 : 0xffffff}
			backgroundAlpha={flashAlpha.current}
			anchor={0.5}
		/>
	{/if}
</Container>
