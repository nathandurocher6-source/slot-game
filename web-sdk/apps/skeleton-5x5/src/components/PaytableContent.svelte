<script lang="ts">
	import { stateBet, stateModal } from 'state-shared';

	type Tab = 'payouts' | 'features' | 'rules';
	let activeTab = $state<Tab>('payouts');

	const baseBet = $derived(stateBet.betAmount || 1);

	const closeModal = () => {
		stateModal.modal = null;
	};

	// Paytable config aligned with math-sdk/games/0_0_skeleton_5x5/game_config.py
	const highSymbols = [
		{
			id: 'H1',
			name: 'H1 SYMBOL',
			type: 'HIGH PAY',
			color: '#ffe675',
			bg: '#332206',
			border: '#f5a623',
			tiers: [
				{ count: '15+', mult: 150.0 },
				{ count: '11-14', mult: 60.0 },
				{ count: '8-10', mult: 25.0 },
				{ count: '6-7', mult: 12.0 },
				{ count: '5', mult: 5.0 },
			],
		},
		{
			id: 'H2',
			name: 'H2 SYMBOL',
			type: 'HIGH PAY',
			color: '#ff8fa3',
			bg: '#330912',
			border: '#eb365b',
			tiers: [
				{ count: '15+', mult: 100.0 },
				{ count: '11-14', mult: 40.0 },
				{ count: '8-10', mult: 18.0 },
				{ count: '6-7', mult: 8.0 },
				{ count: '5', mult: 3.0 },
			],
		},
		{
			id: 'H3',
			name: 'H3 SYMBOL',
			type: 'HIGH PAY',
			color: '#f99eff',
			bg: '#2d0830',
			border: '#dc2cf2',
			tiers: [
				{ count: '15+', mult: 60.0 },
				{ count: '11-14', mult: 25.0 },
				{ count: '8-10', mult: 12.0 },
				{ count: '6-7', mult: 5.0 },
				{ count: '5', mult: 2.0 },
			],
		},
		{
			id: 'H4',
			name: 'H4 SYMBOL',
			type: 'HIGH PAY',
			color: '#ffb073',
			bg: '#331707',
			border: '#f56a14',
			tiers: [
				{ count: '15+', mult: 40.0 },
				{ count: '11-14', mult: 18.0 },
				{ count: '8-10', mult: 8.0 },
				{ count: '6-7', mult: 3.5 },
				{ count: '5', mult: 1.5 },
			],
		},
	];

	const lowSymbols = [
		{
			id: 'L1',
			name: 'L1',
			color: '#7be5f5',
			bg: '#0c252e',
			border: '#1ea7b8',
			tiers: [
				{ count: '15+', mult: 20.0 },
				{ count: '11-14', mult: 8.0 },
				{ count: '8-10', mult: 4.0 },
				{ count: '6-7', mult: 2.0 },
				{ count: '5', mult: 0.8 },
			],
		},
		{
			id: 'L2',
			name: 'L2',
			color: '#8ec0ff',
			bg: '#0c1b33',
			border: '#2767c9',
			tiers: [
				{ count: '15+', mult: 15.0 },
				{ count: '11-14', mult: 6.0 },
				{ count: '8-10', mult: 3.0 },
				{ count: '6-7', mult: 1.5 },
				{ count: '5', mult: 0.6 },
			],
		},
		{
			id: 'L3',
			name: 'L3',
			color: '#bda4ff',
			bg: '#1a1233',
			border: '#6e49d6',
			tiers: [
				{ count: '15+', mult: 12.0 },
				{ count: '11-14', mult: 5.0 },
				{ count: '8-10', mult: 2.5 },
				{ count: '6-7', mult: 1.0 },
				{ count: '5', mult: 0.4 },
			],
		},
		{
			id: 'L4',
			name: 'L4',
			color: '#7ee0b8',
			bg: '#0c261e',
			border: '#228f64',
			tiers: [
				{ count: '15+', mult: 10.0 },
				{ count: '11-14', mult: 4.0 },
				{ count: '8-10', mult: 2.0 },
				{ count: '6-7', mult: 0.8 },
				{ count: '5', mult: 0.3 },
			],
		},
		{
			id: 'L5',
			name: 'L5',
			color: '#c7d6e8',
			bg: '#182029',
			border: '#54667d',
			tiers: [
				{ count: '15+', mult: 8.0 },
				{ count: '11-14', mult: 3.0 },
				{ count: '8-10', mult: 1.5 },
				{ count: '6-7', mult: 0.5 },
				{ count: '5', mult: 0.2 },
			],
		},
	];

	const formatCash = (mult: number) => {
		const val = mult * baseBet;
		return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};
