<script lang="ts" module>
	export type EmitterEventMultiplierGrid =
		| { type: 'multiplierGridShow' }
		| { type: 'multiplierGridHide' }
		| { type: 'multiplierGridUpdate'; grid: number[][] }
		| { type: 'multiplierGridClear' };
</script>

<script lang="ts">
	import { Container, Rectangle, Text } from 'pixi-svelte';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();
	const DEFAULT_GRID = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
	];

	let show = $state(false);
	let grid = $state(DEFAULT_GRID);

	context.eventEmitter.subscribeOnMount({
		multiplierGridShow: () => (show = true),
		multiplierGridHide: () => (show = false),
		multiplierGridUpdate: (emitterEvent) => (grid = emitterEvent.grid),
		multiplierGridClear: () => (grid = DEFAULT_GRID),
	});
</script>

<BoardContainer>
	{#if show}
		{#each grid as reel, reelIndex}
			{#each reel as multiplier, rowIndex}
				{#if multiplier > 0}
					<Container x={(reelIndex + 0.5) * SYMBOL_SIZE} y={(rowIndex + 0.5) * SYMBOL_SIZE}>
						<!-- Highlight Outline -->
						<Rectangle
							width={SYMBOL_SIZE - 8}
							height={SYMBOL_SIZE - 8}
							borderRadius={12}
							backgroundColor={0xffd700}
							backgroundAlpha={0.15}
							borderColor={0xffd700}
							borderWidth={1.5}
							anchor={0.5}
						/>
						{#if multiplier > 1}
							<Rectangle
								y={24}
								width={48}
								height={20}
								borderRadius={5}
								backgroundColor={0x0b131c}
								borderColor={0xffd700}
								borderWidth={1}
								anchor={0.5}
							/>
							<Text
								y={24}
								anchor={0.5}
								text={`x${multiplier}`}
								style={{
									fontFamily: 'system-ui, -apple-system, sans-serif',
									fontSize: 11,
									fontWeight: '800',
									fill: 0xffe066,
								}}
							/>
						{/if}
					</Container>
				{/if}
			{/each}
		{/each}
	{/if}
</BoardContainer>
