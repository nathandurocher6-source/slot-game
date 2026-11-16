"""Generate clean, balanced reel strips for 0_0_skeleton_5x5."""

import random
import os

REELS_DIR = os.path.dirname(os.path.abspath(__file__)) + "/reels"
os.makedirs(REELS_DIR, exist_ok=True)

def generate_reel_strip(length, weights, num_reels=5, min_scatter_dist=6):
    reels = [[] for _ in range(num_reels)]
    symbols = list(weights.keys())
    probs = [weights[s] for s in symbols]

    for r in range(num_reels):
        strip = []
        last_s_pos = -999
        while len(strip) < length:
            sym = random.choices(symbols, probs)[0]
            if sym == "S":
                if len(strip) - last_s_pos < min_scatter_dist:
                    continue
                last_s_pos = len(strip)
            strip.append(sym)
        # Ensure wrap-around distance for scatter
        first_s = next((i for i, s in enumerate(strip) if s == "S"), None)
        if first_s is not None and (length - last_s_pos + first_s) < min_scatter_dist:
            strip[last_s_pos] = "L1"
        reels[r] = strip
    return reels

def save_csv(filename, reels):
    filepath = os.path.join(REELS_DIR, filename)
    length = len(reels[0])
    with open(filepath, "w") as f:
        for row in range(length):
            line = ",".join(reels[r][row] for r in range(len(reels)))
            f.write(line + "\n")
    print(f"Saved {filepath} with {length} rows.")

# 1. Base Game Reels (BR0.csv)
br0_weights = {
    "L1": 25, "L2": 24, "L3": 23, "L4": 22, "L5": 22,
    "H1": 12, "H2": 15, "H3": 18, "H4": 20,
    "W": 10, "M": 10, "S": 10,
}
random.seed(42)
br0 = generate_reel_strip(240, br0_weights, num_reels=5, min_scatter_dist=7)
save_csv("BR0.csv", br0)

# 2. Free Game Reels (FR0.csv)
fr0_weights = {
    "L1": 18, "L2": 18, "L3": 18, "L4": 18, "L5": 18,
    "H1": 18, "H2": 20, "H3": 22, "H4": 24,
    "W": 16, "M": 18, "S": 8,
}
random.seed(1337)
fr0 = generate_reel_strip(240, fr0_weights, num_reels=5, min_scatter_dist=7)
save_csv("FR0.csv", fr0)

# 3. Wincap Reels (WCAP.csv) - Heavy in H1, W and M to reliably cross 100,000x wincap
wcap_weights = {
    "H1": 40, "W": 30, "M": 25, "S": 5,
}
random.seed(9999)
wcap = generate_reel_strip(150, wcap_weights, num_reels=5, min_scatter_dist=7)
# Insert guaranteed M bomb rows
for row in [10, 25, 40, 60, 80]:
    for r in range(5):
        wcap[r][row] = "M"
save_csv("WCAP.csv", wcap)

print("Reels generation complete!")
