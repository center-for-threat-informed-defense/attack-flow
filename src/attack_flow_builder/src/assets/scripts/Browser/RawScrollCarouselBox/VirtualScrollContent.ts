import { clamp, floorNearestMultiple } from "../Math";

export class VirtualScrollState<T> {

    /**
     * The scroll content.
     */
    private _items: T[];

    /**
     * The visible content.
     */
    private _content: T[];

    /**
     * The item height.
     */
    public itemHeight: number;

    /**
     * The item margin.
     */
    public itemMargin: number;

    /**
     * The item number.
     */
    public itemNumber: number;

    /**
     * The content's scroll top.
     */
    private _scrollTop: number;

    private _index: number;
    

    /**
     * The content's client height.
     */
    public get clientHeight(): number {
        const hei = this.itemHeight;
        const mar = this.itemMargin;
        const max = Math.min(this._items.length, this.itemNumber);
        return (max * hei) + (max - 1) * mar;
    }


    /**
     * The content's scroll height.
     */
    public get scrollHeight(): number {
        const hei = this.itemHeight;
        const mar = this.itemMargin;
        const len = this._items.length;
        return (len * hei) + (len - 1) * mar;
    }


    /**
     * The content's max scroll position.
     */
    public get scrollMax(): number {
        return this.scrollHeight - this.clientHeight;
    }


    /**
     * The scroll content.
     */
    public get items(): ReadonlyArray<T> {
        return this._items;
    }

    /**
     * The scroll content.
     */
    public set items(value: T[]) {
        // Set items
        this._items = value;
        // Recalculate visible
        this.updateContent(true);
    }


    /**
     * The content's scroll top.
     */
    public get scrollTop(): number {
        return this._scrollTop;
    };

    /**
     * The content's scroll top.
     */
    public set scrollTop(value: number) {
        // Set scroll top
        this._scrollTop = clamp(Math.round(value), 0, this.scrollMax);
        // Recalculate visible
        this.updateContent(true);
    }


    /**
     * The visible content.
     */
    public get content(): ReadonlyArray<T> {
        return this._content;
    }


    /**
     * Creates a new {@link VirtualScrollState}.
     * @param items
     *  The scroll content.
     * @param itemHeight 
     * @param itemMargin 
     * @param itemNumber 
     */
    constructor(items: T[], itemHeight: number, itemMargin: number, itemNumber: number) {
        this._items = items;
        this._content = [];
        this._scrollTop = 0;
        this.itemHeight = itemHeight;
        this.itemMargin = itemMargin;
        this.itemNumber = itemNumber;
        this._index = -1;
    }

    
    /**
     * Updates the scroll content.
     */
    private updateContent(reset: boolean) {
        // Set scroll top
        this._scrollTop = clamp(Math.round(this._scrollTop), 0, this.scrollMax);
        // Recalculate visible items
        const height = this.scrollHeight + this.itemMargin;
        const multiple = this.itemHeight + this.itemMargin;
        // console.log(floorNearestMultiple(this.scrollTop, multiple)) / multiple;
        const index = floorNearestMultiple(this.scrollTop, multiple) / multiple;
        // console.log(this);
        const delta = Math.sign(index - this._index) * 1;
        
        
        if(delta) {
            const i = this._index + delta;
            this._content = this._items.slice(i, i + this.itemNumber);
            this._index = i;
            requestAnimationFrame(() => this.updateContent(false))
        }
        
        // console.log(index, this._content);
    }



}