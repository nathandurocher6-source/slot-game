<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut, backOut } from 'svelte/easing';
	import { Container, Rectangle, Text, Circle } from 'pixi-svelte';
	import { CanvasSizeRectangle, MainContainer, OnPressFullScreen } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { stateBet } from 'state-shared';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { getContext } from '../game/context';
	import type { WinLevelData } from '../game/winLevelMap';

	type Props = {
		amount: number; // in cents
		betAmount?: number; // base bet in currency units (default: stateBet.betAmount)
		winLevelData?: WinLevelData;
		isMaxWin?: boolean;
		oncomplete?: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	const baseBet = $derived(props.betAmount ?? stateBet.betAmount ?? 1);
	const targetAmount = $derived(props.amount);
	const ratio = $derived((targetAmount / 100) / (baseBet > 0 ? baseBet : 1));

	type CelebrationTier = 'STANDARD' | 'BIG' | 'MEGA' | 'EPIC' | 'SENSATIONAL' | 'MAX_WIN';

	const tier = $derived.by((): CelebrationTier => {
		if (props.isMaxWin || ratio >= 100000 || props.winLevelData?.alias === 'max') {
			return 'MAX_WIN';
		}
		if (ratio >= 100) return 'SENSATIONAL';
		if (ratio >= 60) return 'EPIC';
		if (ratio >= 30) return 'MEGA';
		if (ratio >= 15) return 'BIG';
		return 'STANDARD';
	});

	type TierTheme = {
		title: string;
		subtitle?: string;
		border: number;
		glow: number;
		textColor: number;
		durationMs: number;
		badgeBg: number;
	};

	const theme = $derived.by((): TierTheme => {
		switch (tier) {
			case 'MAX_WIN':
				return {
					title: 'MAX WIN',
					subtitle: 'PLAFOND ATTEINT : x100 000',
					border: 0xffd700,
					glow: 0xffaa00,
					textColor: 0xfff070,
					durationMs: 4500,
					badgeBg: 0x3d2b00,
				};
			case 'SENSATIONAL':
				return {
					title: 'SENSATIONAL WIN',
					subtitle: `${ratio.toFixed(0)}x MULTIPLIER`,
					border: 0xdb24f5,
					glow: 0x9b30ff,
					textColor: 0xf99eff,
					durationMs: 3800,
					badgeBg: 0x36053d,
				};
			case 'EPIC':
				return {
					title: 'EPIC WIN',
					subtitle: `${ratio.toFixed(0)}x MULTIPLIER`,
					border: 0xff3b30,
					glow: 0xff6b5b,
					textColor: 0xff8f85,
					durationMs: 3200,
					badgeBg: 0x380906,
				};
			case 'MEGA':
				return {
					title: 'MEGA WIN',
					subtitle: `${ratio.toFixed(0)}x MULTIPLIER`,
					border: 0x00d2ff,
					glow: 0x2565c7,
					textColor: 0x7be5f5,
					durationMs: 2800,
					badgeBg: 0x052136,
				};
			case 'BIG':
				return {
					title: 'BIG WIN',
					subtitle: `${ratio.toFixed(0)}x MULTIPLIER`,
					border: 0xf5a623,
					glow: 0xe59400,
					textColor: 0xffe169,
					durationMs: 2400,
					badgeBg: 0x302004,
				};
			default:
				return {
					title: 'WIN',
					subtitle: undefined,
					border: 0x4a5d75,
					glow: 0x253245,
					textColor: 0xffffff,
					durationMs: 1400,
					badgeBg: 0x161e29,
				};
		}
	});

	let countUpAmount = $state(0);
	let countUpCompleted = $state(false);
	const scale = new Tween(0.85);

	let countUpRaf: number | null = null;

	const startCountUp = () => {
		const startMs = performance.now();
		const duration = theme.durationMs;
		const startVal = 0;
		const endVal = targetAmount;

		const step = (now: number) => {
			const elapsed = now - startMs;
			const progress = Math.min(1, elapsed / duration);
			// Smooth cubic easing
			const ease = cubicOut(progress);
			countUpAmount = Math.round(startVal + (endVal - startVal) * ease);

			if (progress < 1) {
				countUpRaf = requestAnimationFrame(step);
			} else {
				countUpAmount = endVal;
				countUpCompleted = true;
				scheduleAutoDismiss();
			}
		};

		countUpRaf = requestAnimationFrame(step);
	};

	let autoDismissTimeout: ReturnType<typeof setTimeout> | null = null;

	const stopAllAnimations = () => {
		if (countUpRaf) {
			cancelAnimationFrame(countUpRaf);
			countUpRaf = null;
		}
		if (rayRaf) {
			cancelAnimationFrame(rayRaf);
			rayRaf = null;
		}
		if (autoDismissTimeout) {
			clearTimeout(autoDismissTimeout);
			autoDismissTimeout = null;
		}
	};

	const scheduleAutoDismiss = () => {
		if (autoDismissTimeout) clearTimeout(autoDismissTimeout);

		const isTurbo = stateBet.isTurbo;
		const isAuto = context.stateXstateDerived.isAutoBetting();
		const isMax = tier === 'MAX_WIN';

		const delay = isTurbo ? (isMax ? 1400 : 600) : isAuto ? (isMax ? 2000 : 1200) : (isMax ? 3500 : 2500);

		autoDismissTimeout = setTimeout(() => {
			stopAllAnimations();
			props.oncomplete?.();
		}, delay);
	};

	const skipOrContinue = () => {
		if (autoDismissTimeout) clearTimeout(autoDismissTimeout);

		if (!countUpCompleted) {
			// Skip count-up
			if (countUpRaf) cancelAnimationFrame(countUpRaf);
			countUpRaf = null;
			countUpAmount = targetAmount;
			countUpCompleted = true;
			scheduleAutoDismiss();
		} else {
			// Complete modal
			stopAllAnimations();
			props.oncomplete?.();
		}
	};

	let rayRotation = $state(0);
	let rayRaf: number | null = null;
	const animateRays = () => {
		rayRotation += 0.008;
		rayRaf = requestAnimationFrame(animateRays);
	};

	const sparklePulse = $derived(0.45 + 0.55 * Math.abs(Math.sin(rayRotation * 3.5)));

	onMount(() => {
		scale.set(1.0, { duration: 250, easing: backOut });
		startCountUp();
		rayRaf = requestAnimationFrame(animateRays);
	});

	onDestroy(() => {
		stopAllAnimations();
	});

	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const CARD_WIDTH = $derived(Math.min(canvasSizes.width * 0.9, 560));
	const CARD_HEIGHT = $derived(tier === 'MAX_WIN' ? 260 : 220);
</script>

<!-- Completely transparent screen capture: background reels remain 100% visible and bright -->
<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0} zIndex={100} />

