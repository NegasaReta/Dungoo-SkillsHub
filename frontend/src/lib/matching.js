/**
 * Peer language-exchange pairing (FR-2).
 *
 * A pair only works when the trade goes both ways: the peer speaks a language you
 * want to practise, and wants to practise a language you already speak. One-way
 * overlaps are kept but ranked below mutual ones and labelled as such, so the
 * difference stays visible instead of being quietly hidden.
 */
const overlap = (a = [], b = []) => a.filter((value) => b.includes(value))

const SCORE = {
  base: 55,
  perLanguage: 9,
  mutual: 16,
  industry: 6,
  online: 4,
  level: 4,
}

export function rankPeers(peers, { speaks = [], wants = [], industry = 'any', level = 'any', onlineOnly = false }) {
  return peers
    .map((peer) => {
      // What they can give you, and what you can give them.
      const teaches = overlap(peer.speaks, wants)
      const learns = overlap(peer.learning, speaks)
      const mutual = teaches.length > 0 && learns.length > 0

      let score = SCORE.base + (teaches.length + learns.length) * SCORE.perLanguage
      if (mutual) score += SCORE.mutual
      if (industry !== 'any' && peer.industry === industry) score += SCORE.industry
      if (level !== 'any' && peer.level === level) score += SCORE.level
      if (peer.online) score += SCORE.online

      return { ...peer, teaches, learns, mutual, matchPercent: Math.min(99, score) }
    })
    .filter((peer) => peer.teaches.length || peer.learns.length)
    .filter((peer) => (onlineOnly ? peer.online : true))
    .filter((peer) => (industry === 'any' ? true : peer.industry === industry))
    .filter((peer) => (level === 'any' ? true : peer.level === level))
    .sort((a, b) => Number(b.mutual) - Number(a.mutual) || b.matchPercent - a.matchPercent)
}
