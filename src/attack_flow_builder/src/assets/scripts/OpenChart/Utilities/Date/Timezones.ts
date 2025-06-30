import { DateTime } from "luxon";

/**
 * Returns the device's supported list of timezones.
 * @returns
 *  The device's supported timezones.
 */
export function getDeviceTimezones() {
    // Cast `supportedValuesOf` support
    const _Intl = Intl as unknown as { 
        supportedValuesOf(str: string): string []
    };
    // Collect timezone offsets
    const timeZones = new Map<string, DateTime>();
    for(const zone of _Intl.supportedValuesOf("timeZone")) {
        const timeZone = DateTime.local({ zone });
        timeZones.set(zone, timeZone);
    }
    return timeZones;
}
