<template>
  <div class="respiration-cell" :class="{ 'out-of-range': isOutOfRange }">
    <div class="resp-group">
      <input
        ref="respInput"
        class="resp-input"
        :value="value"
        :placeholder="rangeHint"
        @input="onInput"
        @keydown.enter="handleEnter"
      />
      <span
        class="vent-toggle"
        :class="{ on: ventilator }"
        :title="ventilator ? '呼吸机开启，点击关闭' : '点击开启呼吸机'"
        @click.stop="toggleVentilator"
      >R</span>
    </div>
    <div v-if="isOutOfRange" class="resp-tooltip">{{ outOfRangeText }}</div>
  </div>
</template>

<script>
export default {
  name: 'RespirationCell',
  props: {
    formData: Object,
    timepoint: String,
    rowConfig: Object,
    templateConfig: Object
  },
  computed: {
    fieldData: function () {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      return tp && tp.respiration ? tp.respiration : {}
    },
    value: function () {
      return this.fieldData.value || ''
    },
    ventilator: function () {
      return this.fieldData.ventilator || false
    },
    isOutOfRange: function () {
      var range = this.rowConfig.alertRange
      if (!range) return false
      var v = parseFloat(this.value)
      if (isNaN(v)) return false
      return v < range[0] || v > range[1]
    },
    outOfRangeText: function () {
      var range = this.rowConfig.alertRange
      var v = parseFloat(this.value)
      if (isNaN(v) || !range) return ''
      if (v < range[0]) return '呼吸偏低（< ' + range[0] + '）'
      if (v > range[1]) return '呼吸偏高（> ' + range[1] + '）'
      return ''
    },
    rangeHint: function () {
      var range = this.rowConfig.alertRange
      return range ? range[0] + '-' + range[1] : '—'
    }
  },
  methods: {
    onInput: function (e) {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      if (!tp || !tp.respiration) return
      this.$set(tp.respiration, 'value', e.target.value)
      this.$emit('change')
    },
    toggleVentilator: function () {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      if (!tp || !tp.respiration) return
      this.$set(tp.respiration, 'ventilator', !this.ventilator)
      this.$emit('change')
    },
    handleEnter: function () {
      var table = this.$el && this.$el.closest('table')
      if (!table) return
      var inputs = Array.from(table.querySelectorAll('input:not([disabled])'))
      var idx = inputs.indexOf(document.activeElement)
      if (idx >= 0 && idx < inputs.length - 1) {
        inputs[idx + 1].focus()
      }
    }
  }
}
</script>

<style scoped>
.respiration-cell {
  position: relative;
  text-align: center;
  padding: 4px 2px;
}
.resp-group {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0 3px;
  height: 28px;
  transition: background 0.15s, border-color 0.15s;
}
.resp-group:focus-within {
  background: #fff;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}
.out-of-range .resp-group {
  background: #fef2f2;
  border-color: #fecaca;
}
.out-of-range .resp-group:focus-within {
  background: #fff;
}
.resp-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 13px;
  outline: none;
  padding: 0 2px;
}
.resp-input::placeholder {
  color: #bbb;
  font-size: 11px;
}
.out-of-range .resp-input {
  color: #d32f2f;
}
.vent-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  color: #ccc;
  flex-shrink: 0;
  user-select: none;
  transition: all 0.12s;
}
.vent-toggle:hover {
  border-color: #f57c00;
  color: #f57c00;
}
.vent-toggle.on {
  background: #f57c00;
  color: #fff;
  border-color: #f57c00;
}

/* tooltip */
.resp-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #fef2f2;
  color: #d32f2f;
  border: 1px solid #fecaca;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(211,47,47,0.1);
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s, visibility 0.15s;
}
.respiration-cell:hover > .resp-tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
