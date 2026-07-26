"""The partner pool and the rule that ranks it (FR-2).

A pair only works when the trade goes both ways: the peer speaks a language you
want to practise, and wants to practise one you already speak. One-way overlaps
are kept but ranked below mutual ones and labelled, so the difference stays
visible rather than being quietly hidden.

The scoring weights match the frontend's lib/matching.js exactly. Ranking moved
here so a partner cannot be chosen by whoever is holding the browser: the session
endpoint recomputes what a peer teaches and learns from this file, and ignores
whatever the client believed.

Peers are directory entries, not accounts. `list_peers` is the single seam to
replace when real users can be paired with each other.
"""

import json
from functools import lru_cache
from pathlib import Path

from app.core.constants import ANY, EXCHANGE_LANGUAGES

PEERS_PATH = Path(__file__).resolve().parent.parent / "data" / "peers.json"

# Weights from lib/matching.js. A base of 55 means even a thin one-way overlap
# reads as a plausible partner rather than a 9% insult.
BASE_SCORE = 55
PER_LANGUAGE = 9
MUTUAL_BONUS = 16
INDUSTRY_BONUS = 6
ONLINE_BONUS = 4
LEVEL_BONUS = 4
MAX_SCORE = 99


@lru_cache
def list_peers() -> list[dict]:
    return json.loads(PEERS_PATH.read_text(encoding="utf-8"))


def get_peer(peer_id: int) -> dict | None:
    return next((peer for peer in list_peers() if peer["id"] == peer_id), None)


def industries() -> list[str]:
    """Only the industries somebody in the pool actually works in.

    Offering the full list would put filters in the dropdown that return nothing
    no matter what else is selected, which reads as a broken search.
    """
    return sorted({peer["industry"] for peer in list_peers()})


def _overlap(a: list[str], b: list[str]) -> list[str]:
    return [value for value in a if value in b]


def pairing(peer: dict, speaks: list[str], wants: list[str]) -> dict:
    """What this peer can give you, what you can give them, and how well it fits.

    Kept separate from ranking because starting a session needs the same answer
    for one peer, computed from the same source, without re-running the filters.
    """
    teaches = _overlap(peer["speaks"], wants)
    learns = _overlap(peer["learning"], speaks)

    return {
        "teaches": teaches,
        "learns": learns,
        "mutual": bool(teaches and learns),
    }


def _score(peer: dict, pair: dict, industry: str, level: str) -> int:
    score = BASE_SCORE + (len(pair["teaches"]) + len(pair["learns"])) * PER_LANGUAGE

    if pair["mutual"]:
        score += MUTUAL_BONUS
    if industry != ANY and peer["industry"] == industry:
        score += INDUSTRY_BONUS
    if level != ANY and peer["level"] == level:
        score += LEVEL_BONUS
    if peer["online"]:
        score += ONLINE_BONUS

    return min(MAX_SCORE, score)


def rank(
    speaks: list[str],
    wants: list[str],
    industry: str = ANY,
    level: str = ANY,
    online_only: bool = False,
) -> list[dict]:
    """Matching peers, mutual exchanges first, best fit first within that."""
    matches = []

    for peer in list_peers():
        pair = pairing(peer, speaks, wants)
        # No shared language in either direction is not a weak match, it is no
        # match: there would be nothing for the two of them to practise.
        if not pair["teaches"] and not pair["learns"]:
            continue
        if online_only and not peer["online"]:
            continue
        if industry != ANY and peer["industry"] != industry:
            continue
        if level != ANY and peer["level"] != level:
            continue

        matches.append({**peer, **pair, "match_percent": _score(peer, pair, industry, level)})

    matches.sort(key=lambda match: (match["mutual"], match["match_percent"]), reverse=True)
    return matches


def default_speaks(user_languages: list[str] | None) -> list[str]:
    """The languages a user offers, taken from their profile.

    Amharic is the fallback rather than an empty list, because with nothing to
    offer the pairing rule can only ever return one-way matches.
    """
    speaks = [language for language in (user_languages or []) if language in EXCHANGE_LANGUAGES]
    return speaks or ["amharic"]


def default_wants(speaks: list[str]) -> list[str]:
    """Everything they do not already speak, English first where possible."""
    remaining = [language for language in EXCHANGE_LANGUAGES if language not in speaks]
    if "english" in remaining:
        return ["english"]
    return remaining[:1]
