export enum LayoutUpdateReason {
    Initialization = 0b00001,
    Movement       = 0b00010,
    ChildAdded     = 0b00100,
    ChildDeleted   = 0b01000,
    PropUpdate     = 0b10000
}
