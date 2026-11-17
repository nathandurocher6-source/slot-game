<script lang="ts" module>
	import ClusterWinAmount, { type RawWin, type Win } from './ClusterWinAmount.svelte';

	export type EmitterEventClusterWinAmounts = {
		type: 'showClusterWinAmounts';
		wins: RawWin[];
	};
</script>

<script lang="ts">
	import { waitForResolve } from 'utils-shared/wait';
	import { stateBet } from 'state-shared';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';

	const context = getContext();

	let wins: Win[] = $state([]);

	context.eventEmitter.subscribeOnMount({
		showClusterWinAmounts: async (emitterEvent) => {
			wins = emitterEvent.wins.map((rawWin) => ({ ...rawWin, oncomplete: () => {} }));
			const maxTimeout = stateBet.isTurbo ? 500 : 1200;
			const getPromises = () =>
				wins.map(async (win) => {
					await Promise.race([
						waitForResolve((resolve) => (win.oncomplete = resolve)),
						new Promise((resolve) => setTimeout(resolve, maxTimeout)),
					]);
				});
			await Promise.race([
				Promise.all(getPromises()),
				new Promise((resolve) => setTimeout(resolve, maxTimeout + 100)),
			]);
			wins = [];
		},
	});
</script>

<BoardContainer>
	{#each wins as win (win.reel + '_' + win.row + '_' + win.result)}
		<ClusterWinAmount {win} />
	{/each}
</BoardContainer>
