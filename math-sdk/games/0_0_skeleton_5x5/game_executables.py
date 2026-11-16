"""Game executables for 0_0_skeleton_5x5."""

from game_calculations import GameCalculations
from src.calculations.cluster import Cluster
from src.events.events import (
    set_win_event,
    set_total_event,
    fs_trigger_event,
    update_tumble_win_event,
    update_global_mult_event,
    update_freespin_event,
    wincap_event,
)


class GameExecutables(GameCalculations):
    """Game-specific execution methods for 5x5 skeleton."""

    def evaluate_wincap(self) -> bool:
        """Immediately trigger wincap if running bet win hits self.config.wincap (100,000x)."""
        if self.win_manager.running_bet_win >= self.config.wincap and not self.wincap_triggered:
            self.wincap_triggered = True
            wincap_event(self)
            return True
        return self.wincap_triggered

    def get_clusters_update_wins(self):
        """Find clusters on 5x5 board and update win manager."""
        clusters = Cluster.get_clusters(self.board, "wild")
        return_data = {
            "totalWin": 0.0,
            "wins": [],
        }
        self.board, self.win_data = self.evaluate_clusters_5x5(
            config=self.config,
            board=self.board,
            clusters=clusters,
            global_multiplier=self.global_multiplier,
            return_data=return_data,
        )

        Cluster.record_cluster_wins(self)
        self.win_manager.update_spinwin(self.win_data["totalWin"])
        self.win_manager.tumble_win = self.win_data["totalWin"]

    def set_end_tumble_event(self):
        """Called after all cascades/tumbles have settled for a spin.
        Applies Multipliers (M):
        - Base Game: sum of M bombs on board multiplies total tumble win for the spin.
        - Free Spins: if there is a win, sum of M bombs increments the progressive global multiplier,
          which then multiplies the spin win.
        """
        if self.gametype == self.config.basegame_type:
            if self.win_manager.spin_win > 0 and not self.wincap_triggered:
                total_m, m_positions = self.get_board_multiplier_sum()
                if total_m > 0:
                    base_win = self.win_manager.spin_win
                    multiplied_win = base_win * total_m
                    self.win_manager.set_spin_win(multiplied_win)
                    self.global_multiplier = total_m
                    update_global_mult_event(self)
                    update_tumble_win_event(self)
                    self.evaluate_wincap()
        else:
            # Free Spins
            if self.win_manager.spin_win > 0 and not self.wincap_triggered:
                total_m, m_positions = self.get_board_multiplier_sum()
                if total_m > 0:
                    self.global_multiplier += total_m
                    update_global_mult_event(self)

                if self.global_multiplier > 1:
                    base_win = self.win_manager.spin_win
                    multiplied_win = base_win * self.global_multiplier
                    self.win_manager.set_spin_win(multiplied_win)
                    update_tumble_win_event(self)
                    self.evaluate_wincap()

        if self.win_manager.spin_win > 0:
            set_win_event(self)
        set_total_event(self)

    def update_freespin_amount(self, scatter_key: str = "scatter") -> None:
        """Trigger Free Spins feature from basegame."""
        num_scatters = self.count_special_symbols(scatter_key)
        triggers = self.config.freespin_triggers[self.gametype]
        matched_trigger = max((k for k in triggers.keys() if num_scatters >= k), default=min(triggers.keys()))
        self.tot_fs = triggers[matched_trigger]

        basegame_trigger = (self.gametype == self.config.basegame_type)
        freegame_trigger = not basegame_trigger
        fs_trigger_event(self, basegame_trigger=basegame_trigger, freegame_trigger=freegame_trigger)

    def update_fs_retrigger_amt(self, scatter_key: str = "scatter") -> None:
        """Add additional Free Spins upon retrigger."""
        num_scatters = self.count_special_symbols(scatter_key)
        triggers = self.config.freespin_triggers[self.gametype]
        matched_trigger = max((k for k in triggers.keys() if num_scatters >= k), default=min(triggers.keys()))
        self.tot_fs += triggers[matched_trigger]
        fs_trigger_event(self, freegame_trigger=True, basegame_trigger=False)

    def update_freespin(self) -> None:
        """Pre-spin step during Free Spins. Global multiplier persists."""
        self.fs += 1
        update_freespin_event(self)
        update_global_mult_event(self)
        self.win_manager.reset_spin_win()
        self.tumblewin_mult = 0
        self.win_data = {}
