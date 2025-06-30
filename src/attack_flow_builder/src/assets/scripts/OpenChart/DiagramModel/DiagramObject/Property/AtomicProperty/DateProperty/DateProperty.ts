import { Property } from "../..";
import { Timezones } from "./Timezones";
import { DateTime, Settings } from "luxon";
import { EnumProperty, ListProperty } from "../..";
import type { JsonValue } from "../..";
import type { DateJsonValue } from "./DateValue";
import type { PropertyMetadata } from "../../PropertyMetadata";

export class DateProperty extends Property {

    /**
     * The property's supported timezones.
     */
    public static timezones: ListProperty = Timezones;

    /**
     * The property's timezone.
     */
    public readonly timezone: EnumProperty;
    
    /**
     * The internal property's value.
     */
    private _time: DateTime | null;

    /**
     * The property's value.
     */
    public get time(): DateTime | null {
        return this._time;
    }


    /**
     * Creates a new {@link DateProperty}.
     * @param id
     *  The property's id.
     * @param editable
     *  Whether the property is editable.
     * @param meta
     *  The property's auxiliary metadata.
     * @param value
     *  The property's value.
     */
    constructor(
        id: string,
        editable: boolean,
        meta?: PropertyMetadata,
        value?: JsonValue
    ) {
        super(id, editable, meta);
        this._time = null;
        this.timezone = new EnumProperty("tz", true, DateProperty.timezones);
        // Set value
        const now = DateTime.now();
        if ((value ?? null) === null) {
            this.setTime(null);
            this.setTimezone(now.zoneName);
        } else if(typeof value === "string") {
            this.setTime(DateTime.fromISO(value));
            this.setTimezone(now.zoneName);
        } else if (this.isJsonDateValue(value)) {
            this.setTime(DateTime.fromISO(value.time));
            this.setTimezone(value.zone);
        } else {
            this.setTime(now);
            this.setTimezone(now.zoneName);
        }
    }


    /**
     * Tests if the property is defined.
     * @returns
     *  True if the property is defined, false otherwise.
     */
    public isDefined(): boolean {
        return this._time !== null;
    }

    /**
     * Sets the property's value.
     * @param value
     *  The new value.
     */
    public setTime(value: DateTime | Date | null) {
        const tz = this.timezone.value ?? Settings.defaultZone.name;
        if(value === null) {
            this._time = null;
        } else if(value instanceof DateTime) {
            this._time = value.setZone(tz, {
                keepLocalTime: true
            });
        } else if (value instanceof Date) {
            this._time = DateTime.fromJSDate(value).setZone(tz, { 
                keepLocalTime: true
            });
        }
        this.updateParentProperty();
    }

    /**
     * Sets the property's timezone component.
     * @remarks
     *  Expected format: [+-]00:00
     * @param tz
     *  The timezone's offset.  
     */
    public setTimezone(tz: string | null) {
        tz ??= Settings.defaultZone.name;
        // Set timezone
        this.timezone.setValue(tz);
        // Update date object
        if(this._time) {
            this._time = this._time.setZone(tz, { keepLocalTime: true });
        }
        this.updateParentProperty();
    }

    /**
     * Returns the property's JSON value.
     * @returns
     *  The property's JSON value.
     */
    public toJson(): DateJsonValue | null {
        if(this._time === null) {
            return null
        } else {
            return {
                time: this._time.toISO() ?? this._time.invalidExplanation!,
                zone: this.timezone.value ?? Settings.defaultZone.name
            };
        }
        
    }

    /**
     * Returns the property as a string.
     * @returns
     *  The property as a string.
     */
    public toString(): string {
        if(this._time) {
            const zone = this._time.toFormat("ZZ");
            const time = this._time.toLocaleString(DateTime.DATETIME_SHORT);
            return `${time} ${zone}`;
        } else {
            return "None";
        }
    }

    /**
     * Returns the property's hashed value.
     * @returns
     *  The property's hashed value.
     */
    public toHashValue(): number {
        if (this._time === null) {
            return this.computeHash("");
        } else {
            const str = `${this._time.toString()}.${this.timezone.value}`;
            return this.computeHash(str);
        }
    }

    /**
     * Returns a clone of the property.
     * @param id
     *  The property's id.
     * @returns
     *  A clone of the property.
     */
    public clone(id: string = this.id): DateProperty {
        return new DateProperty(id, this.isEditable, this.metadata, this.toJson());
    }

    /**
     * Tests if a {@link JsonValue} can be cast to a {@link DateJsonValue}.
     * @param value
     *  The {@link JsonValue}.
     * @returns
     *  True if it can be cast, false otherwise.
     */
    private isJsonDateValue(value?: JsonValue): value is DateJsonValue {
        if(value && typeof value === "object") {
            return "time" in value && "zone" in value;
        } else {
            return false;
        }
    } 

}
