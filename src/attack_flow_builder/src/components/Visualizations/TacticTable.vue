<template>
  <div
    id="tactic-table-vis"
    v-if="groupedTechniques"
  >
    <div
      v-for="(group, index) in groupedTechniques.values()"
      :key="group.tactic.id"
      class="tactic"
      style="margin-bottom: 30px;"
    >
      <h3>
        Table {{ index + 1 }}: {{ group.tactic.id }} - {{ group.tactic.name }}
        <span v-if="group.tactic.domainLong">({{ group.tactic.domainLong }})</span>
      </h3>
      <table>
        <thead>
          <tr style="background-color: rgb(0, 91, 148);">
            <th
              width="25%"
              style="padding: 5px; color: rgb(241, 243, 244);"
            >
              Technique Name
            </th>
            <th
              width="15%"
              style="padding: 5px; color: rgb(241, 243, 244);"
            >
              ATT&amp;CK ID
            </th>
            <th
              width="50%"
              style="padding: 5px; color: rgb(241, 243, 244);"
            >
              Use
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="technique in group.techniques"
            :key="technique.id"
          >
            <td style="padding: 5px;">
              {{ technique.name }}
            </td>
            <td style="padding: 5px;">
              <a
                :href="getTechniqueUrl(technique.id, technique.name, group.tactic.domainShort)"
                target="_blank"
              >{{
                technique.id }}</a>
            </td>
            <td style="padding: 5px;">
              {{ technique.description }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div
    id="tactic-table-vis"
    v-else
  >
    No data
  </div>
</template>
<script setup lang="ts">
import { StringProperty, TTPTupleProperty } from '@/assets/scripts/OpenChart/DiagramModel';
import { useApplicationStore } from '@/stores/ApplicationStore';
import { computed } from 'vue';
import {
    getTacticNameFromLabel,
    getTechniqueNameFromLabel,
    getDomainCodeFromLabel
} from '@/assets/configuration/AttackFlowTemplates/TTPFrameworkConstants.ts';

const app = useApplicationStore();

interface GroupedTechnique {
    tactic: {
        id: string,
        name: string,
        order: number,
        domainShort: string,
        domainLong: string
    },
    techniques: {
        id: string,
        name: string,
        description: string
    }[]
}

const domainShortToLong: { [key: string]: string } = {
    "ENT": "Enterprise",
    "ATL": "Atlas",
    "D3F": "D3FEND",
    "ICS": "Industrial Control Systems",
    "MOB": "Mobile",
    "F3": "Fight Fraud Framework"
};

const groupedTechniques = computed<Map<string, GroupedTechnique> | null>(() => {
    const blocks = app.activeEditor.file.canvas.blocks;

    if (!blocks.length) {
        return null;
    }

    const actionBlocks = blocks.filter(b => b.id === 'action');

    if (!actionBlocks.length) {
        return null;
    }

    let result = new Map<string, GroupedTechnique>();

    for (const block of actionBlocks) {
        const ttp = block.properties.get("ttp", TTPTupleProperty);
        const blockDescription = block.properties.get("description", StringProperty)?.value || "";

        if (ttp) {
            const tacticProp = ttp.value.get("tactic") as StringProperty | undefined;
            const techniqueProp = ttp.value.get("technique") as StringProperty | undefined;

            const tacticId = tacticProp?.value;
            const techniqueId = techniqueProp?.value;

            if (techniqueId) {
                const tacticKey = tacticId || "(NA)";
                if (!result.has(tacticKey)) {
                    if (tacticKey === "(NA)") {
                        result.set(tacticKey, {
                            tactic: {
                                id: tacticKey,
                                name: "(Tactic Not Provided)",
                                order: 99,
                                domainShort: "",
                                domainLong: ""
                            },
                            techniques: []
                        })
                    } else {
                        const tacticStr = (tacticProp as StringProperty).toString();
                        const domainCode = getDomainCodeFromLabel(tacticStr);
                        result.set(tacticKey, {
                            tactic: {
                                id: tacticKey,
                                name: getTacticNameFromLabel(tacticStr),
                                order: 0,
                                domainShort: domainCode,
                                domainLong: domainShortToLong[domainCode] || ""
                            },
                            techniques: []
                        })
                    }

                }
                const techniqueStr = techniqueProp.toString();
                const groupedTechnique = result.get(tacticKey) as GroupedTechnique;
                groupedTechnique.techniques.push({
                    id: techniqueId,
                    name: getTechniqueNameFromLabel(techniqueStr),
                    description: blockDescription
                });
            }
        }
    }

    if (result.size) {
        // Sort by the "tactic.order" field.
        result = new Map([...result.entries()].sort((a, b) => {
            return a[1].tactic.order - b[1].tactic.order;
        }));

        return result;
    }

    return null;
});

function getTechniqueUrl(techniqueId: string, techniqueName: string, domainShort: string) {
    switch (domainShort) {
        case "ENT":
        case "MOB":
        case "ICS":
            return `https://attack.mitre.org/techniques/${techniqueId.replace('.', '/')}/`;
        case "ATL":
            return `https://atlas.mitre.org/techniques/${techniqueId}`;
        case "D3F":
            return `https://d3fend.mitre.org/technique/d3f:${techniqueName.replaceAll(' ', '')}/`;
        case "F3":
            return `https://ctid.mitre.org/fraud#/technique/${techniqueId.replace('F3.', '')}`;
    }
    return "";
}


</script>
<style scoped>
#tactic-table-vis {
    background-color: white;
    padding: 1px;
    /* prevent margin collapse */
}

h3 {
    margin: 0;
    margin-bottom: 5px;
    font-family: "Times New Roman", serif;
}

table {
    width: 100%;
    border-collapse: collapse;
}

a {
    color: rgb(49, 130, 189);
}

a:hover {
    text-decoration: underline;
}

th {
    text-align: left;
}

tr:not(:last-child) {
    border-bottom: solid 1px #eee;
}
</style>
