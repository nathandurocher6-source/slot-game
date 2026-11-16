import { API_AMOUNT_MULTIPLIER } from 'constants-shared/bet';
import { stateUrlDerived } from 'state-shared';
import extracted from '../stories/data/extracted_books.json';

// Local persistent simulated casino wallet
let mockBalanceDollars = 10000.0;
let pendingWinDollars = 0;
let spinCounter = 0;

export const getMockBalance = () => mockBalanceDollars;
export const setMockBalance = (amount: number) => {
	mockBalanceDollars = amount;
};

export const initMockRgs = () => {
	if (typeof window === 'undefined') return;

	// Only enable mock if no explicit external RGS URL is specified
	const externalRgsUrl = stateUrlDerived.rgsUrl();
	if (externalRgsUrl && externalRgsUrl.trim() !== '') {
		return;
	}

	// Prevent duplicate initialization
	if ((window as any).__MOCK_RGS_INITIALIZED__) return;
	(window as any).__MOCK_RGS_INITIALIZED__ = true;

	const originalFetch = window.fetch.bind(window);

	window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		const urlString =
			typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;

		// 1. /wallet/authenticate
		if (urlString.includes('/wallet/authenticate')) {
			const body = {
				balance: {
					amount: Math.round(mockBalanceDollars * API_AMOUNT_MULTIPLIER),
					currency: 'USD',
				},
				config: {
					gameID: '0_0_skeleton_5x5',
					minBet: 100000,
					maxBet: 100000000,
					stepBet: 100000,
					defaultBetLevel: 1000000,
					betLevels: [
						100000, 200000, 400000, 600000, 800000, 1000000, 2000000, 3000000, 5000000, 10000000,
						20000000, 50000000, 100000000,
					],
					betModes: {
						base: { cost: 1.0 },
						bonus_booster: { cost: 3.0 },
						bonus_buy: { cost: 100.0 },
					},
					jurisdiction: {
						socialCasino: false,
						disabledFullscreen: false,
						disabledTurbo: false,
						disabledSuperTurbo: false,
						disabledAutoplay: false,
						disabledSlamstop: false,
						disabledSpacebar: false,
						disabledBuyFeature: false,
						displayNetPosition: false,
						displayRTP: false,
						displaySessionTimer: false,
						minimumRoundDuration: 0,
					},
				},
			};

			return new Response(JSON.stringify(body), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 2. /wallet/bet
		if (urlString.includes('/wallet/bet')) {
			let parsedBody: Record<string, any> = {};
			try {
				if (init?.body) {
					parsedBody = JSON.parse(init.body as string);
				}
			} catch {
				parsedBody = {};
			}

			const betAmountMicro = Number(parsedBody.amount) || 1000000;
			const betAmountDollars = betAmountMicro / API_AMOUNT_MULTIPLIER;
			const rawMode = String(parsedBody.mode || 'BASE').toLowerCase();

			let costMultiplier = 1.0;
			if (rawMode.includes('buy')) {
				costMultiplier = 100.0;
			} else if (rawMode.includes('booster')) {
				costMultiplier = 3.0;
			}

			const totalCostDollars = betAmountDollars * costMultiplier;

			// If player balance runs out, automatically replenish $5,000 for smooth testing
			if (mockBalanceDollars < totalCostDollars) {
				mockBalanceDollars += 5000;
			}

			// Deduct wager
			mockBalanceDollars = Math.max(0, mockBalanceDollars - totalCostDollars);

			// Choose round events
			let chosenScenario: { events: any[]; payout?: number };
			if (rawMode.includes('buy')) {
				// Guaranteed 10 Free Spins
				chosenScenario = extracted.freeSpinsRound;
			} else if (rawMode.includes('booster')) {
				// Elevated bonus trigger chance: 50% Free Spins, 50% Tumble Mult
				chosenScenario = spinCounter % 2 === 0 ? extracted.freeSpinsRound : extracted.tumbleMultRound;
			} else {
				// Base game cycle: 1: tumbleMult, 2: loss, 3: freeSpins, 4: loss
				const cycle = spinCounter % 4;
				if (cycle === 0) chosenScenario = extracted.tumbleMultRound;
				else if (cycle === 2) chosenScenario = extracted.freeSpinsRound;
				else chosenScenario = extracted.losingRound;
			}
			spinCounter++;

			// Calculate payout
			// Book amounts are in cents (100 = 1x bet)
			const fsEnd = chosenScenario.events.find((e: any) => e.type === 'freeSpinEnd');
			const setWins = chosenScenario.events.filter((e: any) => e.type === 'setWin');
			const finalWin = chosenScenario.events.find((e: any) => e.type === 'finalWin');

			let bookWinTotal = 0;
			if (fsEnd?.amount) {
				bookWinTotal = fsEnd.amount;
			} else if (finalWin?.amount) {
				bookWinTotal = finalWin.amount;
			} else if (setWins.length > 0) {
				bookWinTotal = setWins[setWins.length - 1].amount;
			}

			const payoutMultiplier = bookWinTotal / 100;
			const totalWinDollars = betAmountDollars * payoutMultiplier;

			// Hold win for /wallet/end-round
			pendingWinDollars = totalWinDollars;

			const responseData = {
				balance: {
					amount: Math.round(mockBalanceDollars * API_AMOUNT_MULTIPLIER),
					currency: 'USD',
				},
				round: {
					betID: Date.now(),
					amount: Math.round(totalCostDollars * API_AMOUNT_MULTIPLIER),
					payout: Math.round(totalWinDollars * API_AMOUNT_MULTIPLIER),
					payoutMultiplier,
					active: false,
					mode: parsedBody.mode || 'BASE',
					state: chosenScenario.events,
				},
			};

			return new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 3. /wallet/end-round
		if (urlString.includes('/wallet/end-round')) {
			mockBalanceDollars += pendingWinDollars;
			pendingWinDollars = 0;

			return new Response(
				JSON.stringify({
					balance: {
						amount: Math.round(mockBalanceDollars * API_AMOUNT_MULTIPLIER),
						currency: 'USD',
					},
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		// 4. /bet/event
		if (urlString.includes('/bet/event')) {
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return originalFetch(input, init);
	};
};
