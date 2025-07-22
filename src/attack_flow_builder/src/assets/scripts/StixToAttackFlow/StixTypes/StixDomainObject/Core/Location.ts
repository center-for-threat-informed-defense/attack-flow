import type { BaseStixDomainObject } from "../StixDomainObjectBase";

/**
 * STIX 2.1 Location.
 * @remarks
 *  At least one of the following properties/sets of properties MUST be provided:
 *  - `region`
 *  - `country`
 *  - `latitude` and `longitude`
 */
export interface Location extends BaseStixDomainObject<"location"> {

    /**
     * A name used to identify the Location.
     */
    name?: string;

    /**
     * A textual description of the Location.
     */
    description?: string;

    /**
     * The latitude of the Location in decimal degrees. Positive numbers
     * describe latitudes north of the equator, and negative numbers describe
     * latitudes south of the equator. The value of this property MUST be
     * between -90.0 and 90.0, inclusive.
     *
     * If the longitude property is present, this property MUST be present.
     */
    latitude?: number;

    /**
     * The longitude of the Location in decimal degrees. Positive numbers
     * describe longitudes east of the prime meridian and negative numbers
     * describe longitudes west of the prime meridian. The value of this
     * property MUST be between -180.0 and 180.0, inclusive.
     *
     * If the latitude property is present, this property MUST be present.
     */
    longitude?: number;

    /**
     * Defines the precision of the coordinates specified by the latitude and
     * longitude properties. This is measured in meters. The actual Location may
     * be anywhere up to precision meters from the defined point.
     *
     * If this property is not present, then the precision is unspecified.
     *
     * If this property is present, the latitude and longitude properties MUST
     * be present.
     */
    precision?: number;

    /**
     * The region that this Location describes.
     *
     * The value for this property SHOULD come from the region-ov open
     * vocabulary.
     */
    region?: string;

    /**
     * The country that this Location describes. This property SHOULD contain a
     * valid ISO 3166-1 ALPHA-2 Code [ISO3166-1].
     */
    country?: string;

    /**
     * The state, province, or other sub-national administrative area that this
     * Location describes.
     *
     * This property SHOULD contain a valid ISO 3166-2 Code [ISO3166-2].
     */
    administrative_area?: string;

    /**
     * The city that this Location describes.
     */
    city?: string;

    /**
     * The street address that this Location describes. This property includes
     * all aspects or parts of the street address. For example, some addresses
     * may have multiple lines including a mailstop or apartment number.
     */
    street_address?: string;

    /**
     * The postal code for this Location.
     */
    postal_code?: string;

}
