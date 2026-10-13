// Pure rules for blocking (no database, unit-tested).

export type BlockLink = { blockerId: string; blockedId: string };

export type BlockState = {
  iBlocked: boolean; // the viewer blocked them (the viewer can undo it)
  blockedMe: boolean; // they blocked the viewer
};

// How two people stand, given the block rows between them.
export function blockStateFrom(
  viewerId: string,
  otherId: string,
  links: BlockLink[],
): BlockState {
  return {
    iBlocked: links.some(
      (l) => l.blockerId === viewerId && l.blockedId === otherId,
    ),
    blockedMe: links.some(
      (l) => l.blockerId === otherId && l.blockedId === viewerId,
    ),
  };
}

// A block works both ways: if either one blocked the other, they keep apart.
export function isBlockedEitherWay(state: BlockState): boolean {
  return state.iBlocked || state.blockedMe;
}
