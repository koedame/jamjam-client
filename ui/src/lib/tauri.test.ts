/**
 * Peer candidate address ordering
 *
 * Mirrors `PeerInfo::get_sorted_candidates` (src/network/signaling.rs) so a
 * peer on the same network is tried directly instead of only through its
 * public address (REQ-CON-113).
 */

import { describe, it, expect } from 'vitest';

import { peerSortedAddrs, type PeerInfo } from './tauri';

function peerWith(
  candidates: Array<{ address: string; type: 'Host' | 'ServerReflexive'; priority: number }>,
  publicAddr: string | null = null,
  localAddr: string | null = null
): PeerInfo {
  return {
    id: 'peer-1',
    name: 'peer',
    candidates: candidates.map((c) => ({
      address: c.address,
      candidate_type: c.type,
      priority: c.priority,
    })),
    public_addr: publicAddr,
    local_addr: localAddr,
  };
}

describe('peerSortedAddrs', () => {
  // Verifies: REQ-CON-113
  it('ranks a higher-priority host candidate above a lower-priority public one', () => {
    const peer = peerWith([
      { address: '203.0.113.7:5000', type: 'ServerReflexive', priority: 100 },
      { address: '192.168.1.20:5000', type: 'Host', priority: 126 },
    ]);
    expect(peerSortedAddrs(peer)).toEqual(['192.168.1.20:5000', '203.0.113.7:5000']);
  });

  it('appends the legacy public_addr and local_addr when not already listed', () => {
    const peer = peerWith(
      [{ address: '192.168.1.20:5000', type: 'Host', priority: 126 }],
      '203.0.113.7:5000',
      '192.168.1.20:5000'
    );
    expect(peerSortedAddrs(peer)).toEqual(['192.168.1.20:5000', '203.0.113.7:5000']);
  });

  it('falls back to the legacy public_addr when the peer has no candidates', () => {
    const peer = peerWith([], '203.0.113.7:5000', null);
    expect(peerSortedAddrs(peer)).toEqual(['203.0.113.7:5000']);
  });

  it('returns an empty list when the peer has published no address at all', () => {
    expect(peerSortedAddrs(peerWith([]))).toEqual([]);
  });
});
