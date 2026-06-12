<template>
  <div class="timeline-visualization">
    <div class="timeline-controls">
      <label>
        <span>Orientation</span>
        <select v-model="orientation">
          <option value="horizontal">
            Horizontal
          </option>
          <option value="vertical">
            Vertical
          </option>
        </select>
      </label>
      <label>
        <span>Timestamp</span>
        <select v-model="timestampFormat">
          <option value="datetime">
            Date and time
          </option>
          <option value="date">
            Date
          </option>
          <option value="time">
            Time
          </option>
        </select>
      </label>
      <label class="checkbox-control">
        <input
          v-model="showTechniqueIds"
          type="checkbox"
        >
        <span>Technique IDs</span>
      </label>
      <label>
        <span>Line</span>
        <input
          v-model="timelineColor"
          type="color"
        >
      </label>
      <label>
        <span>Line width</span>
        <input
          v-model.number="timelineWidth"
          type="range"
          min="1"
          max="5"
          step="1"
        >
      </label>
      <label>
        <span>Label border</span>
        <input
          v-model="labelOutlineColor"
          type="color"
        >
      </label>
      <label>
        <span>Label width</span>
        <input
          v-model.number="labelLineWidth"
          type="range"
          min="1"
          max="5"
          step="1"
        >
      </label>
      <label>
        <span>Label fill</span>
        <input
          v-model="labelBackgroundColor"
          type="color"
        >
      </label>
    </div>

    <div class="timeline-stage">
      <div
        id="timeline-vis"
        class="timeline-export-root"
      >
        <svg
          v-if="timelineLayout"
          :viewBox="timelineLayout.viewBox"
          :width="timelineLayout.width"
          :height="timelineLayout.height"
          role="img"
        >
          <line
            v-if="orientation === 'horizontal'"
            :x1="0"
            :y1="timelineLayout.axisPosition"
            :x2="timelineLayout.width"
            :y2="timelineLayout.axisPosition"
            :stroke="timelineColor"
            :stroke-width="timelineWidth"
          />
          <line
            v-else
            :x1="timelineLayout.axisPosition"
            :y1="0"
            :x2="timelineLayout.axisPosition"
            :y2="timelineLayout.height"
            :stroke="timelineColor"
            :stroke-width="timelineWidth"
          />

          <g
            v-for="action in timelineLayout.actions"
            :key="action.id"
            class="timeline-action"
            :transform="`translate(${action.x}, ${action.y})`"
          >
            <line
              :x1="0"
              :y1="0"
              :x2="orientation === 'vertical' ? action.stem : 0"
              :y2="orientation === 'horizontal' ? action.stem : 0"
              :stroke="labelOutlineColor"
              :stroke-width="labelLineWidth"
            />
            <g :transform="`translate(${action.labelX}, ${action.labelY})`">
              <rect
                :width="boxWidth"
                :height="boxHeight"
                :stroke="labelOutlineColor"
                :stroke-width="labelLineWidth"
                :fill="labelBackgroundColor"
              />
              <text
                v-for="(line, index) in action.lines"
                :key="`${action.id}-${index}`"
                x="7"
                :y="20 + index * 17"
                fill="black"
                font-size="11pt"
                :font-weight="line.bold ? 'bold' : 'normal'"
              >
                {{ line.text }}
              </text>
            </g>
            <circle
              r="6"
              :stroke="timelineColor"
              :stroke-width="timelineWidth"
              fill="white"
            />
          </g>
        </svg>
        <div
          v-else
          class="timeline-empty"
        >
          No actions with execution start timestamps.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { computed, ref } from "vue";
import { DateTime } from "luxon";
import { DateProperty, StringProperty, TTPTupleProperty } from "@/assets/scripts/OpenChart/DiagramModel";
import { getTechniqueNameFromLabel } from "@/assets/configuration/AttackFlowTemplates/TTPFrameworkConstants.ts";
import { useApplicationStore } from "@/stores/ApplicationStore";

type TimelineOrientation = "horizontal" | "vertical";
type TimestampFormat = "date" | "time" | "datetime";

interface TimelineAction {
    id: string;
    timestamp: number;
    datetime: string;
    techniqueId: string;
    techniqueName: string;
    description: string;
}

interface TimelineLabelLine {
    text: string;
    bold: boolean;
}

interface PositionedTimelineAction extends TimelineAction {
    stem: number;
    x: number;
    y: number;
    labelX: number;
    labelY: number;
    lines: TimelineLabelLine[];
}

interface TimelineLayout {
    width: number;
    height: number;
    axisPosition: number;
    viewBox: string;
    actions: PositionedTimelineAction[];
}

