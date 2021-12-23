<template>
  <div class="datetime-field-input">
    <p class="warning-icon" v-if="required && text.length === 0">⚠</p>
    <input :class="`align-${align}`" type="text" v-model="text" @keydown="onKeyDown" disabled="true"/>
    <button class="picker-button" @click="showDatePicker=true"><Calendar /></button>
    <div :class="['datetime-picker',`align-${align}`]" :style="pickerStyle" v-show="showDatePicker">
      <div class="calendar">
        <div class="calendar-header">
          <span class="jump year-prev" @click="jumpYear(-1)">«</span>
          <span class="jump month-prev" @click="jumpMonth(-1)">‹</span>
          <span class="month">
            {{ monthsOfYear[date.getUTCMonth()] }} {{ date.getUTCFullYear() }}
          </span>
          <span class="jump month-next" @click="jumpMonth(1)">›</span>
          <span class="jump year-next" @click="jumpYear(1)">»</span>
        </div>
        <div class="calendar-month">
          <div class="weekdays">
            <span v-for="name in daysOfWeek" :key="name" >
              {{ name }}
            </span>
          </div>
          <div class="week" v-for="week in calendar" :key="week">
            <span 
              :class="[d ? 'day' : null, { select: d === day }]"
              v-for="d in week" :key="d"
              @click="setDay(d)"
            >
              {{ d }}
            </span>
          </div>
        </div>
        <div class="calendar-footer">
          <div class="clear">
            <span @click="setClear()">Clear</span>
          </div>
          <div class="today">
            <span @click="setToday()">Today</span>
          </div>
        </div>
      </div>
      <div class="time">
        <div class="time-column-container">
          <div class="hour time-column" :style="{ right: `-${sbw}px` }"  @wheel.passive.stop ref="hour">
            <li :class="{ select: i === hour }" v-for="i in 12" :key="i" @click="setHours(i)">
              {{ `${ i }`.padStart(2, "0") }}
            </li>
          </div>
        </div>
        <div class="time-column-container">
          <div class="minute time-column" :style="{ right: `-${sbw}px` }" @wheel.passive.stop ref="mins">
            <li :class="{ select: i - 1 === mins }" v-for="i in 60" :key="i" @click="setMinute(i - 1)">
              {{ `${ i - 1 }`.padStart(2, "0") }}
            </li>
          </div>
        </div>
        <div class="time-column-container">
          <div class="second time-column" :style="{ right: `-${sbw}px` }" @wheel.passive.stop ref="secs">
            <li :class="{ select: i - 1 === secs }" v-for="i in 60" :key="i" @click="setSecond(i - 1)">
              {{ `${ i - 1 }`.padStart(2, "0")  }}
            </li>
          </div>
        </div>
        <div class="time-column-container">
          <div class="meridiem time-column" :style="{ right: `-${sbw}px` }" @wheel.passive.stop>
            <li :class="{ select: 'AM' === meri }" @click="setMeridiem('AM')">AM</li>
            <li :class="{ select: 'PM' === meri }" @click="setMeridiem('PM')">PM</li>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Calendar from "@/components/Vectors/Calendar.vue"

