import { describe, it, expect } from 'vitest';

import { isValidInviteCode, testRoomCodeOf } from './inviteCode';
import type { RoomInfo } from './tauri';

describe('isValidInviteCode', () => {
  it('accepts a 6-character code drawn from the invite alphabet', () => {
    expect(isValidInviteCode('ABC234')).toBe(true);
  });

  it('accepts lower case, because the input and the deep link both upper-case', () => {
    expect(isValidInviteCode('abc234')).toBe(true);
  });

  it.each([
    ['too short', 'ABC'],
    ['too long', 'ABC2345'],
    ['a confusable 0', 'ABC0EF'],
    ['a confusable O', 'ABCOEF'],
    ['a confusable I', 'ABCIEF'],
    ['a confusable 1', 'ABC1EF'],
    ['a confusable L', 'ABCLEF'],
    ['empty', ''],
  ])('rejects %s', (_label, code) => {
    expect(isValidInviteCode(code)).toBe(false);
  });
});

describe('testRoomCodeOf', () => {
  const room = (inviteCode: string, testRoom?: boolean): RoomInfo => ({
    id: inviteCode.toLowerCase(),
    name: 'Jam',
    peer_count: 0,
    max_peers: 10,
    has_password: false,
    invite_code: inviteCode,
    ...(testRoom === undefined ? {} : { test_room: testRoom }),
  });

  it('returns the code of the room the server marks as its test room', () => {
    expect(testRoomCodeOf([room('ABC234'), room('XYZ789', true)])).toBe('XYZ789');
  });

  it('returns null when the server marks no room, so no shortcut is shown', () => {
    expect(testRoomCodeOf([room('ABC234', false), room('XYZ789')])).toBeNull();
    expect(testRoomCodeOf([])).toBeNull();
  });
});
