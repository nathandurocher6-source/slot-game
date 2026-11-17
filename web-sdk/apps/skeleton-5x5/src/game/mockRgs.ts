import { API_AMOUNT_MULTIPLIER } from 'constants-shared/bet';
import { stateUrlDerived } from 'state-shared';
import simulatedBooksPool from '../stories/data/simulated_books_pool.json';
import wincapBook from '../stories/data/wincap_book.json';
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
		const rawUrl =
			typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
		const urlString = String(rawUrl || '').toLowerCase();

		// Helper to identify RGS route types regardless of origin (https://wallet/play, http://localhost:3005/wallet/play, /wallet/play, etc.)
		const isAuthenticate = urlString.includes('authenticate');
		const isEndRound = urlString.includes('end-round');
		const isEvent = urlString.includes('event') && !urlString.includes('authenticate') && !urlString.includes('play');
		const isReplay = urlString.includes('replay');
		const isPlay =
			!isAuthenticate &&
			!isEndRound &&
			!isEvent &&
			!isReplay &&
			(urlString.includes('/wallet/play') ||
				urlString.includes('wallet/play') ||
				urlString.includes('/play') ||
				urlString.includes('/wallet/bet') ||
				urlString.includes('wallet/bet') ||
				urlString.includes('/bet'));

		// 1. Authenticate (/wallet/authenticate)
		if (isAuthenticate) {
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

		// 2. Play / Bet (/wallet/play or /wallet/bet)
		if (isPlay) {
			let parsedBody: Record<string, any> = {};
			try {
				if (init?.body) {
					parsedBody = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
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

			// Deduct wager
			mockBalanceDollars = Math.max(0, mockBalanceDollars - totalCostDollars);

			// Choose round events from the real simulated & Rust-optimized statistical pool
			const isForcedMaxWin =
				rawMode.includes('max') ||
				(typeof window !== 'undefined' &&
					(window.location.search.includes('maxwin') || window.location.search.includes('wincap')));

			const poolData = simulatedBooksPool as Record<string, any[]>;
			let pool = poolData.base ?? [];
			if (rawMode.includes('buy')) {
				pool = poolData.bonus_buy ?? pool;
			} else if (rawMode.includes('booster')) {
				pool = poolData.bonus_booster ?? pool;
			}

			// Random pick from the weighted 500-spin pool, or wincap if requested
			const chosenBook = isForcedMaxWin
				? (wincapBook as any)
				: pool.length > 0
					? pool[Math.floor(Math.random() * pool.length)]
					: extracted.tumbleMultRound;

			spinCounter++;

			// Calculate payout (amounts in books are in cents, where 100 = 1.0x base bet)
			let bookWinTotal = 0;
			if (typeof chosenBook.payoutMultiplier === 'number') {
				bookWinTotal = chosenBook.payoutMultiplier;
			} else {
				const fsEnd = chosenBook.events.find((e: any) => e.type === 'freeSpinEnd');
				const finalWin = chosenBook.events.find((e: any) => e.type === 'finalWin');
				const setWins = chosenBook.events.filter((e: any) => e.type === 'setWin');
				if (fsEnd?.amount) bookWinTotal = fsEnd.amount;
				else if (finalWin?.amount) bookWinTotal = finalWin.amount;
				else if (setWins.length > 0) bookWinTotal = setWins[setWins.length - 1].amount;
			}

			const payoutMultiplier = bookWinTotal / 100;
			const totalWinDollars = betAmountDollars * payoutMultiplier;

			// Hold win for /wallet/end-round
			pendingWinDollars = totalWinDollars;

			// Deep clone events to ensure each round runs cleanly
			const clonedState = JSON.parse(JSON.stringify(chosenBook.events));

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
					state: clonedState,
				},
			};

			return new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 3. End Round (/wallet/end-round)
		if (isEndRound) {
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

		// 4. Bet Event (/bet/event)
		if (isEvent) {
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 5. Replay (/bet/replay)
		if (isReplay) {
			return new Response(
				JSON.stringify({
					betID: 1,
					amount: 1000000,
					payout: 0,
					payoutMultiplier: 0,
					active: false,
					mode: 'BASE',
					state: extracted.tumbleMultRound.events,
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		return originalFetch(input, init);
	};
};

// Immediate module-level self-initialization when running in browser
if (typeof window !== 'undefined') {
	initMockRgs();
}