export default defineComponent({
  name: "DateTimeField",
  props: {
    value: { type: String, default: "" },
    align: { type: String, default: "left" },
    required: { type: Boolean, default: false },
    dropMargin: { type: Number, default: 4 }
  },
  data() {
    return {
      sbw: -1,
      daysOfWeek: [
        "Su", "Mo", "Tu", 
        "We", "Th", "Fr", 
        "Sa"
      ],
      monthsOfYear: [
        "January", "February", "March", 
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ],
      showDatePicker: false,
      clickOutsideHandler: (event: MouseEvent) => {},
    };
  },
  computed: {

    /**
     * Returns the date picker's style.
     */
    pickerStyle() {
      return { marginTop: `${this.dropMargin}px` }
    },

    /**
     * Returns the field's date text.
     */
    text: {
      get() { return this.value.split(".")[0]; },
      set() {},
    },

    /**
     * Returns the field's current date.
     */
    date() {
      let d = this.value === "" ? new Date() : new Date(this.value);
      d.setUTCMilliseconds(0);
      return d;
    },

    /**
     * Returns the field's current day.
     */
    day() {
      return this.date.getUTCDate();
    },

    /**
     * Returns the field's current hour.
     */
    hour() {
      let hours = this.date.getUTCHours() % 12;
      return hours ? hours : 12;
    },

    /**
     * Returns the field's current minute.
     */
    mins(){
      return this.date.getUTCMinutes();
    },

    /**
     * Returns the field's current second.
     */
    secs() {
      return this.date.getUTCSeconds();
    },

    /**
     * Returns the field's current meridiem.
     */
    meri() {
      return this.date.getUTCHours() >= 12 ? "PM" : "AM";
    },

    /**
     * Returns the field's current calendar layout.
     */
    calendar() {
      let year = this.date.getUTCFullYear();
      let month = this.date.getUTCMonth();
      let daysInMonth = new Date(year, month + 1, 0).getUTCDate();
      let firstDayOffset = new Date(year, month, 1).getUTCDay();
      let weeksSize = Math.ceil((firstDayOffset + daysInMonth) / 7);
      let calendar = new Array(weeksSize).fill(null).map(() => new Array(7).fill(null));
      for(let i = 0; i < daysInMonth; i++) {
        let x = (firstDayOffset + i) % 7 
        let y = Math.floor((firstDayOffset + i) / 7);
        calendar[y][x] = i + 1;
      }
      return calendar;
    }

  },
  methods: {

    /**
     * Moves the year forward/backward by the given number of years.
     * @param amount
     *  The number of years to jump forward (or backward).
     */
    jumpYear(amount: number) {
      let d = new Date(this.date);
      // Get max month date for target year
      let m = new Date(d.getUTCFullYear() + amount, d.getUTCMonth() + 1, 0).getDate();
      // Limit current date to max date and shift year.
      d.setUTCDate(Math.min(d.getUTCDate(), m));
      d.setUTCFullYear(d.getUTCFullYear() + amount);  
      this.$emit("change", d.toISOString());
    },

    /**
     * Moves the month forward/backward by the given number of months.
     * @param amount
     *  The number of months to jump forward (or backward).
     */
    jumpMonth(amount: number) {
      let d = new Date(this.date);
      // Get max month date for target month
      let m = new Date(d.getUTCFullYear(), d.getUTCMonth() + 1 + amount, 0).getDate();
      // Limit current date to max date and shift month.
      d.setUTCDate(Math.min(d.getUTCDate(), m));
      d.setUTCMonth(d.getUTCMonth() + amount);
      this.$emit("change", d.toISOString());
    },
    
    /**
     * Sets the field's day segment.
     * @param day
     *  The field's day segment.
     */
    setDay(day: number | null) {
      if(day !== null) {
        let d = new Date(this.date);
        d.setUTCDate(day);
        this.$emit("change", d.toISOString());
      }
    },

    /**
     * Sets the field's minute segment.
     * @param minutes
     *  The field's minute segment.
     */
    setMinute(minutes: number) {
      let d = new Date(this.date);
      d.setUTCMinutes(minutes);
      this.$emit("change", d.toISOString());
    },

    /**
     * Sets the field's second segment.
     * @param seconds
     *  The field's second segment.
     */
    setSecond(seconds: number) {
      let d = new Date(this.date);
      d.setUTCSeconds(seconds);
      this.$emit("change", d.toISOString());
    },

    /**
     * Sets the field's hour segment.
     * @param hours
     *  The field's hour segment.
     */
    setHours(hours: number) {
      let d = new Date(this.date);
      if(this.meri === "PM") {
        d.setUTCHours(12 + (hours % 12));
      } else {
        d.setUTCHours(hours % 12);
      }
      this.$emit("change", d.toISOString());
    },

    /**
     * Sets the field's meridiem segment.
     * @param hours
     *  The field's meridiem segment.
     */
    setMeridiem(meridiem: string) {
      let d = new Date(this.date);
      if(meridiem === "AM" && 11 < d.getUTCHours()) {
        d.setUTCHours(d.getUTCHours() - 12);
      } else if(meridiem === "PM" && d.getUTCHours() <= 11) {
        d.setUTCHours(d.getUTCHours() + 12);
      }
      this.$emit("change", d.toISOString());
    },

    /**
     * Sets the field's time to now.
     */
    setToday() {
      let d = new Date();
      d.setUTCMilliseconds(0);
      this.$emit("change", d.toISOString());
      // Refocus Time on next tick
      this.$nextTick(() => {
        this.refocusTime();
      })
    },

    /**
     * Clears the field's time completely.
     */
    setClear() {
      this.$emit("change", "");
      // Refocus Time on next tick
      this.$nextTick(() => {
        this.refocusTime();
      })
    },

    /**
     * Scrolls the hour, minute, and second selection into view.
     */
    refocusTime() {
      let hour = this.$refs["hour"] as HTMLElement;
      let mins = this.$refs["mins"] as HTMLElement;
      let secs = this.$refs["secs"] as HTMLElement;
      // Scroll to time
      hour.scrollTop = (hour.getElementsByClassName("select")[0] as HTMLElement).offsetTop;
      mins.scrollTop = (mins.getElementsByClassName("select")[0] as HTMLElement).offsetTop;
      secs.scrollTop = (secs.getElementsByClassName("select")[0] as HTMLElement).offsetTop;
    }

  },
  emits: ["change"],
  mounted() {
    // Setup out-of-focus click handler
    this.clickOutsideHandler = function (this: any, event: MouseEvent) {
      let tar = event.target as Node;
      if (this.$el != tar && !this.$el.contains(tar) && document.body.contains(tar)) {
        this.showDatePicker = false;
      }
    }.bind(this);
    document.body.addEventListener("click", this.clickOutsideHandler);
  },
  updated() {
    if(this.sbw === -1) {
      // Get scroll bar width
      let hour = this.$refs["hour"] as HTMLElement;
      this.sbw = hour.offsetWidth - hour.clientWidth;
      // Refocus Time
      this.refocusTime();
    }
  },
  destroyed() {
    // Destroy out-of-focus click handler
    document.body.removeEventListener("click", this.clickOutsideHandler);
  },
  components: { Calendar }
});
</script>

