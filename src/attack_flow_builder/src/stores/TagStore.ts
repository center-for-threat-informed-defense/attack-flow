import { defineStore } from "pinia";
import { ref } from "vue";

export const useTagStore = defineStore("tagStore", () => {
    const activeTagName = ref<string | null>(null);
    const activeTagColor = ref<string | null>(null);

    function setActiveTag(name: string | null, color: string | null) {
        activeTagName.value = name;
        activeTagColor.value = color;
    }

    return { activeTagName, activeTagColor, setActiveTag };
});
