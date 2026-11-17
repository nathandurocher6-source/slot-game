<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	type Props = {
		width: number;
		amount: number;
		baseAmount?: number;
		multiplier?: number;
		isEquation?: boolean;
		animate?: boolean;
		oncomplete: () => void;
	};

	const props: Props = $props();
	const scale = new Tween(1);

	$effect(() => {
		if (props.isEquation) {
			scale.set(1.22, { duration: 110, easing: cubicOut }).then(() => {
				scale.set(1.0, { duration: 140, easing: backOut });
				props.oncomplete();
			});
		} else if (props.amount > 0 && props.animate) {
			scale.set(1.22, { duration: 90, easing: cubicOut }).then(() => {
				scale.set(1.0, { duration: 110 });
				props.oncomplete();
			});
		} else {
			props.oncomplete();
		}
	});
</script>

{#if props.isEquation && props.baseAmount && props.multiplier}
	<Container y={4} scale={{ x: scale.current, y: scale.current }}>
		<!-- Base win amount -->
		<Text
			x={-props.width * 0.32}
			text={bookEventAmountToCurrencyString(props.baseAmount)}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 15,
				fontWeight: '800',
				fill: 0x94a3b8,
			}}
		/>

		<!-- Times operator -->
		<Text
			x={-props.width * 0.16}
			text="×"
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 16,
				fontWeight: '900',
				fill: 0xffd700,
			}}
		/>

		<!-- Multiplier Pill -->
		<Rectangle
			x={-props.width * 0.02}
			width={46}
			height={22}
			borderRadius={6}
			backgroundColor={0x00ff88}
			backgroundAlpha={0.25}
			borderColor={0x00ff88}
			borderWidth={1.5}
			anchor={0.5}
		/>
		<Text
			x={-props.width * 0.02}
			text={`x${props.multiplier}`}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 13,
				fontWeight: '900',
				fill: 0x69f0ae,
			}}
		/>

		<!-- Equals operator -->
		<Text
			x={props.width * 0.12}
			text="="
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 16,
				fontWeight: '900',
				fill: 0xffd700,
			}}
		/>

		<!-- Multiplied Total Amount -->
		<Text
			x={props.width * 0.30}
			text={bookEventAmountToCurrencyString(props.amount)}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 17,
				fontWeight: '900',
				fill: 0xffea79,
			}}
		/>
	</Container>
{:else}
	<Text
		y={4}
		text={bookEventAmountToCurrencyString(props.amount)}
		anchor={0.5}
		scale={{ x: scale.current, y: scale.current }}
		style={{
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: 20,
			fontWeight: '800',
			fill: 0xffffff,
		}}
	/>
{/if}
