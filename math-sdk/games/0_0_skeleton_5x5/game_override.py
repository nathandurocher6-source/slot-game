from game_executables import GameExecutables


class GameStateOverride(GameExecutables):
    """
    Overrides or extends universal state.py functions for 5x5 skeleton.
    """

    def reset_book(self):
        super().reset_book()
        self.tumble_win = 0
        self.reset_grid_mults()

    def reset_fs_spin(self):
        super().reset_fs_spin()
        self.reset_grid_mults()

    def assign_special_sym_function(self):
        pass

    def check_repeat(self) -> None:
        """Checks if the spin failed a criteria constraint at any point."""
        if self.repeat is False:
            win_criteria = self.get_current_betmode_distributions().get_win_criteria()
            if win_criteria is not None and self.final_win != win_criteria:
                self.repeat = True

            if self.get_current_distribution_conditions()["force_freegame"] and not (self.triggered_freegame):
                self.repeat = True

            if self.win_manager.running_bet_win == 0 and self.criteria != "0":
                self.repeat = True
