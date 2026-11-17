<script lang="ts" module>
	export type RawWin = {
		win: number;
		mult: number;
		result: number;
		reel: number;
		row: number;
	};
	export type Win = RawWin & { oncomplete: () => void };
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';
	import { Text, Container, Rectangle } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';
	import { SECOND } from 'constants-shared/time';
	import { FadeContainer } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getContext } from '../game/context';

	type Props = { win: Win };

	const props: Props = $props();
	const context = getContext();
	const y = new Tween(0);
	const scale = new Tween(0.3);
	let show = $state(true);

	const PILL_WIDTH = $derived(props.win.result >= 10000 ? 104 : 88);
	const PILL_HEIGHT = 30;

	let isCompleted = false;
	const completeOnce = () => {
		if (!isCompleted) {
			isCompleted = true;
			props.win.oncomplete();
		}
	};

	onMount(async () => {
		const timeScale = stateBetDerived.timeScale() || 1;
		const totalDuration = (SECOND * 1.1) / timeScale;

		// Pop-in scale animation
		scale.set(1.28, { duration: 110 / timeScale, easing: backOut }).then(() => {
			scale.set(1.0, { duration: 90 / timeScale, easing: cubicOut });
		});

		// Float-up animation
		await y.set(-SYMBOL_SIZE * 0.58, { duration: totalDuration, easing: cubicOut });
		show = false;
	});

	onDestroy(() => {
		completeOnce();
	});
</script>

<FadeContainer
	{show}
	oncomplete={() => {
		if (!show) completeOnce();
	}}
>
	<Container
		x={SYMBOL_SIZE * (props.win.reel + 0.5)}
		y={SYMBOL_SIZE * (props.win.row - 0.5) + y.current}
		scale={{ x: scale.current, y: scale.current }}
		zIndex={150}
	>
		<!-- Radiant Halo Glow -->
		<Rectangle
			width={PILL_WIDTH + 8}
			height={PILL_HEIGHT + 8}
			borderRadius={14}
			backgroundColor={0xffd700}
			backgroundAlpha={0.3}
			borderColor={0xffffff}
			borderWidth={1.5}
			anchor={0.5}
		/>

		<!-- Floating Pill Base -->
		<Rectangle
			width={PILL_WIDTH}
			height={PILL_HEIGHT}
			borderRadius={10}
			backgroundColor={0x07111e}
			backgroundAlpha={0.96}
			borderColor={0xffd700}
			borderWidth={2}
			anchor={0.5}
		/>

		<!-- Top Gold Accent Indicator -->
		<Rectangle
			y={-PILL_HEIGHT * 0.5 + 2.5}
			width={PILL_WIDTH - 20}
			height={2.5}
			borderRadius={2}
			backgroundColor={0xffe675}
			backgroundAlpha={0.9}
			anchor={0.5}
		/>

		<!-- Winning Amount Text -->
		<Text
			y={1}
			text={bookEventAmountToCurrencyString(props.win.result)}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 14,
				fontWeight: '900',
				fill: 0xffea79,
			}}
		/>
	</Container>
</FadeContainer>
