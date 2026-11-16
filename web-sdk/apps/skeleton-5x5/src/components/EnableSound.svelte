<script lang="ts">
	import { onMount } from 'svelte';

	import type { LoadedAudio } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { sound, type SoundName } from '../game/sound';

	const context = getContext();

	onMount(() => {
		const loadedAudio = $state.snapshot(
			context.stateApp.loadedAssets?.['sound'],
		) as LoadedAudio<SoundName> | undefined;

		// Defensive protection: if sound asset is undefined or has no valid src, bypass safely
		if (!loadedAudio || !loadedAudio.src) {
			console.warn('[Audio] Sound asset not available, audio playback bypassed');
			return;
		}

		try {
			const { destroy } = sound.load(loadedAudio);

			return () => {
				// Equivalent to onDestroy(); Leave this comment for searching.
				destroy();
			};
		} catch (error) {
			console.warn('[Audio] Failed to initialize sound system:', error);
		}
	});

	sound.enableEffect();
	sound.volumeEffect();
</script>