<!-- Fullscreen Click & Hotkey Handling -->
<OnHotkey hotkey="Space" onpress={skipOrContinue} />
<OnHotkey hotkey="Enter" onpress={skipOrContinue} />
<OnPressFullScreen onpress={skipOrContinue} />

<MainContainer>
	<Container
		x={context.stateGameDerived.boardLayout().x}
		y={context.stateGameDerived.boardLayout().y}
		scale={{ x: scale.current, y: scale.current }}
		zIndex={101}
	>
		<!-- 1. Radial Sunburst Light Rays behind badge -->
		<Container rotation={rayRotation}>
			{#each [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as angle}
				<Rectangle
					width={CARD_WIDTH * 1.55}
					height={4}
					rotation={(angle * Math.PI) / 180}
					backgroundColor={theme.border}
					backgroundAlpha={0.18}
					anchor={0.5}
				/>
			{/each}
		</Container>

		<!-- 2. Concentric Radial Glow Halos (Pragmatic / Hacksaw focal aura) -->
		<Circle
			diameter={CARD_WIDTH * 1.3}
			backgroundColor={theme.glow}
			backgroundAlpha={0.16}
			anchor={0.5}
		/>
		<Circle
			diameter={CARD_WIDTH * 0.95}
			backgroundColor={theme.glow}
			backgroundAlpha={0.25}
			anchor={0.5}
		/>
		<Circle
			diameter={CARD_WIDTH * 0.7}
			backgroundColor={theme.border}
			backgroundAlpha={0.32}
			anchor={0.5}
		/>

		<!-- 3. Deep Drop Shadow Plate (Ensures razor-sharp contrast against bright reel symbols) -->
		<Rectangle
			y={7}
			width={CARD_WIDTH + 14}
			height={CARD_HEIGHT + 14}
			borderRadius={28}
			backgroundColor={0x000000}
			backgroundAlpha={0.92}
			anchor={0.5}
		/>

		<!-- 4. Modal Card Base (Dark metallic card with thick neon/gold border) -->
		<Rectangle
			width={CARD_WIDTH}
			height={CARD_HEIGHT}
			borderRadius={24}
			backgroundColor={0x080c14}
			backgroundAlpha={0.98}
			borderColor={theme.border}
			borderWidth={3}
			anchor={0.5}
		/>

		<!-- 5. Inner Rim Chamfer Highlight -->
		<Rectangle
			width={CARD_WIDTH - 6}
			height={CARD_HEIGHT - 6}
			borderRadius={21}
			backgroundColor={0x000000}
			backgroundAlpha={0}
			borderColor={0xffffff}
			borderWidth={1}
			borderAlpha={0.25}
			anchor={0.5}
		/>

		<!-- 6. Sparkling Star Particles orbiting the badge -->
		<Container>
			<!-- Top-Left Sparkle -->
			<Rectangle
				x={-CARD_WIDTH * 0.46}
				y={-CARD_HEIGHT * 0.46}
				width={12}
				height={12}
				rotation={Math.PI / 4 + rayRotation}
				backgroundColor={0xffffff}
				backgroundAlpha={sparklePulse}
				anchor={0.5}
			/>
			<!-- Top-Right Sparkle -->
			<Rectangle
				x={CARD_WIDTH * 0.46}
				y={-CARD_HEIGHT * 0.46}
				width={10}
				height={10}
				rotation={Math.PI / 4 - rayRotation}
				backgroundColor={theme.border}
				backgroundAlpha={sparklePulse}
				anchor={0.5}
			/>
			<!-- Bottom-Left Sparkle -->
			<Rectangle
				x={-CARD_WIDTH * 0.46}
				y={CARD_HEIGHT * 0.46}
				width={10}
				height={10}
				rotation={Math.PI / 4 - rayRotation}
				backgroundColor={theme.border}
				backgroundAlpha={sparklePulse}
				anchor={0.5}
			/>
			<!-- Bottom-Right Sparkle -->
			<Rectangle
				x={CARD_WIDTH * 0.46}
				y={CARD_HEIGHT * 0.46}
				width={12}
				height={12}
				rotation={Math.PI / 4 + rayRotation}
				backgroundColor={0xffffff}
				backgroundAlpha={sparklePulse}
				anchor={0.5}
			/>
			<!-- Mid-Left Sparkle -->
			<Rectangle
				x={-CARD_WIDTH * 0.52}
				y={0}
				width={8}
				height={8}
				rotation={Math.PI / 4 + rayRotation}
				backgroundColor={0xffffff}
				backgroundAlpha={sparklePulse * 0.8}
				anchor={0.5}
			/>
			<!-- Mid-Right Sparkle -->
			<Rectangle
				x={CARD_WIDTH * 0.52}
				y={0}
				width={8}
				height={8}
				rotation={Math.PI / 4 - rayRotation}
				backgroundColor={theme.border}
				backgroundAlpha={sparklePulse * 0.8}
				anchor={0.5}
			/>
		</Container>

		<!-- 7. Top Header Badge -->
		<Rectangle
			y={-CARD_HEIGHT * 0.5 + 24}
			width={230}
			height={34}
			borderRadius={10}
			backgroundColor={theme.badgeBg}
			borderColor={theme.border}
			borderWidth={1.5}
			anchor={0.5}
		/>

		<Text
			y={-CARD_HEIGHT * 0.5 + 24}
			text={theme.title}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 16,
				fontWeight: '900',
				fill: theme.textColor,
				letterSpacing: 2,
			}}
		/>

		<!-- Max Win Special Banner -->
		{#if tier === 'MAX_WIN'}
			<Text
				y={-CARD_HEIGHT * 0.5 + 62}
				text="★ 100 000X WIN CAP REACHED ★"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 13,
					fontWeight: '800',
					fill: 0xffd700,
					letterSpacing: 1.5,
				}}
			/>
		{/if}

		<!-- Count-Up Win Amount -->
		<Text
			y={tier === 'MAX_WIN' ? 12 : -6}
			text={bookEventAmountToCurrencyString(countUpAmount)}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: CARD_WIDTH < 400 ? 34 : 44,
				fontWeight: '900',
				fill: 0xffffff,
			}}
		/>

		<!-- Multiplier Ratio Pill -->
		{#if theme.subtitle}
			<Rectangle
				y={tier === 'MAX_WIN' ? 62 : 44}
				width={180}
				height={26}
				borderRadius={8}
				backgroundColor={0x161e2b}
				borderColor={theme.border}
				borderWidth={1}
				anchor={0.5}
			/>
			<Text
				y={tier === 'MAX_WIN' ? 62 : 44}
				text={theme.subtitle}
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 11,
					fontWeight: '800',
					fill: theme.textColor,
					letterSpacing: 1,
				}}
			/>
		{/if}

		<!-- Skip / Continue Prompt -->
		<Text
			y={CARD_HEIGHT * 0.5 - 20}
			text={countUpCompleted ? 'CLICK OR PRESS SPACE TO CONTINUE' : 'CLICK OR SPACE TO SKIP'}
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 10.5,
				fontWeight: '700',
				fill: countUpCompleted ? 0x94a3b8 : 0x64748b,
				letterSpacing: 1.5,
			}}
		/>
	</Container>
</MainContainer>
