const Left   = 0x000001;
const Center = 0x000010;
const Right  = 0x000100;
const Top    = 0x001000;
const Middle = 0x010000;
const Bottom = 0x100000;

export class PivotPoint {

    /**
     * Point aligned to the top-left of a box.
     */
    public static TopLeft: number = Top | Left;
    
    /**
     * Point aligned to the top-center of a box.
     */
    public static Top: number = Top | Center;
    
    /**
     * Point aligned to the top-right of a box.
     */
    public static TopRight: number = Top | Right;

    /**
     * Point aligned to the middle-left of a box.
     */
    public static MiddleLeft: number = Middle | Left;
    
    /**
     * Point aligned to the direct center of a box.
     */
    public static Middle: number = Middle | Center;

    /**
     * Point aligned to the middle-right of a box.
     */
    public static MiddleRight: number = Middle | Right;
    
    /**
     * Point aligned to the bottom-left of a box.
     */
    public static BottomLeft: number = Bottom | Left;
    
    /**
     * Point aligned to the bottom-center of a box.
     */
    public static Bottom: number = Bottom | Center;

    /**
     * Point aligned to the bottom-right of a box.
     */
    public static BottomRight: number = Bottom | Right;

    /**
     * Tests if a point is left-aligned.
     * @param point
     *  The point.
     * @returns
     *  True if the point is left-aligned, false otherwise.
     */
    public static isLeftAligned(point: number): boolean {
        return (point & Left) === Left;
    }

    /**
     * Tests if a point is center-aligned.
     * @param point
     *  The point.
     * @returns
     *  True if the point is center-aligned, false otherwise.
     */
    public static isCenterAligned(point: number): boolean {
        return (point & Center) === Center;
    }

    /**
     * Tests if a point is right-aligned.
     * @param point
     *  The point.
     * @returns
     *  True if the point is right-aligned, false otherwise.
     */
    public static isRightAligned(point: number): boolean {
        return (point & Right) === Right;
    }

    /**
     * Tests if a point is top-aligned.
     * @param point
     *  The point.
     * @returns
     *  True if the point is top-aligned, false otherwise.
     */
    public static isTopAligned(point: number): boolean {
        return (point & Top) === Top;
    }

    /**
     * Tests if a point is middle-aligned.
     * @param point
     *  The point.
     * @returns
     *  True if the point is middle-aligned, false otherwise.
     */
    public static isMiddleAligned(point: number): boolean {
        return (point | Middle) === Middle;
    }

    /**
     * Tests if a point is bottom-aligned.
     * @param point
     *  The point.
     * @returns
     *  True if the point is bottom-aligned, false otherwise.
     */
    public static isBottomAligned(point: number): boolean {
        return (point & Bottom) === Bottom;
    }

}
