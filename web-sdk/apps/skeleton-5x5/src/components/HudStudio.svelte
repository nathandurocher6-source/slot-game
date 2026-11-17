<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { stateBet, stateBetDerived, stateConfig, stateModal, stateSound } from 'state-shared';
	import { OnHotkey } from 'components-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { getContext } from '../game/context';

	const context = getContext();

	let stopDisabled = $state(false);

	const isIdle = $derived(context.stateXstateDerived.isIdle());
	const canAffordBet = $derived(stateBetDerived.isBetCostAvailable());
	const hasAutoSpin = $derived(stateBetDerived.hasAutoBetCounter());
	const isTurbo = $derived(stateBet.isTurbo);
	const isMuted = $derived(stateSound.volumeValueMaster === 0);

	const activeMode = $derived(stateBetDerived.activeBetMode());
	const isBoosterActive = $derived(activeMode?.type === 'activate');

	const betCostMultiplier = $derived(activeMode?.costMultiplier ?? 1.0);
	const effectiveBetAmount = $derived(stateBet.betAmount * betCostMultiplier);

	// Win amount calculation from official SDK property stateBet.winBookEventAmount
	const safeWinRaw = $derived(Number(stateBet.winBookEventAmount) || 0);
	const safeWager = $derived(Number(stateBet.wageredBetAmount) || Number(stateBet.betAmount) || 1);
	const targetWinAmount = $derived((safeWinRaw / 100) * safeWager);

	const winTween = new Tween(0);

	$effect(() => {
		const target = Number(targetWinAmount) || 0;
		if (target === 0) {
			winTween.set(0, { duration: 0 });
		} else {
			winTween.set(target, { duration: isTurbo ? 220 : 450, easing: cubicOut });
		}
	});

	const safeWinAnimated = $derived(Number(winTween.current) || 0);
	const winDisplay = $derived(numberToCurrencyString(safeWinAnimated));
	const hasWin = $derived(safeWinRaw > 0);

	const safeBalance = $derived(Number(stateBet.balanceAmount) || 0);
	const balanceDisplay = $derived(numberToCurrencyString(safeBalance));

	const safeEffectiveBet = $derived(Number(effectiveBetAmount) || 0);
	const betDisplay = $derived(numberToCurrencyString(safeEffectiveBet));

	const biggestBet = $derived(stateConfig.betAmountOptions[stateConfig.betAmountOptions.length - 1]);
	const smallestBet = $derived(stateConfig.betAmountOptions[0]);

	const canIncrease = $derived(isIdle && stateBet.betAmount < biggestBet);
	const canDecrease = $derived(isIdle && stateBet.betAmount > smallestBet);

	const spinOrStop = () => {
		context.eventEmitter.broadcast({ type: 'soundPressBet' });

		if (isIdle) {
			if (!canAffordBet) return;
			if (activeMode?.type === 'buy') {
				stateBet.activeBetModeKey = 'base';
			}
			context.eventEmitter.broadcast({ type: 'bet' });
		} else {
			if (!stopDisabled) {
				if (hasAutoSpin) stateBet.autoSpinsCounter = 0;
				context.eventEmitter.broadcast({ type: 'stopButtonClick' });
			}
		}
	};

	const toggleTurbo = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true });
	};

	const toggleAutoSpin = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		if (hasAutoSpin) {
			stateBet.autoSpinsCounter = 0;
		} else {
			stateModal.modal = { name: 'autoSpin' };
		}
	};

	const increaseBet = () => {
		if (!canIncrease) return;
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		const nextBigger = [...stateConfig.betAmountOptions]
			.sort((a, b) => a - b)
			.find((opt) => opt > stateBet.betAmount);
		stateBetDerived.setBetAmount(nextBigger || biggestBet);
	};

	const decreaseBet = () => {
		if (!canDecrease) return;
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		const nextSmaller = [...stateConfig.betAmountOptions]
			.sort((a, b) => b - a)
			.find((opt) => opt < stateBet.betAmount);
		stateBetDerived.setBetAmount(nextSmaller || smallestBet);
	};

	const openPayTable = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'payTable' };
	};

	const openBuyBonus = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		if (isBoosterActive) {
			stateBet.activeBetModeKey = 'base';
		} else {
			stateModal.modal = { name: 'buyBonus' };
		}
	};

	const toggleSound = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateSound.volumeValueMaster = stateSound.volumeValueMaster === 0 ? 50 : 0;
	};

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => (stopDisabled = true),
		stopButtonEnable: () => (stopDisabled = false),
	});
