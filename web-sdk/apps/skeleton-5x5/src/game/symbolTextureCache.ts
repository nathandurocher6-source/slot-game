import { PIXI, Texture } from 'pixi-svelte';
import type { RawSymbol } from './types';

export type SymbolStyleConfig = {
	bg: number;
	border: number;
	borderWidth: number;
	textColor: number;
	mainText: string;
	subText?: string;
	fontSize: number;
	isHigh: boolean;
	isSpecial: boolean;
	isMultiplier: boolean;
};

export const getSymbolStyle = (rawSymbol: RawSymbol): SymbolStyleConfig => {
	const name = rawSymbol.name;
	const mult = rawSymbol.multiplier;

	switch (name) {
		// Low Pays (Cold palette)
		case 'L1':
			return {
				bg: 0x0c252e,
				border: 0x1ea7b8,
				borderWidth: 2,
				textColor: 0x7be5f5,
				mainText: 'L1',
				subText: 'LOW',
				fontSize: 28,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
			};
		case 'L2':
			return {
				bg: 0x0c1b33,
				border: 0x2767c9,
				borderWidth: 2,
				textColor: 0x8ec0ff,
				mainText: 'L2',
				subText: 'LOW',
				fontSize: 28,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
			};
		case 'L3':
			return {
				bg: 0x1a1233,
				border: 0x6e49d6,
				borderWidth: 2,
				textColor: 0xbda4ff,
				mainText: 'L3',
				subText: 'LOW',
				fontSize: 28,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
			};
		case 'L4':
			return {
				bg: 0x0c261e,
				border: 0x228f64,
				borderWidth: 2,
				textColor: 0x7ee0b8,
				mainText: 'L4',
				subText: 'LOW',
				fontSize: 28,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
			};
		case 'L5':
			return {
				bg: 0x182029,
				border: 0x54667d,
				borderWidth: 2,
				textColor: 0xc7d6e8,
				mainText: 'L5',
				subText: 'LOW',
				fontSize: 28,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
			};

		// High Pays (Warm / Neon palette)
		case 'H1':
			return {
				bg: 0x332206,
				border: 0xf5a623,
				borderWidth: 2.5,
				textColor: 0xffe675,
				mainText: 'H1',
				subText: 'HIGH',
				fontSize: 28,
				isHigh: true,
				isSpecial: false,
				isMultiplier: false,
			};
		case 'H2':
			return {
				bg: 0x330912,
				border: 0xeb365b,
				borderWidth: 2.5,
				textColor: 0xff8fa3,
				mainText: 'H2',
				subText: 'HIGH',
				fontSize: 28,
				isHigh: true,
				isSpecial: false,
				isMultiplier: false,
			};
		case 'H3':
			return {
				bg: 0x2d0830,
				border: 0xdc2cf2,
				borderWidth: 2.5,
				textColor: 0xf99eff,
				mainText: 'H3',
				subText: 'HIGH',
				fontSize: 28,
				isHigh: true,
				isSpecial: false,
				isMultiplier: false,
			};
		case 'H4':
			return {
				bg: 0x331707,
				border: 0xf56a14,
				borderWidth: 2.5,
				textColor: 0xffb073,
				mainText: 'H4',
				subText: 'HIGH',
				fontSize: 28,
				isHigh: true,
				isSpecial: false,
				isMultiplier: false,
			};

		// Specials
		case 'W':
			return {
				bg: 0x2e2404,
				border: 0xffd700,
				borderWidth: 3,
				textColor: 0xffe57f,
				mainText: 'W',
				subText: 'WILD',
				fontSize: 32,
				isHigh: true,
				isSpecial: true,
				isMultiplier: false,
			};
		case 'S':
			return {
				bg: 0x2a0730,
				border: 0xff007f,
				borderWidth: 3,
				textColor: 0xff409f,
				mainText: 'S',
				subText: 'SCATTER',
				fontSize: 30,
				isHigh: true,
				isSpecial: true,
				isMultiplier: false,
			};
		case 'M':
			return {
				bg: 0x052a16,
				border: 0x00ff88,
				borderWidth: 3,
				textColor: 0x69f0ae,
				mainText: mult ? `x${mult}` : 'MULT',
				subText: 'BOMB',
				fontSize: mult && mult >= 100 ? 22 : 26,
				isHigh: true,
				isSpecial: true,
				isMultiplier: true,
			};

		default:
			return {
				bg: 0x1a212b,
				border: 0x4a5d75,
				borderWidth: 2,
				textColor: 0xffffff,
				mainText: String(name),
				fontSize: 26,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
			};
	}
};

