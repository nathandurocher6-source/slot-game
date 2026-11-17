import { setContextEventEmitter, getContextEventEmitter } from 'utils-event-emitter';
import { setContextXstate, getContextXstate } from 'utils-xstate';
import { setContextLayout, getContextLayout } from 'utils-layout';
import { setContextApp, getContextApp } from 'pixi-svelte';
import { stateMeta, stateBet, stateConfig } from 'state-shared';

import { eventEmitter, type EmitterEvent } from './eventEmitter';
import { stateXstate, stateXstateDerived } from './stateXstate';
import { stateLayout, stateLayoutDerived } from './stateLayout';
import { stateApp } from './stateApp';

import { stateGame, stateGameDerived } from './stateGame.svelte';
import { i18nDerived } from '../i18n/i18nDerived';
import { initMockRgs } from './mockRgs';

export const initBetModes = () => {
	const baseMeta = {
		mode: 'base',
		costMultiplier: 1.0,
		type: 'default' as const,
		parent: '',
		children: '',
		assets: {
			icon: '',
			dialogImage: '',
			dialogVolatility: '',
			volatility: '',
			button: '',
		},
		text: {
			title: 'BASE GAME',
			dialog: 'Standard 5x5 Cluster cascading spin.',
			button: 'BASE',
			betAmountLabel: 'BASE',
			tickerIdle: 'GREYBOX 5X5 STUDIO',
			tickerSpin: 'SPINNING...',
			bannerText: '',
		},
		maxWin: 100000,
	};

	const boosterMeta = {
		mode: 'bonus_booster',
		costMultiplier: 3.0,
		type: 'activate' as const,
		parent: '',
		children: '',
		assets: {
			icon: '',
			dialogImage: '',
			dialogVolatility: '',
			volatility: '',
			button: '',
		},
		text: {
			title: 'BONUS BOOSTER',
			dialog: '3x bet cost. Triples your chance of triggering FREE SPINS with elevated Scatter drops.',
			description: 'Greatly increases the chance of landing Scatter (S) symbols.',
			button: 'ACTIVATE',
			betAmountLabel: 'BOOSTER 3X',
			tickerIdle: 'BONUS BOOSTER ACTIVE',
			tickerSpin: 'GOOD LUCK',
			bannerText: 'BOOSTER 3X ACTIVE',
		},
		maxWin: 100000,
	};

	const buyMeta = {
		mode: 'bonus_buy',
		costMultiplier: 100.0,
		type: 'buy' as const,
		parent: '',
		children: '',
		assets: {
			icon: '',
			dialogImage: '',
			dialogVolatility: '',
			volatility: '',
			button: '',
		},
		text: {
			title: 'BONUS BUY',
			dialog: '100x bet cost. Guaranteed 3+ Scatters on the first spin to immediately trigger the FREE SPINS round with progressive multiplier.',
			description: 'Direct entry into Free Spins with progressive multiplier.',
			button: 'BUY 100X',
			betAmountLabel: 'BONUS BUY 100X',
			tickerIdle: 'READY TO BUY BONUS',
			tickerSpin: 'FREE SPINS TRIGGERED',
			bannerText: 'BONUS BUY',
		},
		maxWin: 100000,
	};

	stateMeta.betModeMeta = {
		base: baseMeta,
		bonus_booster: boosterMeta,
		bonus_buy: buyMeta,
	};
};

export const setContext = () => {
	initMockRgs();
	initBetModes();

	// Baseline defaults for local dev server & Storybook
	if (!stateBet.currency) stateBet.currency = 'USD';
	if (stateBet.balanceAmount === 0 || !stateBet.balanceAmount) stateBet.balanceAmount = 10000.0;
	if (!stateBet.betAmount) stateBet.betAmount = 1.0;
	if (!stateBet.wageredBetAmount) stateBet.wageredBetAmount = 1.0;
	if (!stateConfig.betAmountOptions || stateConfig.betAmountOptions.length === 0) {
		stateConfig.betAmountOptions = [
			0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 3.0, 5.0, 10.0, 20.0, 50.0, 100.0,
		];
	}
	if (!stateConfig.betMenuOptions || stateConfig.betMenuOptions.length === 0) {
		stateConfig.betMenuOptions = [
			0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 3.0, 5.0, 10.0, 20.0, 50.0, 100.0,
		];
	}

	setContextEventEmitter<EmitterEvent>({ eventEmitter });
	setContextXstate({ stateXstate, stateXstateDerived });
	setContextLayout({ stateLayout, stateLayoutDerived });
	setContextApp({ stateApp });
};

export const getContext = () => ({
	...getContextEventEmitter<EmitterEvent>(),
	...getContextLayout(),
	...getContextXstate(),
	...getContextApp(),
	stateGame,
	stateGameDerived,
	i18nDerived,
});