</script>

<OnHotkey hotkey="Space" disabled={isIdle && !canAffordBet} onpress={spinOrStop} />

<!-- Top Brand Header Bar -->
<div class="studio-top-bar">
	<div class="top-title">
		<span class="top-badge">GREYBOX</span>
		<span class="top-name">SKELETON 5X5</span>
	</div>
	<div class="top-studio">
		<span class="studio-tag">STAKE ENGINE</span>
	</div>
</div>

<!-- Dedicated Hacksaw/Stake Style BUY BONUS side button (Desktop) -->
{#if context.stateGame.gameType === 'basegame'}
	<div class="side-bonus-container" class:booster-on={isBoosterActive}>
		<button class="side-bonus-btn" onclick={openBuyBonus} title="Menu Achat de Bonus">
			<span class="bonus-tag">{isBoosterActive ? 'ACTIVE' : 'FEATURE'}</span>
			<span class="bonus-title">{isBoosterActive ? 'BOOSTER 3X' : 'BUY BONUS'}</span>
			<span class="bonus-subtitle">{isBoosterActive ? 'DESACTIVER' : '100X MISE'}</span>
		</button>
	</div>
{/if}

<!-- Studio Obsidian Bottom HUD Bar -->
<div class="studio-hud-bar">
	<!-- Left Section: Navigation / Info & Sound -->
	<div class="hud-left">
		<button class="hud-icon-btn" onclick={openPayTable} title="Règles & Paiements">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="16" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12.01" y2="8" />
			</svg>
		</button>
		<button class="hud-icon-btn" onclick={toggleSound} title={isMuted ? 'Activer le son' : 'Couper le son'}>
			{#if isMuted}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
					<line x1="23" y1="9" x2="17" y2="15" />
					<line x1="17" y1="9" x2="23" y2="15" />
				</svg>
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
					<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
				</svg>
			{/if}
		</button>
	</div>

	<!-- Center-Left Section: Balance & Win Meters -->
	<div class="hud-meters">
		<div class="meter-box">
			<span class="meter-label">SOLDE</span>
			<span class="meter-val">{balanceDisplay}</span>
		</div>
		<div class="meter-box" class:has-win={hasWin}>
			<span class="meter-label">GAIN</span>
			<span class="meter-val win-val">{winDisplay}</span>
		</div>
	</div>

	<!-- Right Section: Bet Controls, Turbo, Spin & Autoplay -->
	<div class="hud-actions">
		<!-- Bet Selector -->
		<div class="bet-selector">
			<button class="bet-step-btn" disabled={!canDecrease} onclick={decreaseBet} title="Diminuer la mise">−</button>
			<button class="bet-val-btn" onclick={() => (stateModal.modal = { name: 'betAmountMenu' })} title="Choisir la mise">
				<span class="bet-label">MISE</span>
				<span class="bet-number">{betDisplay}</span>
			</button>
			<button class="bet-step-btn" disabled={!canIncrease} onclick={increaseBet} title="Augmenter la mise">+</button>
		</div>

		<!-- Turbo Toggle Button -->
		<button class="hud-mode-btn" class:active={isTurbo} onclick={toggleTurbo} title={isTurbo ? 'Mode Turbo Actif' : 'Activer le mode Turbo'}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
				<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
			</svg>
			<span class="mode-text">TURBO</span>
		</button>

		<!-- Autoplay Button -->
		<button class="hud-mode-btn" class:active={hasAutoSpin} onclick={toggleAutoSpin} title={hasAutoSpin ? 'Arrêter les tours automatiques' : 'Tours Automatiques'}>
			{#if hasAutoSpin}
				<span class="auto-count">{stateBet.autoSpinsCounter}</span>
				<span class="mode-text">STOP</span>
			{:else}
				<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="23 4 23 10 17 10" />
					<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
				</svg>
				<span class="mode-text">AUTO</span>
			{/if}
		</button>

		<!-- Proeminent Circular SPIN Button -->
		<button
			class="spin-circle-btn"
			class:stopping={!isIdle}
			class:disabled={isIdle && !canAffordBet}
			disabled={isIdle && !canAffordBet}
			onclick={spinOrStop}
			title={isIdle ? 'Lancer un tour (Espace)' : 'Stopper le tour'}
		>
			<div class="spin-ring"></div>
			{#if isIdle}
				<svg class="spin-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="23 4 23 10 17 10" />
					<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
				</svg>
			{:else}
				<div class="stop-icon"></div>
			{/if}
		</button>
	</div>
</div>

<style lang="scss">
	/* Side BUY BONUS Button (Stake / Hacksaw layout) */
	.side-bonus-container {
		position: fixed;
		left: 24px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 60;

		@media (max-width: 960px) {
			left: 12px;
			top: auto;
			bottom: 84px;
			transform: none;
		}
	}

	.side-bonus-btn {
		width: 114px;
		height: 84px;
		background: linear-gradient(145deg, #180d28 0%, #0d101d 100%);
		border: 2px solid #a855f7;
		border-radius: 14px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(168, 85, 247, 0.35);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

		&:hover {
			transform: scale(1.04);
			border-color: #c084fc;
			box-shadow: 0 8px 30px rgba(168, 85, 247, 0.6);
		}

		&:active {
			transform: scale(0.96);
		}

		@media (max-width: 960px) {
			width: auto;
			height: 38px;
			padding: 0 14px;
			flex-direction: row;
			gap: 8px;
			border-radius: 20px;
		}
	}

	.side-bonus-container.booster-on .side-bonus-btn {
		background: linear-gradient(145deg, #072619 0%, #0b1419 100%);
		border-color: #00ff88;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 18px rgba(0, 255, 136, 0.45);
	}

	.bonus-tag {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 8.5px;
		font-weight: 900;
		letter-spacing: 1.2px;
		color: #ffffff;
		background: #a855f7;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.side-bonus-container.booster-on .bonus-tag {
		background: #00ff88;
		color: #062415;
	}

	.bonus-title {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 13px;
		font-weight: 900;
		color: #ffffff;
		letter-spacing: 0.8px;
	}

	.bonus-subtitle {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 10px;
		font-weight: 800;
		color: #c084fc;
		letter-spacing: 0.5px;
	}

	.side-bonus-container.booster-on .bonus-subtitle {
		color: #69f0ae;
	}

	/* Studio Obsidian Bottom Bar */
	.studio-hud-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 72px;
		background: linear-gradient(180deg, rgba(13, 16, 23, 0.94) 0%, rgba(8, 11, 16, 0.98) 100%);
		border-top: 1px solid #1e2638;
		box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		z-index: 55;
		color: #ffffff;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		user-select: none;

		@media (max-width: 768px) {
			height: 64px;
			padding: 0 10px;
		}
	}

	.hud-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.hud-icon-btn {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		background: #141a26;
		border: 1px solid #243046;
		color: #94a3b8;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s ease;

		&:hover {
			background: #1e2638;
			color: #ffffff;
			border-color: #3b4d70;
		}

		&:active {
			transform: scale(0.95);
		}
	}

	/* Balance & Win Encarts */
	.hud-meters {
		display: flex;
		align-items: center;
		gap: 12px;

		@media (max-width: 600px) {
			gap: 6px;
		}
	}

	.meter-box {
		background: rgba(18, 24, 36, 0.85);
		border: 1px solid #212c40;
		border-radius: 10px;
		padding: 5px 14px;
		display: flex;
		flex-direction: column;
		min-width: 100px;

		@media (max-width: 600px) {
			padding: 4px 8px;
			min-width: 80px;
		}

		&.has-win {
			border-color: #00ff88;
			background: rgba(0, 255, 136, 0.08);
		}
	}

	.meter-label {
		font-size: 9.5px;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 1px;
	}

	.meter-val {
		font-size: 14.5px;
		font-weight: 800;
		color: #ffffff;
		font-variant-numeric: tabular-nums;

		@media (max-width: 600px) {
			font-size: 13px;
		}
	}

	.win-val {
		color: #00ff88;
		text-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
	}

	/* Action Block */
	.hud-actions {
		display: flex;
		align-items: center;
		gap: 10px;

		@media (max-width: 768px) {
			gap: 6px;
		}
	}

	.bet-selector {
		display: flex;
		align-items: center;
		background: rgba(18, 24, 36, 0.85);
		border: 1px solid #212c40;
		border-radius: 10px;
		padding: 2px;
	}

	.bet-step-btn {
		width: 32px;
		height: 34px;
		border-radius: 8px;
		background: transparent;
		border: none;
		color: #94a3b8;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;

		&:hover:not(:disabled) {
			background: #1c2638;
			color: #ffffff;
		}

		&:disabled {
			opacity: 0.3;
			cursor: not-allowed;
		}
	}

	.bet-val-btn {
		background: transparent;
		border: none;
		padding: 2px 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		min-width: 70px;
	}

	.bet-label {
		font-size: 9px;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 1px;
	}

	.bet-number {
		font-size: 14px;
		font-weight: 800;
		color: #ffffff;
		font-variant-numeric: tabular-nums;
	}

	.hud-mode-btn {
		height: 38px;
		padding: 0 10px;
		border-radius: 10px;
		background: #141a26;
		border: 1px solid #243046;
		color: #64748b;
		display: flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
		transition: all 0.15s ease;

		&:hover {
			border-color: #3b4d70;
			color: #cbd5e1;
		}

		&.active {
			background: rgba(245, 166, 35, 0.16);
			border-color: #f5a623;
			color: #f5a623;
			box-shadow: 0 0 12px rgba(245, 166, 35, 0.3);
		}

		@media (max-width: 600px) {
			padding: 0 6px;
			.mode-text {
				display: none;
			}
		}
	}

	.mode-text {
		font-size: 10.5px;
		font-weight: 800;
		letter-spacing: 0.8px;
	}

	.auto-count {
		font-size: 12px;
		font-weight: 900;
		color: #00d2ff;
	}

	/* Proeminent Circular Spin Button */
	.spin-circle-btn {
		position: relative;
		width: 58px;
		height: 58px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #00ff88, #00b85c);
		border: 2px solid #5cffb0;
		color: #052615;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 0 20px rgba(0, 255, 136, 0.45), 0 4px 12px rgba(0, 0, 0, 0.5);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

		&:hover:not(:disabled) {
			transform: scale(1.06);
			box-shadow: 0 0 26px rgba(0, 255, 136, 0.7), 0 6px 16px rgba(0, 0, 0, 0.6);
		}

		&:active:not(:disabled) {
			transform: scale(0.95);
		}

		&.stopping {
			background: radial-gradient(circle at 35% 35%, #ef4444, #b91c1c);
			border-color: #fca5a5;
			color: #ffffff;
			box-shadow: 0 0 20px rgba(239, 68, 68, 0.55);
		}

		&.disabled {
			background: #1e2636;
			border-color: #334155;
			color: #475569;
			box-shadow: none;
			cursor: not-allowed;
		}

		@media (max-width: 600px) {
			width: 50px;
			height: 50px;
		}
	}

	.spin-icon {
		stroke: #052615;
	}

	.stop-icon {
		width: 18px;
		height: 18px;
		background: #ffffff;
		border-radius: 4px;
	}

	.studio-top-bar {
		position: fixed;
		top: 14px;
		left: 20px;
		right: 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		pointer-events: none;
		z-index: 50;
		user-select: none;
	}

	.top-title {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.top-badge {
		background: #16202c;
		color: #38bdf8;
		border: 1px solid #223247;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 1.5px;
		padding: 3px 6px;
		border-radius: 5px;
	}

	.top-name {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 14px;
		font-weight: 900;
		color: #ffffff;
		letter-spacing: 1.2px;
	}

	.studio-tag {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 11px;
		font-weight: 800;
		color: #64748b;
		letter-spacing: 2px;
	}
</style>
