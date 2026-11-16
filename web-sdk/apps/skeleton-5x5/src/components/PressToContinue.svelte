<script lang="ts">
	import { MainContainer, OnPressFullScreen } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { Container, Rectangle, Text } from 'pixi-svelte';

	import { getContext } from '../game/context';

	type Props = {
		onpress: () => void;
	};

	const props: Props = $props();
	const context = getContext();
</script>

<MainContainer alignVertical="bottom">
	<Container
		x={context.stateLayoutDerived.mainLayout().width * 0.5}
		y={context.stateLayoutDerived.mainLayout().height - 35}
	>
		<Rectangle
			width={360}
			height={34}
			borderRadius={10}
			backgroundColor={0x0b1118}
			backgroundAlpha={0.85}
			borderColor={0x2b384c}
			borderWidth={1}
			anchor={0.5}
		/>
		<Text
			text="CLICK ANYWHERE OR PRESS SPACE TO CONTINUE"
			anchor={0.5}
			style={{
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 10.5,
				fontWeight: '700',
				fill: 0xa0aec0,
				letterSpacing: 1.2,
			}}
		/>
	</Container>
</MainContainer>

<OnHotkey hotkey="Space" onpress={() => props.onpress()} />
<OnHotkey hotkey="Enter" onpress={() => props.onpress()} />
<OnPressFullScreen onpress={() => props.onpress()} />
