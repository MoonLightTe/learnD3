<template>
  <div class="simple-input-cell" :class="rootClasses">
    <input
      ref="cellInput"
      class="cell-input"
      :value="value"
      :placeholder="rangeHint"
      @input="onInput"
      @keydown.enter="handleEnter"
    />
    <span v-if="hasAlert" class="alert-dot" :class="alertDotClass"></span>
    <div v-if="hasAlert" class="alert-tooltip" :class="alertTooltipClass">{{ alertText }}</div>
  </div>
</template>

<script>
export default {
  name: 'SimpleInputCell',
  props: {
    formData: Object,
    timepoint: String,
    rowConfig: Object,
    templateConfig: Object
  },
  computed: {
    fieldData: function () {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      return tp && tp[this.rowConfig.key] ? tp[this.rowConfig.key] : {}
    },
    value: function () {
      return this.fieldData.value || ''
    },
    isSynced: function () {
      return this.fieldData.source === 'device'
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
      var label = this.rowConfig.label
      if (v < range[0]) return label + '偏低（< ' + range[0] + '）'
      if (v > range[1]) return label + '偏高（> ' + range[1] + '）'
      return ''
    },
    isPulseDeficit: function () {
      if (this.rowConfig.key !== 'pulse') return false
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      if (!tp) return false
      var pulse = parseFloat(tp.pulse && tp.pulse.value)
      var hr = parseFloat(tp.heartRate && tp.heartRate.value)
      if (isNaN(pulse) || isNaN(hr)) return false
      return pulse < hr
    },
    hasAlert: function () {
      return this.isPulseDeficit || this.isOutOfRange
    },
    alertText: function () {
      if (this.isPulseDeficit) return '脉搏短绌，请确认心率'
      return this.outOfRangeText
    },
    alertDotClass: function () {
      return { 'dot-orange': this.isPulseDeficit, 'dot-red': this.isOutOfRange && !this.isPulseDeficit }
    },
    alertTooltipClass: function () {
      return { 'tooltip-orange': this.isPulseDeficit, 'tooltip-red': this.isOutOfRange && !this.isPulseDeficit }
    },
    rangeHint: function () {
      var range = this.rowConfig.alertRange
      return range ? range[0] + '-' + range[1] : '—'
    },
    rootClasses: function () {
      return {
        'has-alert': this.hasAlert,
        'pulse-deficit': this.isPulseDeficit,
        'out-of-range': this.isOutOfRange && !this.isPulseDeficit,
        'synced': this.isSynced
      }
    }
  },
  methods: {
    onInput: function (e) {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      if (!tp) return
      var key = this.rowConfig.key
      if (!tp[key]) {
        this.$set(tp, key, { value: e.target.value, source: null })
      } else {
        this.$set(tp[key], 'value', e.target.value)
      }
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
.simple-input-cell {
  position: relative;
  text-align: center;
  padding: 4px 2px;
}
.cell-input {
  width: 100%;
  padding: 5px 4px;
  border: 1px solid transparent;
  text-align: center;
  font-size: 13px;
  border-radius: 4px;
  background: #f5f7fa;
  outline: none;
  transition: background 0.15s, border-color 0.15s;
}
.cell-input:focus {
  background: #fff;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}
.cell-input::placeholder {
  color: #bbb;
  font-size: 11px;
}
.cell-input.synced {
  background: #e3f2fd;
}
.simple-input-cell.out-of-range .cell-input {
  color: #d32f2f;
  background: #fef2f2;
}
.simple-input-cell.out-of-range .cell-input:focus {
  background: #fff;
}
.simple-input-cell.pulse-deficit .cell-input {
  border-color: #f57c00;
  background: #fff8f0;
}

/* alert indicator dot */
.alert-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  pointer-events: none;
}
.dot-red { background: #d32f2f; }
.dot-orange { background: #f57c00; }

/* alert tooltip */
.alert-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s, visibility 0.15s;
}
.simple-input-cell:hover > .alert-tooltip {
  opacity: 1;
  visibility: visible;
}
.tooltip-red {
  background: #fef2f2;
  color: #d32f2f;
  border: 1px solid #fecaca;
  box-shadow: 0 2px 6px rgba(211,47,47,0.1);
}
.tooltip-orange {
  background: #fff8f0;
  color: #e65100;
  border: 1px solid #ffe0b2;
  box-shadow: 0 2px 6px rgba(245,124,0,0.1);
}
</style>
