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

	import { MainContainer } from 'components-layout';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();
	const isStacked = $derived(context.stateLayoutDerived.isStacked());

	const CARD_WIDTH = 150;
	const CARD_HEIGHT = 56;

	// Desktop: In the side panel directly below FreeSpinCounter
	const desktopPosition = $derived({
		x:
			context.stateGameDerived.boardLayout().x -
			context.stateGameDerived.boardLayout().width * 0.5 -
			SYMBOL_SIZE * 1.5,
		y:
			context.stateGameDerived.boardLayout().y -
			context.stateGameDerived.boardLayout().height * 0.35 +
			72,
	});

	// Portrait: Sits top-right above the board on the upper tier (symmetric with FreeSpinCounter)
	const portraitPosition = $derived({
		x: context.stateGameDerived.boardLayout().x + SYMBOL_SIZE * 1.6,
		y:
			context.stateGameDerived.boardLayout().y -
			context.stateGameDerived.boardLayout().height * 0.5 -
			SYMBOL_SIZE * 1.05,
	});

	const position = $derived(isStacked ? portraitPosition : desktopPosition);
	const scaleMultiplier = $derived(isStacked ? 1.05 : 1);

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

<MainContainer>
	<FadeContainer {show} {...position}>
		<Container
			scale={{
				x: animScale.current * scaleMultiplier,
				y: animScale.current * scaleMultiplier,
			}}
		>
			<!-- Glow Accent when Updating -->
			{#if isPulse}
				<Rectangle
					width={CARD_WIDTH + 14}
					height={CARD_HEIGHT + 14}
					borderRadius={16}
					backgroundColor={0x00ff66}
					backgroundAlpha={0.35}
					borderColor={0x00ff66}
					borderWidth={2}
					anchor={0.5}
				/>
			{/if}

			<!-- Multiplier Gauge Card -->
			<Rectangle
				width={CARD_WIDTH}
				height={CARD_HEIGHT}
				borderRadius={14}
				backgroundColor={0x0b1712}
				backgroundAlpha={0.95}
				borderColor={multiplier > 1 ? 0x00e676 : 0x224a35}
				borderWidth={multiplier > 1 ? 2.5 : 1.5}
				anchor={0.5}
			/>

			<!-- Label -->
			<Text
				y={-14}
				text="GLOBAL MULT"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 10,
					fontWeight: '700',
					fill: 0x82f5b8,
					letterSpacing: 1.2,
				}}
			/>

			<!-- Value -->
			<Text
				y={10}
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
	</FadeContainer>
</MainContainer>
