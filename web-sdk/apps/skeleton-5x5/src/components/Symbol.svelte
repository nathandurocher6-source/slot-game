<script lang="ts">
	import SymbolGreybox from './SymbolGreybox.svelte';
	import type { SymbolState, RawSymbol } from '../game/types';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
</script>

<SymbolGreybox
	x={props.x}
	y={props.y}
	state={props.state}
	rawSymbol={props.rawSymbol}
	oncomplete={props.oncomplete}
	loop={props.loop}
/>
