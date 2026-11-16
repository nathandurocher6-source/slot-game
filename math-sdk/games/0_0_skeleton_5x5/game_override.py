"""Game state override methods for 0_0_skeleton_5x5."""

from game_executables import GameExecutables
from src.calculations.statistics import get_random_outcome


class GameStateOverride(GameExecutables):
    """Overrides and custom hooks for 5x5 skeleton."""

    def reset_book(self):
        super().reset_book()
        self.tumble_win = 0
        self.global_multiplier = 1

    def reset_fs_spin(self):
        super().reset_fs_spin()
        # Progressive global multiplier starts at 1x when entering Free Spins
        self.global_multiplier = 1

    def assign_special_sym_function(self):
        """Register multiplier assignment hook for M symbols."""
        self.special_symbol_functions = {"M": [self.assign_mult_property]}

    def assign_mult_property(self, symbol):
        """Assign random outcome value from predefined multiplier values to M symbol."""
        cond_mults = self.get_current_distribution_conditions().get("mult_values")
        if cond_mults and self.gametype in cond_mults:
            multiplier_value = get_random_outcome(cond_mults[self.gametype])
        else:
            multiplier_value = 2
        symbol.assign_attribute({"multiplier": multiplier_value})

    def check_repeat(self) -> None:
        """Verify spin criteria constraints."""
        if self.repeat is False:
            win_criteria = self.get_current_betmode_distributions().get_win_criteria()
            if win_criteria is not None and self.final_win != win_criteria:
                self.repeat = True

            if self.get_current_distribution_conditions().get("force_freegame") and not self.triggered_freegame:
                self.repeat = True

            if self.win_manager.running_bet_win == 0 and self.criteria != "0":
                self.repeat = True
