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
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
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
	const scale = new Tween(1);
	let show = $state(true);

	onMount(async () => {
		await y.set(-SYMBOL_SIZE * 0.45, { duration: (SECOND * 1.2) / stateBetDerived.timeScale() });
		show = false;
	});
</script>

<FadeContainer
	{show}
	oncomplete={() => {
		if (!show) props.win.oncomplete();
	}}
>
	<Container
		x={SYMBOL_SIZE * (props.win.reel + 0.5)}
		y={SYMBOL_SIZE * (props.win.row - 0.5) + y.current}
		scale={{ x: scale.current, y: scale.current }}
	>
		<Rectangle
			width={84}
			height={28}
			borderRadius={8}
			backgroundColor={0x080f18}
			backgroundAlpha={0.92}
			borderColor={0xffd700}
			borderWidth={1.5}
			anchor={0.5}
		/>
		<Text
			text={bookEventAmountToCurrencyString(props.win.result)}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 13,
				fontWeight: '800',
				fill: 0xffe066,
			}}
		/>
	</Container>
</FadeContainer>
