<script lang="ts">
	import { onMount } from 'svelte';
	import { CanvasSizeRectangle } from 'components-layout';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	const alpha = new Tween(0);

	onMount(async () => {
		await alpha.set(0.9, { duration: 150, easing: cubicInOut });
		props.oncomplete?.();
		await alpha.set(0, { duration: 150, easing: cubicInOut });
	});
</script>

<CanvasSizeRectangle backgroundColor={0x080b10} backgroundAlpha={alpha.current} zIndex={200} />