<style scoped>

/** === Main Control === */

.datetime-field-input {
  display: flex;
  align-items: center;
  position: relative;
}

input {
  box-sizing: border-box;
  font-family: "Inconsolata";
  color: #bfbfbf;
  height: 100%;
  width: 100%;
  padding: 6px 10px;
  border: none;
  background: none;
}
input:focus {
  outline: none;
}

.align-left {
  text-align: left;
}
.align-right {
  text-align: right;
}

.warning-icon {
  position: absolute;
  display: inline-block;
  font-size: 12pt;
  color: #d0ad43;
  margin: 0px 12px;
  user-select: none;
}

.picker-button {
  display: flex;
  align-items: center;
  width: 16px;
  height: 30px;
  padding: 0px 8px 0px 0px;
  box-sizing: content-box;
  border: none;
  background: none;
}
.picker-button svg {
  width: 15px;
  height: 18px;
  fill: #6b6b6b;
}
.picker-button:hover svg {
  fill: #9e9e9e;
}

/** === Date Time Picker === */

.datetime-picker {
  display: flex;  
  position: absolute;
  top: 100%;
  height: 247px;
  width: max-content;
  color: #b3b3b3;
  font-size: 10pt;
  padding: 15px;
  border-radius: 3px;
  box-sizing: border-box;
  background: #0f0f0f;
  box-shadow: 2px 2px 0px 0px rgb(0 0 0 / 30%);
  user-select: none;
  z-index: 10;
}
.align-left.datetime-picker {
  left: 2px;
}
.align-right.datetime-picker {
  right: 2px;
}

/** === Calendar Picker === */

.calendar {
  display: flex;
  flex-direction: column;
}

.month {
  flex: 1;
  text-align: center;
  font-weight: 700;
}

.calendar-header {
  display: flex;
  align-items: center;
  height: 18px;
  padding-bottom: 10px;
}

.jump {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12pt;
  line-height: 0pt;
  width: 15px;
  height: 100%;
  cursor: pointer;
}
.jump:hover {
  color: #e6e6e6;
}

.month-prev {
  margin-left: 2px;
}
.month-next {
  margin-right: 2px;
}

.calendar-month {
  display: table;
  flex: 1;
  border-collapse: separate;
  border-spacing: 3px;
}

.week,
.weekdays {
  display: table-row;
}

.weekdays {
  color: #999999;
}

.calendar-month span {
  display: table-cell;
  vertical-align: middle;
  width: 24px;
  text-align: center;
  border-radius: 4px;
}

.day.select {
  color: #fff;
  background: #637bc9;
}

.day:not(.select):hover {
  background: #333;
}

.calendar-footer {
  display: flex;
  align-items: center;
  height: 20px;
  padding-top: 4px;
}

.today,
.clear {
  flex: 1;
}
.clear {
  text-align: left;
}
.today {
  text-align: right;
}

.calendar-footer span {
  display: inline-block;
  color: #7e90ce;
  padding: 2px 5px;
  border-radius: 2px;
}
.calendar-footer span:hover {
  background: #2e2e2e;
}

/** === Time Picker === */

.time {
  display: flex;
  padding-left: 15px;
  border-left: solid 1px #292929;
  margin-left: 15px;
  overflow: hidden;
}

.time-column-container {
  position: relative;
  width: 40px;
  margin-right: 4px;
  overflow: hidden;
}
.time-column-container:last-child {
  margin-right: 0px;
}

.time-column {
  position: absolute;
  left: 0;
  height: 100%;
  overflow-x: hidden;
}

.time-column li {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11pt;
  width: 40px;
  height: 28px;
  border-radius: 4px;
  margin-bottom: 3px;
  list-style: none;
}
.time-column li:last-child {
  margin-bottom: 0px;
}

li.select {
  color: #fff;
  background: #637bc9;
}

.time-column li:not(.select):hover {
  background: #333;
}

</style>


