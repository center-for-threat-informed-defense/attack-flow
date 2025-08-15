/**
 * The edge's position relative to its source node.
 */
export enum SourceSide {
    North = 0x00000001,
    East  = 0x00000010,
    South = 0x00000100,
    West  = 0x00001000
}

/**
 * The edge's position relative to its target node.
 */
export enum TargetSide {
    North = 0x00010000,
    East  = 0x00100000,
    South = 0x01000000,
    West  = 0x10000000
}

/**
 * Any side enum.
 */
export const AnySide = 
    SourceSide.North |
    SourceSide.East |
    SourceSide.South |
    SourceSide.West |
    TargetSide.North |
    TargetSide.East |
    TargetSide.South |
    TargetSide.West;
