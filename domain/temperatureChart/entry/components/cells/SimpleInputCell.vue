<template>
  <div class="simple-input-cell" :class="{ 'has-alert': isPulseDeficit }">
    <input
      class="cell-input"
      :class="{ synced: isSynced, 'pulse-deficit': isPulseDeficit, 'out-of-range': isOutOfRange }"
      :style="isOutOfRange ? { color: '#d32f2f' } : {}"
      :value="value"
      placeholder="—"
      @input="onInput"
    />
    <div v-if="isPulseDeficit" class="alert-tooltip">
      脉搏 &lt; 心率，脉搏短绌，请确认心率
    </div>
    <div v-else-if="isOutOfRange" class="alert-tooltip warn-tooltip">
      {{ outOfRangeText }}
    </div>
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
    fieldData() {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      return tp && tp[this.rowConfig.key] ? tp[this.rowConfig.key] : {}
    },
    value() {
      return this.fieldData.value || ''
    },
    isSynced() {
      return this.fieldData.source === 'device'
    },
    isOutOfRange() {
      var range = this.rowConfig.alertRange
      if (!range) return false
      var v = parseFloat(this.value)
      if (isNaN(v)) return false
      return v < range[0] || v > range[1]
    },
    outOfRangeText() {
      var range = this.rowConfig.alertRange
      var v = parseFloat(this.value)
      if (isNaN(v) || !range) return ''
      var label = this.rowConfig.label
      if (v < range[0]) return label + '偏低（< ' + range[0] + ' ' + (this.rowConfig.unit || '') + '）'
      if (v > range[1]) return label + '偏高（> ' + range[1] + ' ' + (this.rowConfig.unit || '') + '）'
      return ''
    },
    isPulseDeficit() {
      if (this.rowConfig.key !== 'pulse') return false
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      if (!tp) return false
      var pulse = parseFloat(tp.pulse && tp.pulse.value)
      var hr = parseFloat(tp.heartRate && tp.heartRate.value)
      if (isNaN(pulse) || isNaN(hr)) return false
      return pulse < hr
    }
  },
  methods: {
    onInput(e) {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      if (!tp) return
      var key = this.rowConfig.key
      if (!tp[key]) {
        this.$set(tp, key, { value: e.target.value, source: null })
      } else {
        this.$set(tp[key], 'value', e.target.value)
      }
      this.$emit('change')
    }
  }
}
</script>

<style scoped>
.simple-input-cell { position: relative; text-align: center; padding: 6px 4px; }
.has-alert { position: relative; }
.cell-input {
  width: 100%; padding: 5px 4px; border: 1px solid transparent;
  text-align: center; font-size: 13px; border-radius: 4px;
  background: transparent; outline: none;
}
.cell-input:focus { background: #fff; border-color: #1a73e8; box-shadow: 0 0 0 2px rgba(26,115,232,0.1); }
.cell-input::placeholder { color: #ddd; }
.cell-input.synced { background: #e3f2fd; }
.cell-input.pulse-deficit { border: 2px solid #f57c00; border-radius: 4px; }
.cell-input.out-of-range { color: #d32f2f; }
.alert-tooltip {
  position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
  background: #fff3e0; color: #e65100; font-size: 11px; padding: 4px 8px;
  border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 10; display: none; pointer-events: none;
}
.has-alert:hover .alert-tooltip { display: block; }
.warn-tooltip { display: none; }
.simple-input-cell:hover > .warn-tooltip { display: block; }
</style>
