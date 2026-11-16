"""Game calculations for 0_0_skeleton_5x5."""

from src.executables.executables import Executables
from src.calculations.cluster import Cluster
from src.calculations.board import Board
from src.config.config import Config


class GameCalculations(Executables):
    """Cluster calculations and multiplier evaluation for 5x5 skeleton."""

    def evaluate_clusters_5x5(
        self,
        config: Config,
        board: Board,
        clusters: dict,
        global_multiplier: int = 1,
        return_data: dict = None,
    ):
        """Evaluate orthogonal clusters on the 5x5 board.
        Winning symbols are marked with explode = True.
        Multiplier (M) and Scatter (S) symbols never explode.
        """
        if return_data is None:
            return_data = {"totalWin": 0.0, "wins": []}

        total_win = 0.0
        special_names = set(config.special_symbols.get("scatter", []) + config.special_symbols.get("multiplier", []))

        for sym in clusters:
            if sym in special_names:
                continue

            for cluster in clusters[sym]:
                syms_in_cluster = len(cluster)
                if (syms_in_cluster, sym) in config.paytable:
                    sym_base_win = config.paytable[(syms_in_cluster, sym)]
                    symwin_mult = sym_base_win
                    total_win += symwin_mult
                    json_positions = [{"reel": p[0], "row": p[1]} for p in cluster]

                    central_pos = Cluster.get_central_cluster_position(json_positions)
                    return_data["wins"].append(
                        {
                            "symbol": sym,
                            "clusterSize": syms_in_cluster,
                            "win": symwin_mult,
                            "positions": json_positions,
                            "meta": {
                                "globalMult": global_multiplier,
                                "clusterMult": 1,
                                "winWithoutMult": sym_base_win,
                                "overlay": {"reel": central_pos[0], "row": central_pos[1]},
                            },
                        }
                    )

                    for pos in cluster:
                        board[pos[0]][pos[1]].explode = True

        return_data["totalWin"] += total_win
        return board, return_data

    def get_board_multiplier_sum(self):
        """Sum of all multiplier bomb values from M symbols currently visible on board."""
        total_mult = 0
        mult_positions = []
        for reel, _ in enumerate(self.board):
            for row, _ in enumerate(self.board[reel]):
                if self.board[reel][row].check_attribute("multiplier"):
                    val = self.board[reel][row].get_attribute("multiplier")
                    if val is not None and val > 0:
                        total_mult += val
                        mult_positions.append({"reel": reel, "row": row, "value": val})
        return total_mult, mult_positions
