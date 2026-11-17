<script lang="ts" module>
	export type EmitterEventFreeSpinCounter =
		| { type: 'freeSpinCounterShow' }
		| { type: 'freeSpinCounterHide' }
		| { type: 'freeSpinCounterUpdate'; current?: number; total?: number };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	const isStacked = $derived(context.stateLayoutDerived.isStacked());
	const desktopPosition = $derived({
		x:
			context.stateGameDerived.boardLayout().x -
			context.stateGameDerived.boardLayout().width * 0.5 -
			SYMBOL_SIZE * 1.5,
		y:
			context.stateGameDerived.boardLayout().y -
			context.stateGameDerived.boardLayout().height * 0.35,
	});

	const portraitPosition = $derived({
		x: context.stateGameDerived.boardLayout().x - SYMBOL_SIZE * 1.6,
		y:
			context.stateGameDerived.boardLayout().y -
			context.stateGameDerived.boardLayout().height * 0.5 -
			SYMBOL_SIZE * 1.05,
	});

	const position = $derived(isStacked ? portraitPosition : desktopPosition);

	let show = $state(false);
	let current = $state(0);
	let total = $state(0);

	context.eventEmitter.subscribeOnMount({
		freeSpinCounterShow: () => (show = true),
		freeSpinCounterHide: () => (show = false),
		freeSpinCounterUpdate: (emitterEvent) => {
			if (emitterEvent.current !== undefined) current = emitterEvent.current;
			if (emitterEvent.total !== undefined) total = emitterEvent.total;
		},
	});

	const CARD_WIDTH = 150;
	const CARD_HEIGHT = 56;
</script>

<MainContainer>
	<FadeContainer {show} {...position}>
		<Container>
			<!-- Card Outer Frame -->
			<Rectangle
				width={CARD_WIDTH}
				height={CARD_HEIGHT}
				borderRadius={14}
				backgroundColor={0x200a29}
				backgroundAlpha={0.92}
				borderColor={0xff007f}
				borderWidth={2}
				anchor={0.5}
			/>

			<!-- Header Label -->
			<Text
				y={-14}
				text="FREE SPINS"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 10,
					fontWeight: '700',
					fill: 0xff66b2,
					letterSpacing: 1.2,
				}}
			/>

			<!-- Spins Counter Value -->
			<Text
				y={10}
				text={`${current} / ${total}`}
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 18,
					fontWeight: '800',
					fill: 0xffffff,
				}}
			/>
		</Container>
	</FadeContainer>
</MainContainer>
