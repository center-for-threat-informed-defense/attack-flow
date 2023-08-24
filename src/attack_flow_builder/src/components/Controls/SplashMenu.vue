<template>
    <div class="splash-menu-control" :class="{
        hidden: !isShowingSplash
    }">
        <div class="splash-menu-container">
            <div class="header">
                <img class="product" :src="product" />
                <img class="organization" v-if="organization" :src="organization" />
            </div>
            <div class="section-grid">
                <div class="button" v-for="button of buttons" @click="handleClick(button)">
                    <h1 class="name">
                        {{ button.name }}
                        <NewFlow class="icon" v-if="button.action === 'new'" />
                        <OpenFlow class="icon" v-else-if="button.action === 'open'" />
                        <Link class="icon" v-else-if="button.action === 'link'" />
                    </h1>
                    <p class="description">{{ button.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
const Images = require.context("../../assets", false);
import Configuration from "@/assets/builder.config"
import { mapGetters, mapMutations, mapState } from 'vuex';
// Dependencies
import { defineComponent } from 'vue';
import { ApplicationStore, SplashButton, SplashButtonAction } from "@/store/StoreTypes";
import * as App from "@/store/Commands/AppCommands";
// Components
import NewFlow from "@/components/Icons/NewFlow.vue";
import OpenFlow from "@/components/Icons/OpenFlow.vue";
import Link from "@/components/Icons/Link.vue";

export default defineComponent({
    name: 'SplashMenu',
    data() {
        let organization;
        if (Configuration.splash.organization) {
            organization = Images(Configuration.splash.organization);
        }
        return {
            product: Images(Configuration.splash.product),
            organization,
            buttons: Configuration.splash.buttons,
        }
    },
    computed: {
        ...mapState("ApplicationStore", {
            ctx(state: ApplicationStore): ApplicationStore {
                return state;
            }
        }),

        ...mapGetters("ApplicationStore", ["isShowingSplash"]),
    },
    methods: {
        /**
         * Application Store mutations
         */
        ...mapMutations("ApplicationStore", ["execute"]),

        async handleClick(button: SplashButton) {
            switch (button.action) {
                case SplashButtonAction.New:
                    this.execute(await App.LoadFile.fromNew(this.ctx));
                    this.execute(new App.HideSplashMenu(this.ctx));
                    break;
                case SplashButtonAction.Open:
                    this.execute(await App.LoadFile.fromFileSystem(this.ctx));
                    this.execute(new App.HideSplashMenu(this.ctx));
                    break;
                case SplashButtonAction.Link:
                    if (button.url !== undefined) {
                        this.execute(new App.OpenHyperlink(this.ctx, button.url));
                    }
                    break;
                default:
                    throw new Error(`Unknown splash button action: ${button.action}`);
            }
        }
    },
    components: {
        Link,
        NewFlow,
        OpenFlow,
    },
});
</script>

<style scoped>
/** === Main Control === */

.splash-menu-control {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.hidden {
    visibility: hidden;
}

.splash-menu-container {
    border: solid 1px #474747;
    border-radius: 5px;
    width: 500px;
    margin: 30px 0px;
    background: #242424;
    overflow: hidden;
    box-shadow: #000000 0px 0px 10px 3px;
}

/** === Header === */

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 25px;
    border-bottom: solid 1px #474747;
    background: #383838;
    pointer-events: none;
    user-select: none;
}

.product,
.organization {
    height: 50px;
}

/** === Sections === */

.section-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 25px;
}

/** === Buttons === */

.button {
    width: calc(50% - 20px);
    padding: 25px;
    border: solid 1px #383838;
    border-radius: 3px;
    box-sizing: border-box;
    user-select: none;
    margin: 10px;
}

.button:hover {
    background: #383838;
    ;
}

.button .name {
    color: #726de2;
    font-size: 12pt;
    font-weight: 700;
    margin: 0px 0px 8px 0px;
}

.button .name .icon {
    position: relative;
    fill: #726de2;
    width: 18px;
    height: 18px;
    top: 3px;
    left: 3px;
}

.button .description {
    color: #d9d9d9;
    font-size: 10.5pt;
    font-weight: 400;
}
</style>
