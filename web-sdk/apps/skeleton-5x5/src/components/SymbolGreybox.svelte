<script lang="ts">
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicIn, cubicOut } from 'svelte/easing';
	import type { RawSymbol, SymbolState } from '../game/types';
	import { SYMBOL_SIZE } from '../game/constants';

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
				};
			case 'M':
				return {
					bg: 0x052412,
					border: 0x00e676,
					borderWidth: 3,
					textColor: 0x69f0ae,
					mainText: mult ? `x${mult}` : 'MULT',
					subText: 'BOMB',
					fontSize: mult && mult >= 100 ? 22 : 26,
					isHigh: true,
					isSpecial: true,
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
				};
		}
	};

	const style = $derived(getSymbolStyle(props.rawSymbol));
	const isWinning = $derived(props.state === 'win' || props.state === 'postWinStatic');
	const isExploding = $derived(props.state === 'explosion');

	const scale = new Tween(1);
	const alpha = new Tween(1);

	$effect(() => {
		const s = props.state;
		if (s === 'win') {
			scale
				.set(1.14, { duration: 130, easing: cubicOut })
				.then(() => scale.set(1.0, { duration: 130, easing: cubicIn }))
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'explosion') {
			scale
				.set(1.2, { duration: 60, easing: cubicOut })
				.then(() =>
					Promise.all([
						scale.set(0, { duration: 140, easing: cubicIn }),
						alpha.set(0, { duration: 140, easing: cubicIn }),
					]),
				)
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'land') {
			scale
				.set(0.92, { duration: 60, easing: cubicOut })
				.then(() => scale.set(1.0, { duration: 90, easing: backOut }))
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'spin') {
			scale.set(0.96, { duration: 50 });
			alpha.set(0.85, { duration: 50 });
		} else {
			scale.set(1.0, { duration: 60 });
			alpha.set(1.0, { duration: 60 });
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
	<!-- Outer Glow when Winning -->
	{#if isWinning}
		<Rectangle
			width={TILE_WIDTH + 8}
			height={TILE_HEIGHT + 8}
			borderRadius={RADIUS + 4}
			backgroundColor={style.border}
			backgroundAlpha={0.35}
			borderColor={style.textColor}
			borderWidth={2}
			anchor={0.5}
		/>
	{/if}

	<!-- Main Tile Body -->
	<Rectangle
		width={TILE_WIDTH}
		height={TILE_HEIGHT}
		borderRadius={RADIUS}
		backgroundColor={style.bg}
		backgroundAlpha={0.92}
		borderColor={isWinning ? style.textColor : style.border}
		borderWidth={isWinning ? style.borderWidth + 1.5 : style.borderWidth}
		anchor={0.5}
	/>

	<!-- Top Accent Line -->
	<Rectangle
		y={-TILE_HEIGHT / 2 + 5}
		width={TILE_WIDTH - 24}
		height={2.5}
		borderRadius={2}
		backgroundColor={style.border}
		backgroundAlpha={style.isHigh ? 0.8 : 0.4}
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
			fontWeight: '800',
			fill: style.textColor,
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
</Container>