const hexToColorString = (hex: number): string => {
	return '#' + hex.toString(16).padStart(6, '0');
};

const drawRoundRectPath = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) => {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
};

const textureCache = new Map<string, PIXI.Texture>();

export const createSymbolTexture = (rawSymbol: RawSymbol, isWinning = false): PIXI.Texture => {
	if (typeof document === 'undefined') {
		return PIXI.Texture.EMPTY;
	}

	const style = getSymbolStyle(rawSymbol);
	const canvas = document.createElement('canvas');
	const size = 176; // 88px * 2 for sharp retina display
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext('2d');
	if (!ctx) return PIXI.Texture.EMPTY;

	// 1. Main Tile Body
	const margin = 8;
	const bodySize = size - margin * 2;
	const radius = 28;

	drawRoundRectPath(ctx, margin, margin, bodySize, bodySize, radius);
	ctx.fillStyle = hexToColorString(style.bg);
	ctx.globalAlpha = 0.94;
	ctx.fill();

	ctx.globalAlpha = 1.0;
	ctx.strokeStyle = isWinning
		? style.isMultiplier
			? '#ffea00'
			: '#ffffff'
		: hexToColorString(style.border);
	ctx.lineWidth = (isWinning ? style.borderWidth + 1.5 : style.borderWidth) * 2;
	ctx.stroke();

	// 2. Top Accent Line
	const accentWidth = bodySize - 48;
	const accentHeight = 5;
	const accentX = (size - accentWidth) / 2;
	const accentY = margin + 10;
	drawRoundRectPath(ctx, accentX, accentY, accentWidth, accentHeight, 3);
	ctx.fillStyle = style.isMultiplier ? '#00ff88' : hexToColorString(style.border);
	ctx.globalAlpha = style.isHigh ? 0.85 : 0.45;
	ctx.fill();

	// 3. Main Text
	ctx.globalAlpha = 1.0;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = `900 ${style.fontSize * 2}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
	ctx.fillStyle = isWinning && !style.isMultiplier ? '#ffffff' : hexToColorString(style.textColor);
	const textY = style.subText ? size * 0.45 : size * 0.5;
	ctx.fillText(style.mainText, size / 2, textY);

	// 4. Sub-label Text
	if (style.subText) {
		ctx.font = `700 19px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
		ctx.fillStyle = isWinning ? '#ffffff' : hexToColorString(style.textColor);
		ctx.letterSpacing = '2px';
		ctx.fillText(style.subText, size / 2, size * 0.76);
	}

	const texture = PIXI.Texture.from(canvas);
	if (texture.source) {
		texture.source.resolution = 2;
	}

	return texture;
};

export const getSymbolTexture = (rawSymbol: RawSymbol, isWinning = false): PIXI.Texture => {
	const key = `${rawSymbol.name}_${rawSymbol.multiplier ?? ''}_${isWinning ? 'win' : 'normal'}`;
	let cached = textureCache.get(key);
	if (!cached) {
		cached = createSymbolTexture(rawSymbol, isWinning);
		textureCache.set(key, cached);
	}
	return cached;
};

export const pregenerateSymbolTextures = () => {
	if (typeof document === 'undefined') return;

	const symbols: RawSymbol[] = [
		{ name: 'L1' },
		{ name: 'L2' },
		{ name: 'L3' },
		{ name: 'L4' },
		{ name: 'L5' },
		{ name: 'H1' },
		{ name: 'H2' },
		{ name: 'H3' },
		{ name: 'H4' },
		{ name: 'W' },
		{ name: 'S' },
		{ name: 'M', multiplier: 2 },
		{ name: 'M', multiplier: 3 },
		{ name: 'M', multiplier: 5 },
		{ name: 'M', multiplier: 10 },
		{ name: 'M', multiplier: 25 },
		{ name: 'M', multiplier: 50 },
		{ name: 'M', multiplier: 100 },
	];

	for (const sym of symbols) {
		getSymbolTexture(sym, false);
		getSymbolTexture(sym, true);
	}
};
