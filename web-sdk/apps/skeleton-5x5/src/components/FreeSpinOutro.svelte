<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type EmitterEventFreeSpinOutro =
		| { type: 'freeSpinOutroShow' }
		| { type: 'freeSpinOutroHide' }
		| { type: 'freeSpinOutroCountUp'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { FadeContainer } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { waitForResolve } from 'utils-shared/wait';
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { stateBet } from 'state-shared';

	import { getContext } from '../game/context';

	const context = getContext();

	let show = $state(false);
	let amount = $state(0);
	let oncomplete = $state<() => void>(() => {});
	let autoTimeout: ReturnType<typeof setTimeout> | null = null;
	let hasResolved = false;

	const continueAction = () => {
		if (hasResolved) return;
		hasResolved = true;

		if (autoTimeout) {
			clearTimeout(autoTimeout);
			autoTimeout = null;
		}

		removeWindowListeners();
		oncomplete();
	};

	const onWindowPointer = () => {
		if (show) continueAction();
	};

	const onWindowKey = (e: KeyboardEvent) => {
		if (show && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape' || e.key === ' ')) {
			e.preventDefault();
			continueAction();
		}
	};

	const addWindowListeners = () => {
		if (typeof window !== 'undefined') {
			window.addEventListener('pointerdown', onWindowPointer, { capture: true });
			window.addEventListener('keydown', onWindowKey, { capture: true });
		}
	};

	const removeWindowListeners = () => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('pointerdown', onWindowPointer, { capture: true });
			window.removeEventListener('keydown', onWindowKey, { capture: true });
		}
	};

	onDestroy(() => {
		removeWindowListeners();
		if (autoTimeout) clearTimeout(autoTimeout);
	});

	context.eventEmitter.subscribeOnMount({
		freeSpinOutroShow: () => {
			show = true;
			hasResolved = false;
			addWindowListeners();
		},
		freeSpinOutroHide: async () => {
			show = false;
			removeWindowListeners();
			if (autoTimeout) clearTimeout(autoTimeout);
		},
		freeSpinOutroCountUp: async (emitterEvent) => {
			amount = emitterEvent.amount;
			hasResolved = false;
			addWindowListeners();

			// Auto-continue timer for Turbo / Autoplay / Safety fallback
			const isTurbo = stateBet.isTurbo;
			const isAuto = context.stateXstateDerived.isAutoBetting();
			const timeoutDuration = isTurbo ? 450 : isAuto ? 1000 : 3000;

			autoTimeout = setTimeout(() => {
				continueAction();
			}, timeoutDuration);

			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});

	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const CARD_WIDTH = $derived(Math.min(canvasSizes.width * 0.88, 540));
	const CARD_HEIGHT = 240;
</script>

<FadeContainer {show}>
	<!-- Transparent screen capture: grid remains 100% visible and bright -->
	<CanvasSizeRectangle
		backgroundColor={0x000000}
		backgroundAlpha={0}
		zIndex={100}
		eventMode="static"
		cursor="pointer"
		onpointerup={continueAction}
	/>

	<!-- Fullscreen Click & Hotkey Handling -->
	<OnHotkey hotkey="Space" onpress={continueAction} />
	<OnHotkey hotkey="Enter" onpress={continueAction} />

	<!-- Interactive Transparent Touch Overlay with high z-index -->
	<CanvasSizeRectangle
		backgroundColor={0xffffff}
		backgroundAlpha={0.0001}
		zIndex={120}
		eventMode="static"
		cursor="pointer"
		onpointerup={continueAction}
	/>

	<MainContainer>
		<Container
			x={context.stateGameDerived.boardLayout().x}
			y={context.stateGameDerived.boardLayout().y}
			zIndex={121}
			eventMode="static"
			cursor="pointer"
			onpointerup={continueAction}
		>
			<!-- Deep Drop Shadow Plate (High contrast over bright reels) -->
			<Rectangle
				y={7}
				width={CARD_WIDTH + 14}
				height={CARD_HEIGHT + 14}
				borderRadius={28}
				backgroundColor={0x000000}
				backgroundAlpha={0.92}
				anchor={0.5}
			/>

			<!-- Warm Gold Glow Halo Behind Modal -->
			<Rectangle
				width={CARD_WIDTH + 16}
				height={CARD_HEIGHT + 16}
				borderRadius={28}
				backgroundColor={0xffa500}
				backgroundAlpha={0.3}
				borderColor={0xffd700}
				borderWidth={2}
				anchor={0.5}
			/>

			<!-- Modal Card Base -->
			<Rectangle
				width={CARD_WIDTH}
				height={CARD_HEIGHT}
				borderRadius={22}
				backgroundColor={0x140e04}
				backgroundAlpha={0.98}
				borderColor={0xffd700}
				borderWidth={3}
				anchor={0.5}
			/>

			<!-- Header Badge -->
			<Rectangle
				y={-CARD_HEIGHT * 0.5 + 26}
				width={260}
				height={32}
				borderRadius={8}
				backgroundColor={0x332205}
				borderColor={0xffd700}
				borderWidth={1.5}
				anchor={0.5}
			/>

			<Text
				y={-CARD_HEIGHT * 0.5 + 26}
				text="BONUS COMPLETED"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 14,
					fontWeight: '900',
					fill: 0xffd700,
					letterSpacing: 2,
				}}
			/>

			<!-- Total Amount Won -->
			<Text
				y={-6}
				text={bookEventAmountToCurrencyString(amount)}
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 42,
					fontWeight: '900',
					fill: 0xffffff,
				}}
			/>

			<!-- Subtitle -->
			<Text
				y={40}
				text="TOTAL FREE SPINS PAYOUT"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 12,
					fontWeight: '700',
					fill: 0xffd066,
					letterSpacing: 1.2,
				}}
			/>

			<!-- Continue prompt -->
			<Text
				y={CARD_HEIGHT * 0.5 - 20}
				text="CLICK OR PRESS SPACE TO COLLECT"
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
