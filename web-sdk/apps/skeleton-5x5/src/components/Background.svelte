<script lang="ts">
	import { Container, Rectangle } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { SECOND } from 'constants-shared/time';
	import { getContext } from '../game/context';

	const context = getContext();
	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const showBaseBackground = $derived(context.stateGame.gameType === 'basegame');
	const showFeatureBackground = $derived(context.stateGame.gameType === 'freegame');
</script>

<!-- Deep Dark Studio Backdrop -->
<Rectangle {...canvasSizes} backgroundColor={0x0a0d13} zIndex={-4} />

<!-- Base Game Greybox Studio Grid Accent -->
<FadeContainer show={showBaseBackground} duration={SECOND * 0.5} zIndex={-3}>
	<Container
		x={canvasSizes.width * 0.5}
		y={canvasSizes.height * 0.5}
	>
		<!-- Center Board Ambient Glow -->
		<Rectangle
			width={Math.min(canvasSizes.width * 0.85, 900)}
			height={Math.min(canvasSizes.height * 0.85, 900)}
			borderRadius={32}
			backgroundColor={0x131923}
			backgroundAlpha={0.65}
			borderColor={0x1e2736}
			borderWidth={1}
			anchor={0.5}
		/>
	</Container>
</FadeContainer>

<!-- Free Spins Feature Cyber-Neon Atmosphere -->
<FadeContainer show={showFeatureBackground} duration={SECOND * 0.5} zIndex={-2}>
	<Container
		x={canvasSizes.width * 0.5}
		y={canvasSizes.height * 0.5}
	>
		<!-- Feature Ambient Glow (Cyber Violet / Gold) -->
		<Rectangle
			width={Math.min(canvasSizes.width * 0.9, 950)}
			height={Math.min(canvasSizes.height * 0.9, 950)}
			borderRadius={36}
			backgroundColor={0x261136}
			backgroundAlpha={0.7}
			borderColor={0x9b30ff}
			borderWidth={1.5}
			borderAlpha={0.6}
			anchor={0.5}
		/>
	</Container>
</FadeContainer>
