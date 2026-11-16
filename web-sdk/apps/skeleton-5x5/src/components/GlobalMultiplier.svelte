<script lang="ts" module>
	export type EmitterEventGlobalMultiplier =
		| { type: 'globalMultiplierShow' }
		| { type: 'globalMultiplierHide' }
		| { type: 'globalMultiplierUpdate'; multiplier: number };
</script>

<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { waitForTimeout } from 'utils-shared/wait';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();
	const scaleMultiplier = $derived(context.stateLayoutDerived.isStacked() ? 1.15 : 1);

	const desktopPosition = $derived({
		x: context.stateGameDerived.boardLayout().width * 0.5,
		y: -SYMBOL_SIZE * 0.52,
	});
	const portraitPosition = $derived({
		x: context.stateGameDerived.boardLayout().width * 0.5,
		y: -SYMBOL_SIZE * 0.62,
	});
	const position = $derived(
		context.stateLayoutDerived.isStacked() ? portraitPosition : desktopPosition,
	);

	let show = $state(false);
	let multiplier = $state(1);
	let isPulse = $state(false);

	const animScale = new Tween(1);

	context.eventEmitter.subscribeOnMount({
		globalMultiplierShow: () => (show = true),
		globalMultiplierHide: () => (show = false),
		globalMultiplierUpdate: async (emitterEvent) => {
			if (emitterEvent.multiplier > multiplier) {
				context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_update' });
				isPulse = true;
				multiplier = emitterEvent.multiplier;
				await animScale.set(1.35, { duration: 140, easing: cubicOut });
				await animScale.set(1.0, { duration: 180, easing: backOut });
				isPulse = false;
			} else {
				multiplier = emitterEvent.multiplier;
			}
			await waitForTimeout(100);
		},
	});
</script>

<FadeContainer {show}>
	<BoardContainer>
		<Container
			x={position.x}
			y={position.y}
			scale={{
				x: animScale.current * scaleMultiplier,
				y: animScale.current * scaleMultiplier,
			}}
		>
			<!-- Glow Accent when Updating -->
			{#if isPulse}
				<Rectangle
					width={174}
					height={54}
					borderRadius={16}
					backgroundColor={0x00ff66}
					backgroundAlpha={0.3}
					borderColor={0x00ff66}
					borderWidth={2}
					anchor={0.5}
				/>
			{/if}

			<!-- Multiplier Gauge Card -->
			<Rectangle
				width={160}
				height={46}
				borderRadius={13}
				backgroundColor={0x0b1712}
				backgroundAlpha={0.95}
				borderColor={multiplier > 1 ? 0x00e676 : 0x224a35}
				borderWidth={multiplier > 1 ? 2.5 : 1.5}
				anchor={0.5}
			/>

			<!-- Label -->
			<Text
				y={-12}
				text="GLOBAL MULT"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 9.5,
					fontWeight: '700',
					fill: 0x82f5b8,
					letterSpacing: 1.2,
				}}
			/>

			<!-- Value -->
			<Text
				y={8}
				text={`x${multiplier}`}
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 20,
					fontWeight: '800',
					fill: multiplier > 1 ? 0x00ff66 : 0xffffff,
				}}
			/>
		</Container>
	</BoardContainer>
</FadeContainer>