</script>

<div class="modal-card">
	<!-- Fixed Header -->
	<div class="modal-header">
		<div class="modal-title-row">
			<div class="modal-title-wrap">
				<span class="badge-studio">STAKE ENGINE</span>
				<h2 class="modal-title">SKELETON 5X5 — RÈGLES & PAIEMENTS</h2>
			</div>
			<button class="modal-close-btn" onclick={closeModal} title="Fermer la fenêtre">✕</button>
		</div>

		<!-- Tab Navigation Bar -->
		<div class="modal-tabs">
			<button class="tab-btn" class:active={activeTab === 'payouts'} onclick={() => (activeTab = 'payouts')}>
				<span class="tab-badge">1</span> Paiements
			</button>
			<button class="tab-btn" class:active={activeTab === 'features'} onclick={() => (activeTab = 'features')}>
				<span class="tab-badge">2</span> Bonus & Multiplicateurs
			</button>
			<button class="tab-btn" class:active={activeTab === 'rules'} onclick={() => (activeTab = 'rules')}>
				<span class="tab-badge">3</span> Règles & RTP
			</button>
		</div>
	</div>

	<!-- Scrollable Content Body -->
	<div class="modal-body">
		{#if activeTab === 'payouts'}
			<!-- Current Bet Scaler Banner -->
			<div class="bet-scaler-banner">
				<span class="bet-scaler-icon">⚡</span>
				<span>Gains calculés en direct sur votre mise actuelle : <strong>${baseBet.toFixed(2)} USD</strong></span>
			</div>

			<!-- High Paying Symbols -->
			<section class="section-block">
				<h3 class="section-title">SYMBOLES FORTS (HIGH PAYS)</h3>
				<div class="symbols-grid high-grid">
					{#each highSymbols as sym}
						<div class="symbol-card">
							<div
								class="symbol-tile"
								style="background-color: {sym.bg}; border-color: {sym.border}; color: {sym.color};"
							>
								<span class="sym-name">{sym.id}</span>
								<span class="sym-type">{sym.type}</span>
							</div>
							<div class="payout-list">
								{#each sym.tiers as tier}
									<div class="tier-row">
										<span class="count">{tier.count}</span>
										<span class="cash">{formatCash(tier.mult)}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Low Paying Symbols -->
			<section class="section-block">
				<h3 class="section-title">SYMBOLES BASIQUES (LOW PAYS)</h3>
				<div class="symbols-grid low-grid">
					{#each lowSymbols as sym}
						<div class="symbol-card">
							<div
								class="symbol-tile low-tile"
								style="background-color: {sym.bg}; border-color: {sym.border}; color: {sym.color};"
							>
								<span class="sym-name">{sym.id}</span>
								<span class="sym-type">LOW</span>
							</div>
							<div class="payout-list">
								{#each sym.tiers as tier}
									<div class="tier-row">
										<span class="count">{tier.count}</span>
										<span class="cash">{formatCash(tier.mult)}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>

		{:else if activeTab === 'features'}
			<!-- Special Symbols -->
			<section class="section-block">
				<h3 class="section-title">SYMBOLES SPÉCIAUX</h3>
				<div class="specials-grid">
					<!-- Wild -->
					<div class="special-card">
						<div class="symbol-tile special-tile" style="background-color: #2e2404; border-color: #ffd700; color: #ffe57f;">
							<span class="sym-name">W</span>
							<span class="sym-type">WILD</span>
						</div>
						<div class="special-desc">
							<h4>SYMBOLE WILD</h4>
							<p>Remplace tous les symboles payants (H1–H4, L1–L5) pour compléter ou agrandir un cluster gagnant. N'apparaît pas à la place des Scatters.</p>
						</div>
					</div>

					<!-- Scatter -->
					<div class="special-card">
						<div class="symbol-tile special-tile" style="background-color: #2a0730; border-color: #ff007f; color: #ff409f;">
							<span class="sym-name">S</span>
							<span class="sym-type">SCATTER</span>
						</div>
						<div class="special-desc">
							<h4>SYMBOLE SCATTER & TOURS GRATUITS</h4>
							<p>Obtenez 3 symboles Scatters ou plus n'importe où sur la grille pour déclencher la séquence de Tours Gratuits :</p>
							<ul>
								<li><strong>3 Scatters :</strong> 10 Tours Gratuits</li>
								<li><strong>4 Scatters :</strong> 12 Tours Gratuits</li>
								<li><strong>5+ Scatters :</strong> 15 Tours Gratuits</li>
							</ul>
							<p><strong>Retrigger :</strong> 3 Scatters ou plus pendant le bonus accordent <strong>+5 Tours Gratuits supplémentaires</strong>.</p>
						</div>
					</div>

					<!-- Multiplier Bomb -->
					<div class="special-card">
						<div class="symbol-tile special-tile" style="background-color: #052a16; border-color: #00ff88; color: #69f0ae;">
							<span class="sym-name">x50</span>
							<span class="sym-type">BOMB</span>
						</div>
						<div class="special-desc">
							<h4>SYMBOLES MULTIPLICATEURS (M)</h4>
							<p>Peuvent atterrir avec des valeurs explosives de <strong>x2 à x1000</strong> (x2, x3, x4, x5, x10, x15, x25, x50, x100, x250, x500, x1000).</p>
							<p><strong>En Jeu de Base :</strong> La somme de tous les multiplicateurs présents à l'écran multiplie le gain cumulé de toutes les cascades du spin.</p>
							<p><strong>En Tours Gratuits :</strong> Les multiplicateurs sont ajoutés au <strong>Multiplicateur Global Progressif</strong> qui persiste d'un tour à l'autre et s'applique à tous les gains suivants contenant un multiplicateur !</p>
						</div>
					</div>
				</div>
			</section>

		{:else if activeTab === 'rules'}
			<!-- Technical Rules & Limits -->
			<section class="section-block">
				<h3 class="section-title">SPÉCIFICATIONS DU JEU & CERTIFICATION</h3>
				<div class="specs-grid">
					<div class="spec-box">
						<span class="label">GRILLE</span>
						<span class="val">5x5 Cluster Pays</span>
					</div>
					<div class="spec-box">
						<span class="label">RTP THÉORIQUE</span>
						<span class="val highlight-green">96.00%</span>
					</div>
					<div class="spec-box">
						<span class="label">PLAFOND MAX WIN</span>
						<span class="val highlight-gold">x100 000 Mise</span>
					</div>
					<div class="spec-box">
						<span class="label">VOLATILITÉ</span>
						<span class="val highlight-orange">Très Haute</span>
					</div>
				</div>

				<div class="rules-text">
					<p><strong>Mécanique de Cascade (Tumble) :</strong> 5 symboles identiques ou plus connectés horizontalement ou verticalement forment un cluster gagnant. Les symboles gagnants explosent et disparaissent. Les symboles restants tombent par gravité vers le bas et de nouveaux symboles tombent du haut pour combler les espaces vides. Les cascades se poursuivent tant que de nouveaux gains apparaissent.</p>
					<p><strong>Option Bonus Booster :</strong> Coûte 3x la mise de base. Triple vos chances d'obtenir des Scatters et d'entrer en Tours Gratuits de manière organique.</p>
					<p><strong>Option Bonus Buy :</strong> Coûte 100x la mise de base. Déclenche immédiatement le jeu bonus de Tours Gratuits avec 3 Scatters ou plus garantis dès le premier tour.</p>
					<p><strong>Plafond de Gain x100 000 (Win Cap) :</strong> Si le gain cumulé total d'un tour atteint ou dépasse 100 000x la mise de base, le spin s'arrête immédiatement, le bandeau MAX WIN s'affiche et le paiement de 100 000x est crédité au solde.</p>
				</div>
			</section>
		{/if}
	</div>
</div>

<style lang="scss">
	.modal-card {
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: #e2e8f0;
		width: 92vw;
		max-width: 820px;
		height: 82vh;
		max-height: 82vh;
		background: #0b0f17;
		border: 1.5px solid #1e2638;
		border-radius: 20px;
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(30, 167, 184, 0.12);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		text-align: left;
	}

	.modal-header {
		padding: 20px 24px 0 24px;
		background: #0e1420;
		border-bottom: 1px solid #1c2538;
		flex-shrink: 0;
	}

	.modal-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.modal-title-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.badge-studio {
		background: #1e293b;
		color: #38bdf8;
		border: 1px solid #38bdf8;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 1.5px;
		padding: 3px 8px;
		border-radius: 6px;
	}

	.modal-title {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 900;
		letter-spacing: 1px;
		color: #ffffff;

		@media (max-width: 600px) {
			font-size: 1rem;
		}
	}

	.modal-close-btn {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: #161e2e;
		border: 1px solid #2d3b55;
		color: #94a3b8;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;

		&:hover {
			background: #e11d48;
			border-color: #f43f5e;
			color: #ffffff;
			transform: scale(1.05);
		}
	}

	.modal-tabs {
		display: flex;
		gap: 8px;
		overflow-x: auto;
	}

	.tab-btn {
		padding: 10px 18px;
		border-radius: 10px 10px 0 0;
		background: transparent;
		border: 1px solid transparent;
		border-bottom: none;
		color: #64748b;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;

		&:hover:not(.active) {
			color: #cbd5e1;
			background: #131a29;
		}

		&.active {
			background: #0b0f17;
			color: #00ff88;
			border-color: #1c2538;
			border-bottom: 1px solid #0b0f17;
			margin-bottom: -1px;
		}
	}

	.tab-badge {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #1c2538;
		font-size: 10.5px;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		color: inherit;
	}

	.tab-btn.active .tab-badge {
		background: #00ff88;
		color: #052615;
	}

	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		scrollbar-width: thin;
		scrollbar-color: #243046 #0b0f17;

		&::-webkit-scrollbar {
			width: 8px;
		}
		&::-webkit-scrollbar-track {
			background: #0b0f17;
		}
		&::-webkit-scrollbar-thumb {
			background: #243046;
			border-radius: 4px;
		}
	}

	.bet-scaler-banner {
		background: rgba(0, 255, 136, 0.08);
		border: 1px solid rgba(0, 255, 136, 0.3);
		border-radius: 10px;
		padding: 10px 16px;
		font-size: 13px;
		color: #a7f3d0;
		display: flex;
		align-items: center;
		gap: 10px;

		strong {
			color: #ffffff;
		}
	}

	.section-block {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.section-title {
		margin: 0;
		font-size: 11.5px;
		font-weight: 800;
		letter-spacing: 1.5px;
		color: #64748b;
		text-transform: uppercase;
	}

	.symbols-grid {
		display: grid;
		gap: 12px;
	}

	.high-grid {
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	}

	.low-grid {
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
	}

	.symbol-card {
		background: #0e131d;
		border: 1px solid #1a2334;
		border-radius: 12px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		transition: all 0.15s ease;

		&:hover {
			border-color: #38bdf8;
			background: #111824;
		}
	}

	.symbol-tile {
		width: 58px;
		height: 58px;
		border-radius: 12px;
		border: 2px solid;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-weight: 900;

		.sym-name {
			font-size: 1.15rem;
			line-height: 1;
		}

		.sym-type {
			font-size: 0.55rem;
			letter-spacing: 0.5px;
			opacity: 0.85;
		}

		&.low-tile {
			width: 48px;
			height: 48px;
			border-radius: 10px;

			.sym-name {
				font-size: 1rem;
			}
		}

		&.special-tile {
			width: 62px;
			height: 62px;
			flex-shrink: 0;
		}
	}

	.payout-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.tier-row {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		padding: 2px 4px;
		border-bottom: 1px solid #161e2c;

		&:last-child {
			border-bottom: none;
		}

		.count {
			color: #94a3b8;
			font-weight: 600;
		}

		.cash {
			color: #f8fafc;
			font-weight: 800;
			font-variant-numeric: tabular-nums;
		}
	}

	.specials-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.special-card {
		background: #0e131d;
		border: 1px solid #1a2334;
		border-radius: 12px;
		padding: 16px;
		display: flex;
		gap: 18px;
		align-items: center;

		.special-desc {
			h4 {
				margin: 0 0 6px 0;
				font-size: 14px;
				font-weight: 800;
				color: #ffffff;
			}

			p {
				margin: 0 0 6px 0;
				font-size: 12.5px;
				line-height: 1.45;
				color: #94a3b8;

				&:last-child {
					margin-bottom: 0;
				}
			}

			ul {
				margin: 4px 0 6px 18px;
				padding: 0;
				font-size: 12.5px;
				color: #cbd5e1;

				li {
					margin-bottom: 2px;
				}
			}
		}
	}

	.specs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 12px;
	}

	.spec-box {
		background: #0e131d;
		border: 1px solid #1a2334;
		border-radius: 10px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 4px;

		.label {
			font-size: 9.5px;
			font-weight: 700;
			color: #64748b;
			letter-spacing: 1px;
		}

		.val {
			font-size: 15px;
			font-weight: 800;
			color: #ffffff;

			&.highlight-green {
				color: #00ff88;
			}
			&.highlight-gold {
				color: #ffd700;
			}
			&.highlight-orange {
				color: #f97316;
			}
		}
	}

	.rules-text {
		background: #0e131d;
		border: 1px solid #1a2334;
		border-radius: 10px;
		padding: 16px 20px;
		font-size: 12.5px;
		line-height: 1.6;
		color: #94a3b8;

		p {
			margin: 0 0 10px 0;

			&:last-child {
				margin-bottom: 0;
			}
		}

		strong {
			color: #ffffff;
		}
	}
</style>