const app = useApplicationStore();

const orientation = ref<TimelineOrientation>("horizontal");
const timestampFormat = ref<TimestampFormat>("datetime");
const showTechniqueIds = ref(true);
const timelineColor = ref("#005B94");
const timelineWidth = ref(3);
const labelOutlineColor = ref("#D4D4D3");
const labelLineWidth = ref(1);
const labelBackgroundColor = ref("#F1F3F4");

const boxWidth = 180;
const boxHeight = 100;

const stemLength = 50;
const boxPadding = 10;
const textWidth = 23;
const margin = 20;

const timelineActions = computed<TimelineAction[]>(() => {
    return app.activeEditor.file.canvas.blocks
        .filter(block => block.id === "action")
        .map((block, index): TimelineAction | null => {
            const executionStart = block.properties.get("execution_start", DateProperty);
            const time = executionStart?.time;
            if (!time?.isValid) {
                return null;
            }

            const ttp = block.properties.get("ttp", TTPTupleProperty);
            const techniqueProp = ttp?.value.get("technique") as StringProperty | undefined;
            const techniqueId = techniqueProp?.value ?? "";
            const name = block.properties.get("name", StringProperty)?.value?.trim();
            const techniqueName = techniqueProp && techniqueId
                ? getTechniqueNameFromLabel(techniqueProp.toString())
                : "";

            return {
                id: block.instance || `action-${index}`,
                timestamp: time.toMillis(),
                datetime: formatTimestamp(time),
                techniqueId,
                techniqueName: name || techniqueName || "Untitled action",
                description: block.properties.get("description", StringProperty)?.value?.trim() ?? ""
            };
        })
        .filter((action): action is TimelineAction => action !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
});

const timelineLayout = computed<TimelineLayout | null>(() => {
    const actions = timelineActions.value;
    if (!actions.length) {
        return null;
    }

    const isHorizontal = orientation.value === "horizontal";
    const width = 1000;
    const height = isHorizontal ? 900 : 1000;
    const axisPosition = isHorizontal ? height / 2 : width / 2;
    const positiveLanes: [number, number][][] = [[]];
    const negativeLanes: [number, number][][] = [[]];
    const minDate = d3.min(actions, action => action.timestamp) ?? 0;
    const maxDate = d3.max(actions, action => action.timestamp) ?? minDate;
    const span = isHorizontal ? width : height;
    const dateScale = createScale(minDate, maxDate, 0, span, span / 2);
    const labelOffsetScale = createScale(minDate, maxDate, -0.03, -0.97, -0.5);

    const positioned = actions.map((action, index) => ({
        ...action,
        stem: getStemLength(
            action,
            index,
            isHorizontal,
            dateScale,
            labelOffsetScale,
            positiveLanes,
            negativeLanes
        )
    }));

    const positionedActions = positioned
        .sort((a, b) => Math.abs(b.stem) - Math.abs(a.stem))
        .map(action => {
            const x = isHorizontal ? dateScale(action.timestamp) : axisPosition;
            const y = isHorizontal ? axisPosition : dateScale(action.timestamp);
            const labelOffset = labelOffsetScale(action.timestamp);
            const labelX = isHorizontal
                ? labelOffset * boxWidth
                : action.stem - (action.stem < 0 ? boxWidth : 0);
            const labelY = isHorizontal
                ? action.stem - (action.stem < 0 ? boxHeight : 0)
                : labelOffset * boxHeight;

            return {
                ...action,
                x,
                y,
                labelX,
                labelY,
                lines: getLabelLines(action)
            };
        });

    const viewBox = isHorizontal
        ? [
            -margin,
            axisPosition - stemLength - positiveLanes.length * (boxHeight + boxPadding),
            width + margin * 2,
            axisPosition + stemLength + negativeLanes.length * (boxHeight + boxPadding)
                - (axisPosition - stemLength - positiveLanes.length * (boxHeight + boxPadding))
        ].join(" ")
        : [
            axisPosition - stemLength - negativeLanes.length * (boxWidth + boxPadding),
            -margin,
            axisPosition + stemLength + positiveLanes.length * (boxWidth + boxPadding)
                - (axisPosition - stemLength - negativeLanes.length * (boxWidth + boxPadding)),
            height + margin * 2
        ].join(" ");

    return {
        width,
        height,
        axisPosition,
        viewBox,
        actions: positionedActions
    };
});

function createScale(
    domainStart: number,
    domainEnd: number,
    rangeStart: number,
    rangeEnd: number,
    singleValue: number
): (value: number) => number {
    if (domainStart === domainEnd) {
        return () => singleValue;
    }
    return d3.scaleLinear([domainStart, domainEnd], [rangeStart, rangeEnd]);
}

function getStemLength(
    action: TimelineAction,
    index: number,
    isHorizontal: boolean,
    dateScale: (value: number) => number,
    labelOffsetScale: (value: number) => number,
    positiveLanes: [number, number][][],
    negativeLanes: [number, number][][]
): number {
    const labelSize = isHorizontal ? boxWidth : boxHeight;
    const labelOffset = labelOffsetScale(action.timestamp) * labelSize;
    const start = dateScale(action.timestamp) - labelOffset;
    const end = start + labelSize;
    const lane = index % 2 === 0
        ? getLane(positiveLanes, start - boxPadding, end + boxPadding)
        : getLane(negativeLanes, start - boxPadding, end + boxPadding);
    let stem = stemLength + lane * ((isHorizontal ? boxHeight : boxWidth) + boxPadding);
    if (index % 2 === 0) {
        stem *= -1;
    }
    return stem;
}

function getLane(lanes: [number, number][][], start: number, end: number): number {
    for (let index = 0; index < lanes.length; index++) {
        const overlaps = lanes[index].some(([laneStart, laneEnd]) => {
            return start <= laneEnd && end >= laneStart;
        });
        if (!overlaps) {
            lanes[index].push([start, end]);
            return index;
        }
    }
    lanes.push([[start, end]]);
    return lanes.length - 1;
}

function getLabelLines(action: TimelineAction): TimelineLabelLine[] {
    const heading = showTechniqueIds.value && action.techniqueId
        ? `${action.techniqueId} - ${action.techniqueName}:`
        : `${action.techniqueName}:`;
    const headingLines = wrapText(heading.trim(), textWidth, 4).map(text => ({
        text,
        bold: true
    }));
    const descriptionLineCount = Math.max(0, 4 - headingLines.length);
    const descriptionLines = action.description && descriptionLineCount
        ? wrapText(action.description, textWidth, descriptionLineCount).map(text => ({
            text,
            bold: false
        }))
        : [];

    return [
        {
            text: action.datetime,
            bold: true
        },
        ...headingLines,
        ...descriptionLines
    ];
}

function wrapText(text: string, maxCols: number, maxRows: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    let current = "";
    const lines: string[] = [];

    for (const word of words) {
        if (current && `${current} ${word}`.length <= maxCols) {
            current = `${current} ${word}`;
        } else {
            if (current) {
                lines.push(current);
            }
            current = word;
        }

        while (current.length > maxCols) {
            lines.push(current.slice(0, maxCols));
            current = current.slice(maxCols);
        }
    }

    if (current) {
        lines.push(current);
    }

    if (!lines.length) {
        lines.push("");
    }

    if (lines.length <= maxRows) {
        return lines;
    }

    const visibleLines = lines.slice(0, maxRows);
    const lastIndex = visibleLines.length - 1;
    visibleLines[lastIndex] = `${visibleLines[lastIndex].slice(0, maxCols - 3)}...`;
    return visibleLines;
}

function formatTimestamp(time: DateTime): string {
    switch (timestampFormat.value) {
        case "date":
            return time.toLocaleString(DateTime.DATE_SHORT);
        case "time":
            return time.toLocaleString(DateTime.TIME_SIMPLE);
        case "datetime":
        default:
            return time.toLocaleString(DateTime.DATETIME_SHORT);
    }
}
</script>

<style scoped>
.timeline-visualization {
    background-color: white;
    color: #111;
    min-height: 100%;
}

.timeline-controls {
    align-items: center;
    background: #f7f7f7;
    border-bottom: 1px solid #d4d4d3;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    padding: 10px;
}

.timeline-controls label {
    align-items: center;
    color: #333;
    display: flex;
    font-size: 12px;
    gap: 6px;
    white-space: nowrap;
}

.timeline-controls select,
.timeline-controls input[type="range"] {
    max-width: 130px;
}

.timeline-controls input[type="color"] {
    background: transparent;
    border: 1px solid #bbb;
    height: 24px;
    padding: 1px;
    width: 34px;
}

.checkbox-control {
    gap: 4px;
}

.timeline-stage {
    background-color: white;
    overflow: auto;
}

.timeline-export-root {
    background-color: white;
    box-sizing: border-box;
    display: inline-block;
    min-height: 480px;
    min-width: 100%;
    padding: 12px;
}

.timeline-export-root svg {
    display: block;
    min-width: 760px;
}

.timeline-empty {
    align-items: center;
    color: #555;
    display: flex;
    font-size: 16px;
    justify-content: center;
    min-height: 320px;
}
</style>
