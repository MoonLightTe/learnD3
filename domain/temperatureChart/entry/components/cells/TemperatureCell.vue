<template>
  <div class="temp-cell" @click="openDialog">
    <template v-if="value">
      <div class="temp-val" :class="{ warn: isWarn }">{{ value }}</div>
      <div>
        <span class="temp-type-tag">{{ typeLabel }}</span>
        <span v-if="coolingCount > 0" class="temp-cooling-dot" title="有降温记录"></span>
      </div>
    </template>
    <span v-else class="empty-cell">—</span>
  </div>
</template>

<script>
export default {
  name: 'TemperatureCell',
  props: {
    formData: Object,
    timepoint: String,
    rowConfig: Object,
    templateConfig: Object
  },
  computed: {
    tpData() {
      const tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      return tp && tp.temperature ? tp.temperature : {}
    },
    value() {
      return this.tpData.value || ''
    },
    typeLabel() {
      var map = { 1: '口温', 2: '腋温', 3: '肛温', 4: '耳温' }
      return map[this.tpData.collectionMode] || ''
    },
    coolingCount() {
      return this.tpData.coolingRecords ? this.tpData.coolingRecords.length : 0
    },
    isWarn() {
      var v = parseFloat(this.value)
      if (isNaN(v)) return false
      var range = this.rowConfig.alertRange || [34, 42]
      return v < range[0] || v > range[1]
    }
  },
  methods: {
    openDialog() {
      this.$emit('open-dialog', {
        timepoint: this.timepoint,
        data: Object.assign({}, this.tpData)
      })
    }
  }
}
</script>

<style scoped>
.temp-cell { cursor: pointer; text-align: center; padding: 6px 4px; }
.temp-cell:hover { background: #f0f7ff; }
.temp-val { font-size: 14px; font-weight: 600; }
.temp-val.warn { color: #d32f2f; }
.temp-type-tag { font-size: 9px; color: #1976d2; background: #e8f0fe; padding: 1px 4px; border-radius: 2px; display: inline-block; margin-top: 2px; }
.temp-cooling-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #2e7d32; margin-left: 4px; vertical-align: middle; }
.empty-cell { color: #c0c4cc; }
</style>
