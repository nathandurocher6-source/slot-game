<script lang="ts">
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicIn, cubicOut } from 'svelte/easing';
	import type { RawSymbol, SymbolState } from '../game/types';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();

	type SymbolStyleConfig = {
		bg: number;
		border: number;
		borderWidth: number;
		textColor: number;
		mainText: string;
		subText?: string;
		fontSize: number;
		isHigh: boolean;
		isSpecial: boolean;
		isMultiplier: boolean;
	};

	const getSymbolStyle = (rawSymbol: RawSymbol): SymbolStyleConfig => {
		const name = rawSymbol.name;
		const mult = rawSymbol.multiplier;

		switch (name) {
			// Low Pays (Cold palette)
			case 'L1':
				return {
					bg: 0x0c252e,
					border: 0x1ea7b8,
					borderWidth: 2,
					textColor: 0x7be5f5,
					mainText: 'L1',
					subText: 'LOW',
					fontSize: 28,
					isHigh: false,
					isSpecial: false,
					isMultiplier: false,
				};
			case 'L2':
				return {
					bg: 0x0c1b33,
					border: 0x2767c9,
					borderWidth: 2,
					textColor: 0x8ec0ff,
					mainText: 'L2',
					subText: 'LOW',
					fontSize: 28,
					isHigh: false,
					isSpecial: false,
					isMultiplier: false,
				};
			case 'L3':
				return {
					bg: 0x1a1233,
					border: 0x6e49d6,
					borderWidth: 2,
					textColor: 0xbda4ff,
					mainText: 'L3',
					subText: 'LOW',
					fontSize: 28,
					isHigh: false,
					isSpecial: false,
					isMultiplier: false,
				};
			case 'L4':
				return {
					bg: 0x0c261e,
					border: 0x228f64,
					borderWidth: 2,
					textColor: 0x7ee0b8,
					mainText: 'L4',
					subText: 'LOW',
					fontSize: 28,
					isHigh: false,
					isSpecial: false,
					isMultiplier: false,
				};
			case 'L5':
				return {
					bg: 0x182029,
					border: 0x54667d,
					borderWidth: 2,
					textColor: 0xc7d6e8,
					mainText: 'L5',
					subText: 'LOW',
					fontSize: 28,
					isHigh: false,
					isSpecial: false,
					isMultiplier: false,
				};

			// High Pays (Warm / Neon palette)
			case 'H1':
				return {
					bg: 0x332206,
					border: 0xf5a623,
					borderWidth: 2.5,
					textColor: 0xffe675,
					mainText: 'H1',
					subText: 'HIGH',
					fontSize: 28,
					isHigh: true,
					isSpecial: false,
					isMultiplier: false,
				};
			case 'H2':
				return {
					bg: 0x330912,
					border: 0xeb365b,
					borderWidth: 2.5,
					textColor: 0xff8fa3,
					mainText: 'H2',
					subText: 'HIGH',
					fontSize: 28,
					isHigh: true,
					isSpecial: false,
					isMultiplier: false,
				};
			case 'H3':
				return {
					bg: 0x2d0830,
					border: 0xdc2cf2,
					borderWidth: 2.5,
					textColor: 0xf99eff,
					mainText: 'H3',
					subText: 'HIGH',
					fontSize: 28,
					isHigh: true,
					isSpecial: false,
					isMultiplier: false,
				};
			case 'H4':
				return {
					bg: 0x331707,
					border: 0xf56a14,
					borderWidth: 2.5,
					textColor: 0xffb073,
					mainText: 'H4',
					subText: 'HIGH',
					fontSize: 28,
					isHigh: true,
					isSpecial: false,
					isMultiplier: false,
				};

			// Specials
			case 'W':
				return {
					bg: 0x2e2404,
					border: 0xffd700,
					borderWidth: 3,
					textColor: 0xffe57f,
					mainText: 'W',
					subText: 'WILD',
					fontSize: 32,
					isHigh: true,
					isSpecial: true,
					isMultiplier: false,
				};
			case 'S':
				return {
					bg: 0x2a0730,
					border: 0xff007f,
					borderWidth: 3,
					textColor: 0xff409f,
					mainText: 'S',
					subText: 'SCATTER',
					fontSize: 30,
					isHigh: true,
					isSpecial: true,
					isMultiplier: false,
				};
			case 'M':
				return {
					bg: 0x052a16,
					border: 0x00ff88,
					borderWidth: 3,
					textColor: 0x69f0ae,
					mainText: mult ? `x${mult}` : 'MULT',
					subText: 'BOMB',
					fontSize: mult && mult >= 100 ? 22 : 26,
					isHigh: true,
					isSpecial: true,
					isMultiplier: true,
				};

			default:
				return {
					bg: 0x1a212b,
					border: 0x4a5d75,
					borderWidth: 2,
					textColor: 0xffffff,
					mainText: String(name),
					fontSize: 26,
					isHigh: false,
					isSpecial: false,
					isMultiplier: false,
				};
		}
	};

	const style = $derived(getSymbolStyle(props.rawSymbol));
	const isWinning = $derived(props.state === 'win' || props.state === 'postWinStatic');
	const isExploding = $derived(props.state === 'explosion');

	const scale = new Tween(1);
	const alpha = new Tween(1);
	const flashAlpha = new Tween(0);
	const sparkleAlpha = new Tween(0);

	$effect(() => {
		const s = props.state;
		if (s === 'win') {
			flashAlpha.set(0.65, { duration: 40 }).then(() => flashAlpha.set(0, { duration: 160 }));
			sparkleAlpha.set(1.0, { duration: 80 }).then(() => sparkleAlpha.set(0.3, { duration: 140 }));

			const targetScale = style.isMultiplier ? 1.25 : 1.18;
			scale
				.set(targetScale, { duration: 120, easing: cubicOut })
				.then(() => scale.set(1.02, { duration: 100, easing: cubicIn }))
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'explosion') {
			scale
				.set(1.3, { duration: 70, easing: cubicOut })
				.then(() =>
					Promise.all([
						scale.set(0, { duration: 130, easing: cubicIn }),
						alpha.set(0, { duration: 130, easing: cubicIn }),
					]),
				)
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'land') {
			scale
				.set(0.9, { duration: 60, easing: cubicOut })
				.then(() => scale.set(1.0, { duration: 90, easing: backOut }))
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'spin') {
			scale.set(0.95, { duration: 50 });
			alpha.set(0.85, { duration: 50 });
			flashAlpha.set(0);
			sparkleAlpha.set(0);
		} else {
			scale.set(1.0, { duration: 60 });
			alpha.set(1.0, { duration: 60 });
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

	<!-- Main Tile Body -->
	<Rectangle
		width={TILE_WIDTH}
		height={TILE_HEIGHT}
		borderRadius={RADIUS}
		backgroundColor={style.bg}
		backgroundAlpha={0.94}
		borderColor={isWinning ? (style.isMultiplier ? 0xffea00 : 0xffffff) : style.border}
		borderWidth={isWinning ? style.borderWidth + 1.5 : style.borderWidth}
		anchor={0.5}
	/>

	<!-- Top Accent Line -->
	<Rectangle
		y={-TILE_HEIGHT / 2 + 5}
		width={TILE_WIDTH - 24}
		height={2.5}
		borderRadius={2}
		backgroundColor={style.isMultiplier ? 0x00ff88 : style.border}
		backgroundAlpha={style.isHigh ? 0.85 : 0.45}
		anchor={0.5}
	/>

	<!-- Centered Main Symbol Text -->
	<Text
		y={style.subText ? -6 : 0}
		text={style.mainText}
		anchor={0.5}
		style={{
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: style.fontSize,
			fontWeight: '900',
			fill: isWinning && !style.isMultiplier ? 0xffffff : style.textColor,
			align: 'center',
		}}
	/>

	<!-- Sub-label (LOW / HIGH / SCATTER / WILD / BOMB) -->
	{#if style.subText}
		<Text
			y={23}
			text={style.subText}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 9.5,
				fontWeight: '700',
				fill: isWinning ? 0xffffff : style.textColor,
				letterSpacing: 1.2,
			}}
		/>
	{/if}

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
