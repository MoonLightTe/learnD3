<template>
  <div class="respiration-cell">
    <input
      class="cell-input"
      :class="{ 'out-of-range': isOutOfRange }"
      :title="isOutOfRange ? outOfRangeText : ''"
      :style="isOutOfRange ? { color: '#d32f2f' } : {}"
      style="width:55%"
      :value="value"
      placeholder="—"
      @input="onInput"
    />
    <span
      v-if="ventilator"
      class="vent-toggle on"
      title="呼吸机已开启，点击关闭"
      @click="toggleVentilator"
    >R</span>
    <span
      v-else
      class="vent-toggle off"
      title="点击开启呼吸机"
      @click="toggleVentilator"
    >R</span>
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
    fieldData() {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      return tp && tp.respiration ? tp.respiration : {}
    },
    value() {
      return this.fieldData.value || ''
    },
    ventilator() {
      return this.fieldData.ventilator || false
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
      if (v < range[0]) return '呼吸偏低（< ' + range[0] + ' 次/分）'
      if (v > range[1]) return '呼吸偏高（> ' + range[1] + ' 次/分）'
      return ''
    }
  },
  methods: {
    onInput(e) {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      if (!tp || !tp.respiration) return
      this.$set(tp.respiration, 'value', e.target.value)
      this.$emit('change')
    },
    toggleVentilator() {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      if (!tp || !tp.respiration) return
      this.$set(tp.respiration, 'ventilator', !this.ventilator)
      this.$emit('change')
    },
    getFocusableInputs() {
      var el = this.$el
      if (!el) return []
      return Array.from(el.querySelectorAll('input:not([disabled])'))
    }
  }
}
</script>

<style scoped>
.respiration-cell {
  display: flex; align-items: center; justify-content: center;
  gap: 3px; text-align: center; padding: 6px 4px;
}
.cell-input {
  padding: 5px 4px; border: 1px solid transparent;
  text-align: center; font-size: 13px; border-radius: 4px;
  background: transparent; outline: none;
}
.cell-input:focus { background: #fff; border-color: #1a73e8; box-shadow: 0 0 0 2px rgba(26,115,232,0.1); }
.cell-input::placeholder { color: #ddd; }
.cell-input.out-of-range { color: #d32f2f; }
.vent-toggle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border: 1px solid #d9d9d9; border-radius: 3px;
  cursor: pointer; font-size: 10px; font-weight: bold; color: #999;
  flex-shrink: 0; user-select: none;
}
.vent-toggle:hover { border-color: #f57c00; }
.vent-toggle.on { background: #f57c00; color: #fff; border-color: #f57c00; }
.vent-toggle.off { color: #bbb; border-color: #e0e0e0; }
</style>
