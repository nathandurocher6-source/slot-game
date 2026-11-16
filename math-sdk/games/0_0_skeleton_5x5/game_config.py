"""Skeleton 5x5 All-in-One Game Configuration.

Universal high-volatility 5x5 Grid with Cascading / Tumble, Multiplier Bombs (M),
Persistent Progressive Multiplier in Free Spins, and 100,000x Max Win Cap.
"""

import os
from src.config.config import Config
from src.config.distributions import Distribution
from src.config.betmode import BetMode


class GameConfig(Config):
    """Singleton 5x5 Universal Skeleton Game Configuration."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()
        self.game_id = "0_0_skeleton_5x5"
        self.game_name = "skeleton_5x5"
        self.provider_number = 0
        self.working_name = "Stake Engine 5x5 Universal Skeleton"

        # Win cap x100,000 and target RTP 96.0%
        self.wincap = 100000.0
        self.win_type = "cluster"
        self.rtp = 0.9600
        self.construct_paths()

        # Grid Dimensions: 5x5 matrix
        self.num_reels = 5
        self.num_rows = [5] * self.num_reels

        # Neutral Symbol Identifiers:
        # High Pays: H1, H2, H3, H4
        # Low Pays:  L1, L2, L3, L4, L5
        # Specials:  W (Wild), S (Scatter), M (Multiplier)
        t1, t2, t3, t4, t5 = (5, 5), (6, 7), (8, 10), (11, 14), (15, 25)
        pay_group = {
            (t1, "H1"): 5.0,
            (t2, "H1"): 12.0,
            (t3, "H1"): 25.0,
            (t4, "H1"): 60.0,
            (t5, "H1"): 150.0,

            (t1, "H2"): 3.0,
            (t2, "H2"): 8.0,
            (t3, "H2"): 18.0,
            (t4, "H2"): 40.0,
            (t5, "H2"): 100.0,

            (t1, "H3"): 2.0,
            (t2, "H3"): 5.0,
            (t3, "H3"): 12.0,
            (t4, "H3"): 25.0,
            (t5, "H3"): 60.0,

            (t1, "H4"): 1.5,
            (t2, "H4"): 3.5,
            (t3, "H4"): 8.0,
            (t4, "H4"): 18.0,
            (t5, "H4"): 40.0,

            (t1, "L1"): 0.8,
            (t2, "L1"): 2.0,
            (t3, "L1"): 4.0,
            (t4, "L1"): 8.0,
            (t5, "L1"): 20.0,

            (t1, "L2"): 0.6,
            (t2, "L2"): 1.5,
            (t3, "L2"): 3.0,
            (t4, "L2"): 6.0,
            (t5, "L2"): 15.0,

            (t1, "L3"): 0.4,
            (t2, "L3"): 1.0,
            (t3, "L3"): 2.5,
            (t4, "L3"): 5.0,
            (t5, "L3"): 12.0,

            (t1, "L4"): 0.3,
            (t2, "L4"): 0.8,
            (t3, "L4"): 2.0,
            (t4, "L4"): 4.0,
            (t5, "L4"): 10.0,

            (t1, "L5"): 0.2,
            (t2, "L5"): 0.5,
            (t3, "L5"): 1.5,
            (t4, "L5"): 3.0,
            (t5, "L5"): 8.0,
        }
        self.paytable = self.convert_range_table(pay_group)

        self.include_padding = True
        self.special_symbols = {"wild": ["W"], "scatter": ["S"], "multiplier": ["M"]}

        # Free Spin triggers (3 Scatters = 10 FS, 4 = 12 FS, 5+ = 15 FS)
        self.freespin_triggers = {
            self.basegame_type: {3: 10, 4: 12, 5: 15},
            self.freegame_type: {3: 5, 4: 8, 5: 10},
        }
        self.anticipation_triggers = {
            self.basegame_type: 2,
            self.freegame_type: 2,
        }

        # Multiplier values list: [2, 3, 4, 5, 10, 15, 25, 50, 100, 250, 500, 1000]
        self.multiplier_values = [2, 3, 4, 5, 10, 15, 25, 50, 100, 250, 500, 1000]
        self.mult_weights = {
            self.basegame_type: {
                2: 250, 3: 200, 4: 150, 5: 120, 10: 80,
                15: 50, 25: 40, 50: 25, 100: 15, 250: 8, 500: 4, 1000: 1,
            },
            self.freegame_type: {
                2: 200, 3: 180, 4: 150, 5: 130, 10: 100,
                15: 70, 25: 50, 50: 35, 100: 20, 250: 10, 500: 6, 1000: 2,
            },
        }
        self.wincap_mult_weights = {
            self.basegame_type: {1000: 10},
            self.freegame_type: {500: 5, 1000: 20},
        }

        # Load reel strips
        reels = {"BR0": "BR0.csv", "FR0": "FR0.csv", "WCAP": "WCAP.csv"}
        self.reels = {}
        for r, f in reels.items():
            self.reels[r] = self.read_reels_csv(os.path.join(self.reels_path, f))

        self.padding_reels[self.basegame_type] = self.reels["BR0"]
        self.padding_reels[self.freegame_type] = self.reels["FR0"]

        mode_maxwins = {
            "base": self.wincap,
            "bonus_booster": self.wincap,
            "bonus_buy": self.wincap,
        }

        # The 3 Standard BetModes:
        # 1. base (1.0x): standard game with balanced distributions
        # 2. bonus_booster (3.0x): feature spin with heavily increased scatter frequency
        # 3. bonus_buy (100.0x): direct entry to Free Spins feature (is_buybonus=True)
        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=mode_maxwins["base"],
                auto_close_disabled=False,
                is_feature=False,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.0001,
                        win_criteria=mode_maxwins["base"],
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"WCAP": 1},
                            },
                            "scatter_triggers": {3: 8, 4: 2},
                            "mult_values": self.wincap_mult_weights,
                            "force_wincap": True,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.005,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1},
                            },
                            "scatter_triggers": {3: 8, 4: 2},
                            "mult_values": self.mult_weights,
                            "force_wincap": False,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.72,
                        win_criteria=0.0,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "mult_values": self.mult_weights,
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.2749,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "mult_values": self.mult_weights,
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                ],
            ),
            BetMode(
                name="bonus_booster",
                cost=3.0,
                rtp=self.rtp,
                max_win=mode_maxwins["bonus_booster"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.0001,
                        win_criteria=mode_maxwins["bonus_booster"],
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"WCAP": 1},
                            },
                            "scatter_triggers": {3: 8, 4: 2},
                            "mult_values": self.wincap_mult_weights,
                            "force_wincap": True,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.02,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1},
                            },
                            "scatter_triggers": {3: 8, 4: 2},
                            "mult_values": self.mult_weights,
                            "force_wincap": False,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.68,
                        win_criteria=0.0,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "mult_values": self.mult_weights,
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.2999,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "mult_values": self.mult_weights,
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                ],
            ),
            BetMode(
                name="bonus_buy",
                cost=100.0,
                rtp=self.rtp,
                max_win=mode_maxwins["bonus_buy"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.0001,
                        win_criteria=mode_maxwins["bonus_buy"],
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"WCAP": 1},
                            },
                            "scatter_triggers": {3: 8, 4: 2},
                            "mult_values": self.wincap_mult_weights,
                            "force_wincap": True,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.9999,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1},
                            },
                            "scatter_triggers": {3: 8, 4: 2},
                            "mult_values": self.mult_weights,
                            "force_wincap": False,
                            "force_freegame": True,
                        },
                    ),
                ],
            ),
        ]
