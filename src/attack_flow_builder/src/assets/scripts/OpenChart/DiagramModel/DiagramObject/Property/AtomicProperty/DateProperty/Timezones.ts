import { ListProperty } from "../../CollectionProperty/ListProperty";
import { StringProperty } from "../StringProperty";
import { getDeviceTimezones } from "@/assets/scripts/OpenChart/Utilities";

// Create timezone list element
const timezone = new StringProperty({
    id       : "timezone",
    editable : false
});

// Create timezone list
const timezones = new ListProperty({
    id       : "timezones",
    editable : false,
    template : timezone
});
for(const id of getDeviceTimezones().keys()) {
    const item = timezones.createListItem() as StringProperty;
    item.setValue(id.replace(/_/g, " "));
    timezones.addProperty(item, id);
}

// Export list
export const Timezones = timezones;
