<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { Text } from 'pixi-svelte';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	type Props = {
		width: number;
		amount: number;
		animate: boolean;
		oncomplete: () => void;
	};

	const props: Props = $props();
	const scale = new Tween(1);

	$effect(() => {
		if (props.amount > 0) {
			scale.set(1.22, { duration: 90, easing: cubicOut }).then(() => {
				scale.set(1.0, { duration: 110 });
				props.oncomplete();
			});
		} else {
			props.oncomplete();
		}
	});
</script>

<Text
	y={4}
	text={bookEventAmountToCurrencyString(props.amount)}
	anchor={0.5}
	scale={{ x: scale.current, y: scale.current }}
	style={{
		fontFamily: 'system-ui, -apple-system, sans-serif',
		fontSize: 20,
		fontWeight: '800',
		fill: 0xffffff,
	}}
/>
