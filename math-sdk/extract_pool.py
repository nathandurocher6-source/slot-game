"""Extract 500 weighted spins for base, bonus_booster, and bonus_buy modes."""

import csv
import io
import json
import os
import random
import zstandard

MODES = ["base", "bonus_booster", "bonus_buy"]
SAMPLE_SIZE = 1000
MODE_SEEDS = {"base": 58, "bonus_booster": 177, "bonus_buy": 8}

base_dir = os.path.dirname(os.path.abspath(__file__))
pub_dir = os.path.join(base_dir, "games", "0_0_skeleton_5x5", "library", "publish_files")
target_file = os.path.abspath(
    os.path.join(
        base_dir,
        "..",
        "web-sdk",
        "apps",
        "skeleton-5x5",
        "src",
        "stories",
        "data",
        "simulated_books_pool.json",
    )
)

os.makedirs(os.path.dirname(target_file), exist_ok=True)

results = {}
summary = {}

for mode in MODES:
    lut_path = os.path.join(pub_dir, f"lookUpTable_{mode}_0.csv")
    books_path = os.path.join(pub_dir, f"books_{mode}.jsonl.zst")

    # 1. Read lookup table
    weights = []
    payouts = []
    with open(lut_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            idx = int(row[0])
            w = int(row[1])
            p = float(row[2])
            weights.append(w)
            payouts.append(p)

    # 2. Decompress all books
    books = []
    dctx = zstandard.ZstdDecompressor()
    with open(books_path, "rb") as f:
        with dctx.stream_reader(f) as stream_reader:
            text_stream = io.TextIOWrapper(stream_reader, encoding="utf-8")
            for line in text_stream:
                if line.strip():
                    books.append(json.loads(line))

    assert len(books) == len(weights), f"Mismatch between books ({len(books)}) and weights ({len(weights)}) for mode {mode}"

    # 3. Weighted sampling of 1,000 spins
    random.seed(MODE_SEEDS[mode])
    chosen_indices = random.choices(range(len(books)), weights=weights, k=SAMPLE_SIZE)

    sampled_books = []
    total_payout_multiplier = 0.0
    wins_count = 0
    fs_count = 0

    cost = 1.0 if mode == "base" else (3.0 if mode == "bonus_booster" else 100.0)

    for idx in chosen_indices:
        b = books[idx]
        mult = float(b.get("payoutMultiplier", 0.0))
        total_payout_multiplier += mult
        if mult > 0:
            wins_count += 1
        if any(e.get("type") in ("freeSpinTrigger", "freeSpinIntro", "updateFreeSpin") for e in b.get("events", [])):
            fs_count += 1

        sampled_books.append(
            {
                "id": b.get("id", idx),
                "criteria": b.get("criteria", ""),
                "payoutMultiplier": mult,
                "events": b.get("events", []),
            }
        )

    results[mode] = sampled_books

    # In books, payoutMultiplier is in BOOK_AMOUNT_MULTIPLIER (100 = 1.0x), so divide by 100
    sample_rtp = ((total_payout_multiplier / 100.0) / (SAMPLE_SIZE * cost)) * 100.0
    sample_hit_rate = (wins_count / SAMPLE_SIZE) * 100.0

    summary[mode] = {
        "sample_size": SAMPLE_SIZE,
        "sample_rtp_pct": round(sample_rtp, 2),
        "sample_hit_rate_pct": round(sample_hit_rate, 2),
        "sample_fs_triggers": fs_count,
        "sample_fs_freq": f"1 in {round(SAMPLE_SIZE / max(1, fs_count), 1)}" if fs_count > 0 else "0",
    }

with open(target_file, "w", encoding="utf-8") as f:
    json.dump(results, f)

file_size_mb = os.path.getsize(target_file) / (1024 * 1024)
print(f"Successfully generated {target_file} ({file_size_mb:.2f} MB)")
print("Statistical Pool Summary:")
print(json.dumps(summary, indent=2))
