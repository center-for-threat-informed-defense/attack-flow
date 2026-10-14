import { ref } from "vue";
import { fetchHealthCheck } from "@/api/health";

export type ApiAvailabilityStatus = "idle" | "checking" | "available" | "unavailable";

const status = ref<ApiAvailabilityStatus>("idle");
let checkPromise: Promise<boolean> | null = null;

/**
 * Shares one session-scoped API health check between features that need to
 * choose between the hosted API and a direct provider.
 */
export function useApiAvailability() {
    async function ensureChecked(force = false): Promise<boolean> {
        if (checkPromise) { return checkPromise; }
        if (!force && status.value === "available") { return true; }
        if (!force && status.value === "unavailable") { return false; }

        status.value = "checking";
        checkPromise = fetchHealthCheck()
            .then(response => {
                status.value = response.status === "ok" ? "available" : "unavailable";
                return status.value === "available";
            })
            .catch(() => {
                status.value = "unavailable";
                return false;
            })
            .finally(() => {
                checkPromise = null;
            });

        return checkPromise;
    }

    return { status, ensureChecked };
}
