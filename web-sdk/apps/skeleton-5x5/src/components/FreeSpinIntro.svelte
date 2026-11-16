<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { CanvasSizeRectangle, MainContainer, OnPressFullScreen } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { FadeContainer } from 'components-pixi';
	import { waitForResolve } from 'utils-shared/wait';
	import { Container, Rectangle, Text } from 'pixi-svelte';

	import { getContext } from '../game/context';

	const context = getContext();

	let show = $state(false);
	let totalFreeSpins = $state(0);
	let oncomplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => (show = true),
		freeSpinIntroHide: () => (show = false),
		freeSpinIntroUpdate: async (emitterEvent) => {
			totalFreeSpins = emitterEvent.totalFreeSpins;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});

	const continueAction = () => {
		oncomplete();
	};

	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const CARD_WIDTH = $derived(Math.min(canvasSizes.width * 0.88, 540));
	const CARD_HEIGHT = 240;
</script>

<FadeContainer {show}>
	<!-- Dark Screen Blur Backdrop -->
	<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0.82} zIndex={100} />

	<!-- Fullscreen Click & Hotkey Handling -->
	<OnHotkey hotkey="Space" onpress={continueAction} />
	<OnHotkey hotkey="Enter" onpress={continueAction} />
	<OnPressFullScreen onpress={continueAction} />

	<MainContainer>
		<Container
			x={context.stateGameDerived.boardLayout().x}
			y={context.stateGameDerived.boardLayout().y}
			zIndex={101}
		>
			<!-- Glow Accent -->
			<Rectangle
				width={CARD_WIDTH + 14}
				height={CARD_HEIGHT + 14}
				borderRadius={28}
				backgroundColor={0xff007f}
				backgroundAlpha={0.25}
				borderColor={0xff007f}
				borderWidth={2}
				anchor={0.5}
			/>

			<!-- Modal Card Base -->
			<Rectangle
				width={CARD_WIDTH}
				height={CARD_HEIGHT}
				borderRadius={22}
				backgroundColor={0x180924}
				backgroundAlpha={0.96}
				borderColor={0xff007f}
				borderWidth={2.5}
				anchor={0.5}
			/>

			<!-- Header Badge -->
			<Rectangle
				y={-CARD_HEIGHT * 0.5 + 26}
				width={260}
				height={32}
				borderRadius={8}
				backgroundColor={0x330940}
				borderColor={0xff007f}
				borderWidth={1.5}
				anchor={0.5}
			/>

			<Text
				y={-CARD_HEIGHT * 0.5 + 26}
				text="BONUS FEATURE"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 14,
					fontWeight: '900',
					fill: 0xff66b2,
					letterSpacing: 2,
				}}
			/>

			<!-- Total Spins Awarded Text -->
			<Text
				y={-6}
				text={`${totalFreeSpins} FREE SPINS`}
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 38,
					fontWeight: '900',
					fill: 0xffffff,
				}}
			/>

			<!-- Subtitle -->
			<Text
				y={40}
				text="PROGRESSIVE GLOBAL MULTIPLIER ACTIVE"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 12,
					fontWeight: '700',
					fill: 0x00ff66,
					letterSpacing: 1.2,
				}}
			/>

			<!-- Continue prompt -->
			<Text
				y={CARD_HEIGHT * 0.5 - 20}
				text="CLICK OR PRESS SPACE TO START"
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
