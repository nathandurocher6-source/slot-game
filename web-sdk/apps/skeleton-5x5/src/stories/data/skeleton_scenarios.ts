import extracted from './extracted_books.json';
import type { Bet } from '../../game/typesBookEvent';

// Scenario 1: Real Losing Spin from Math Engine
export const losingRound: Bet = {
	id: 'scenario_losing',
	bet: 100,
	payout: 0,
	event: 0,
	state: extracted.losingRound.events as any,
};

// Scenario 2: Real Tumble with Multiplier Bomb sequence from Math Engine
export const tumbleMultRound: Bet = {
	id: 'scenario_tumble_mult',
	bet: 100,
	payout: extracted.tumbleMultRound.payout,
	event: 0,
	state: extracted.tumbleMultRound.events as any,
};

// Scenario 3: Real Free Spins Entry (3 Scatters) from Math Engine
export const freeSpinsRound: Bet = {
	id: 'scenario_free_spins',
	bet: 100,
	payout: extracted.freeSpinsRound.payout,
	event: 0,
	state: extracted.freeSpinsRound.events as any,
};

// Mock board for celebration spins
const sampleBoard = [
	[{ name: 'L1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'L2' }],
	[{ name: 'L2' }, { name: 'H1' }, { name: 'W' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'L3' }],
	[{ name: 'L3' }, { name: 'H2' }, { name: 'M', multiplier: 5 }, { name: 'L3' }, { name: 'L4' }, { name: 'H2' }, { name: 'L1' }],
	[{ name: 'L4' }, { name: 'H3' }, { name: 'M', multiplier: 10 }, { name: 'L2' }, { name: 'L1' }, { name: 'H3' }, { name: 'L4' }],
	[{ name: 'L5' }, { name: 'H4' }, { name: 'L5' }, { name: 'L5' }, { name: 'L5' }, { name: 'H4' }, { name: 'L5' }],
];

// Scenario 4: Big Win (15x) -> $15.00
export const bigWinRound: Bet = {
	id: 'scenario_big_win',
	bet: 100,
	payout: 1500,
	event: 0,
	state: [
		{
			index: 0,
			type: 'reveal',
			board: sampleBoard,
			paddingPositions: [0, 0, 0, 0, 0],
			anticipation: [0, 0, 0, 0, 0],
			gameType: 'basegame',
		},
		{
			index: 1,
			type: 'winInfo',
			totalWin: 1500,
			wins: [
				{
					symbol: 'H1',
					win: 1500,
					positions: [
						{ reel: 0, row: 1 },
						{ reel: 1, row: 1 },
						{ reel: 1, row: 2 },
						{ reel: 0, row: 2 },
						{ reel: 0, row: 3 },
					],
					meta: { globalMult: 1, clusterMult: 1, winWithoutMult: 1500, overlay: { reel: 0, row: 1 } },
				},
			],
		},
		{ index: 2, type: 'updateTumbleWin', amount: 1500 },
		{ index: 3, type: 'setWin', amount: 1500, winLevel: 6 },
		{ index: 4, type: 'setTotalWin', amount: 1500 },
		{ index: 5, type: 'finalWin', amount: 1500 },
	] as any,
};

// Scenario 5: Mega Win (35x) -> $35.00
export const megaWinRound: Bet = {
	id: 'scenario_mega_win',
	bet: 100,
	payout: 3500,
	event: 0,
	state: [
		{
			index: 0,
			type: 'reveal',
			board: sampleBoard,
			paddingPositions: [0, 0, 0, 0, 0],
			anticipation: [0, 0, 0, 0, 0],
			gameType: 'basegame',
		},
		{
			index: 1,
			type: 'winInfo',
			totalWin: 3500,
			wins: [
				{
					symbol: 'H1',
					win: 3500,
					positions: [
						{ reel: 0, row: 1 },
						{ reel: 1, row: 1 },
						{ reel: 1, row: 2 },
						{ reel: 0, row: 2 },
						{ reel: 0, row: 3 },
					],
					meta: { globalMult: 1, clusterMult: 1, winWithoutMult: 3500, overlay: { reel: 0, row: 1 } },
				},
			],
		},
		{ index: 2, type: 'updateTumbleWin', amount: 3500 },
		{ index: 3, type: 'setWin', amount: 3500, winLevel: 8 },
		{ index: 4, type: 'setTotalWin', amount: 3500 },
		{ index: 5, type: 'finalWin', amount: 3500 },
	] as any,
};

// Scenario 6: Epic Win (75x) -> $75.00
export const epicWinRound: Bet = {
	id: 'scenario_epic_win',
	bet: 100,
	payout: 7500,
	event: 0,
	state: [
		{
			index: 0,
			type: 'reveal',
			board: sampleBoard,
			paddingPositions: [0, 0, 0, 0, 0],
			anticipation: [0, 0, 0, 0, 0],
			gameType: 'basegame',
		},
		{
			index: 1,
			type: 'winInfo',
			totalWin: 7500,
			wins: [
				{
					symbol: 'H1',
					win: 7500,
					positions: [
						{ reel: 0, row: 1 },
						{ reel: 1, row: 1 },
						{ reel: 1, row: 2 },
						{ reel: 0, row: 2 },
						{ reel: 0, row: 3 },
					],
					meta: { globalMult: 1, clusterMult: 1, winWithoutMult: 7500, overlay: { reel: 0, row: 1 } },
				},
			],
		},
		{ index: 2, type: 'updateTumbleWin', amount: 7500 },
		{ index: 3, type: 'setWin', amount: 7500, winLevel: 9 },
		{ index: 4, type: 'setTotalWin', amount: 7500 },
		{ index: 5, type: 'finalWin', amount: 7500 },
	] as any,
};

// Scenario 7: Sensational Win (150x) -> $150.00
export const sensationalWinRound: Bet = {
	id: 'scenario_sensational_win',
	bet: 100,
	payout: 15000,
	event: 0,
	state: [
		{
			index: 0,
			type: 'reveal',
			board: sampleBoard,
			paddingPositions: [0, 0, 0, 0, 0],
			anticipation: [0, 0, 0, 0, 0],
			gameType: 'basegame',
		},
		{
			index: 1,
			type: 'winInfo',
			totalWin: 15000,
			wins: [
				{
					symbol: 'H1',
					win: 15000,
					positions: [
						{ reel: 0, row: 1 },
						{ reel: 1, row: 1 },
						{ reel: 1, row: 2 },
						{ reel: 0, row: 2 },
						{ reel: 0, row: 3 },
					],
					meta: { globalMult: 1, clusterMult: 1, winWithoutMult: 15000, overlay: { reel: 0, row: 1 } },
				},
			],
		},
		{ index: 2, type: 'updateTumbleWin', amount: 15000 },
		{ index: 3, type: 'setWin', amount: 15000, winLevel: 9 },
		{ index: 4, type: 'setTotalWin', amount: 15000 },
		{ index: 5, type: 'finalWin', amount: 15000 },
	] as any,
};

// Scenario 8: MAX WIN (100,000x Wincap Plafond Atteint) -> $100,000.00
export const maxWinRound: Bet = {
	id: 'scenario_max_win',
	bet: 100,
	payout: 10000000,
	event: 0,
	state: [
		{
			index: 0,
			type: 'reveal',
			board: sampleBoard,
			paddingPositions: [0, 0, 0, 0, 0],
			anticipation: [0, 0, 0, 0, 0],
			gameType: 'basegame',
		},
		{
			index: 1,
			type: 'winInfo',
			totalWin: 10000000,
			wins: [
				{
					symbol: 'H1',
					win: 10000000,
					positions: [
						{ reel: 0, row: 1 },
						{ reel: 1, row: 1 },
						{ reel: 1, row: 2 },
						{ reel: 0, row: 2 },
						{ reel: 0, row: 3 },
					],
					meta: { globalMult: 1000, clusterMult: 1, winWithoutMult: 10000, overlay: { reel: 0, row: 1 } },
				},
			],
		},
		{ index: 2, type: 'updateGlobalMult', globalMult: 1000 },
		{ index: 3, type: 'updateTumbleWin', amount: 10000000 },
		{ index: 4, type: 'wincap', amount: 10000000 },
		{ index: 5, type: 'setTotalWin', amount: 10000000 },
		{ index: 6, type: 'finalWin', amount: 10000000 },
	] as any,
};
