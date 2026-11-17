<script lang="ts" module>
	export type EmitterEventTumbleWinAmount =
		| { type: 'tumbleWinAmountShow' }
		| { type: 'tumbleWinAmountHide' }
		| { type: 'tumbleWinAmountReset' }
		| {
				type: 'tumbleWinAmountUpdate';
				amount: number;
				baseAmount?: number;
				multiplier?: number;
				animate?: boolean;
		  };
</script>

<script lang="ts">
	import { stateBet } from 'state-shared';
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';

	import TumbleWinAmountWrap from './TumbleWinAmountWrap.svelte';
	import TumbleWinAmountFrame from './TumbleWinAmountFrame.svelte';
	import TumbleWinAmountText from './TumbleWinAmountText.svelte';
	import { getContext } from '../game/context';

	const context = getContext();

	let show = $state(false);
	let amount = $state(0);
	let baseAmount = $state<number | undefined>();
	let multiplier = $state<number | undefined>();
	let isEquation = $state(false);
	let animate = $state(false);
	let oncomplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		tumbleWinAmountShow: () => (show = true),
		tumbleWinAmountHide: () => {
			show = false;
			isEquation = false;
		},
		tumbleWinAmountReset: () => {
			amount = 0;
			baseAmount = undefined;
			multiplier = undefined;
			isEquation = false;
			animate = false;
			oncomplete = () => {};
		},
		tumbleWinAmountUpdate: async (emitterEvent) => {
			amount = emitterEvent.amount;
			animate = emitterEvent.animate ?? false;

			if (emitterEvent.multiplier && emitterEvent.multiplier > 1 && emitterEvent.baseAmount) {
				baseAmount = emitterEvent.baseAmount;
				multiplier = emitterEvent.multiplier;
				isEquation = true;

				// Audio cue for multiplier application
				context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_update' });

				// Display equation briefly with glowing aura before settling
				const equationDuration = stateBet.isTurbo ? 500 : 950;
				await waitForTimeout(equationDuration);
				isEquation = false;
			} else {
				isEquation = false;
				baseAmount = undefined;
				multiplier = undefined;
			}

			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

<TumbleWinAmountWrap {show}>
	<TumbleWinAmountFrame {isEquation}>
		{#snippet children({ frameSizes })}
			<TumbleWinAmountText
				{amount}
				{baseAmount}
				{multiplier}
				{isEquation}
				{animate}
				{oncomplete}
				width={frameSizes.width}
			/>
		{/snippet}
	</TumbleWinAmountFrame>
</TumbleWinAmountWrap>
