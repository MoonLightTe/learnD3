<template>
  <div class="inline-temperature" :class="{ 'has-value': value }">
    <el-select
      :value="collectionMode"
      size="mini"
      class="type-select"
      placeholder="类型"
      @change="handleTypeChange"
    >
      <el-option-group label="常规">
        <el-option v-for="t in normalTypes" :key="t.collectionMode" :label="t.label" :value="t.collectionMode" />
      </el-option-group>
      <el-option-group label="降温措施">
        <el-option v-for="t in coolingMeasureTypes" :key="t.collectionMode" :label="t.label" :value="t.collectionMode" />
      </el-option-group>
      <el-option-group label="特殊">
        <el-option v-for="t in specialTypes" :key="t.value" :label="t.label" :value="t.value" />
      </el-option-group>
    </el-select>

    <div v-if="showValueInput" class="value-area">
      <input
        class="temp-input"
        :class="{ 'out-of-range': isOutOfRange }"
        :style="isOutOfRange ? { color: '#d32f2f' } : {}"
        :value="value"
        placeholder="—"
        @input="handleValueInput"
      />
      <span class="unit">℃</span>
    </div>
    <div v-else-if="isSpecialType" class="special-label">{{ collectionMode }}</div>

    <span
      v-if="showCoolingIcon"
      class="cooling-icon"
      title="点击查看/编辑降温记录"
      @click="openCoolingDialog"
    >
      <svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1a1 1 0 0 1 1 1v5.13A3.5 3.5 0 1 1 7 7.13V2a1 1 0 0 1 1-1zm0 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="#2e7d32"/></svg>
    </span>

    <cooling-records-dialog
      :visible.sync="coolingDialogVisible"
      :records="coolingRecords"
      @confirm="handleCoolingConfirm"
    />
  </div>
</template>

<script>
import CoolingRecordsDialog from './CoolingRecordsDialog.vue'
import { TEMPERATURE_TYPES, TEMPERATURE_SPECIAL_TYPES, TEMPERATURE_COOLING_TYPES } from '../constants.js'

export default {
  name: 'InlineTemperature',
  components: { CoolingRecordsDialog: CoolingRecordsDialog },
  props: {
    formData: Object,
    timepoint: String,
    rowConfig: Object,
    templateConfig: Object
  },
  data: function () {
    return {
      normalTypes: TEMPERATURE_TYPES,
      coolingMeasureTypes: TEMPERATURE_COOLING_TYPES,
      specialTypes: TEMPERATURE_SPECIAL_TYPES,
      coolingDialogVisible: false
    }
  },
  computed: {
    tpData: function () {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      return tp && tp.temperature ? tp.temperature : {}
    },
    collectionMode: function () {
      return this.tpData.collectionMode != null ? this.tpData.collectionMode : 2
    },
    value: function () {
      return this.tpData.value || ''
    },
    coolingRecords: function () {
      return this.tpData.coolingRecords || []
    },
    showValueInput: function () {
      return typeof this.collectionMode === 'number'
    },
    isSpecialType: function () {
      return typeof this.collectionMode === 'string'
    },
    isOutOfRange: function () {
      var v = parseFloat(this.value)
      if (isNaN(v)) return false
      var range = this.rowConfig.alertRange || [34, 42]
      return v < range[0] || v > range[1]
    },
    showCoolingIcon: function () {
      var v = parseFloat(this.value)
      var aboveThreshold = !isNaN(v) && v > 42
      var hasRecords = this.coolingRecords.length > 0
      return aboveThreshold || hasRecords
    }
  },
  methods: {
    ensureTpData: function () {
      var tp = this.formData.timepoints[this.timepoint]
      if (!tp.temperature) {
        this.$set(tp, 'temperature', { collectionMode: 2, value: '', coolingRecords: [] })
      }
      return tp.temperature
    },
    handleTypeChange: function (val) {
      var temp = this.ensureTpData()
      if (typeof val === 'string') {
        // 特殊类型：不升/拒测
        if (this.value && !isNaN(Number(this.value))) {
          this.$confirm('当前已有体温数值 ' + this.value + '℃，切换为' + val + '将清空数值，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(function () {
            temp.collectionMode = val
            temp.value = val
          }.bind(this)).catch(function () {})
        } else {
          temp.collectionMode = val
          temp.value = val
        }
      } else {
        temp.collectionMode = val
        if (typeof temp.value === 'string' && isNaN(Number(temp.value))) {
          temp.value = ''
        }
      }
      this.$emit('change')
    },
    handleValueInput: function (e) {
      var temp = this.ensureTpData()
      var cleaned = e.target.value.replace(/[^\d.]/g, '')
      var parts = cleaned.split('.')
      if (parts.length > 1) parts[1] = parts[1].substring(0, 1)
      temp.value = parts.join('.')
      this.$emit('change')
    },
    openCoolingDialog: function () {
      this.coolingDialogVisible = true
    },
    handleCoolingConfirm: function (records) {
      var temp = this.ensureTpData()
      this.$set(temp, 'coolingRecords', records)
      this.$emit('change')
    },
    // 方向键导航支持
    getFocusableInputs: function () {
      var el = this.$el
      if (!el) return []
      var inputs = el.querySelectorAll('input, select')
      return Array.from(inputs)
    }
  }
}
</script>

<style lang="less" scoped>
.inline-temperature {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
  min-height: 32px;
}
.type-select {
  width: 72px;
  /deep/ .el-input__inner {
    padding: 0 20px 0 6px;
    font-size: 11px;
    height: 26px;
    line-height: 26px;
    border: 1px solid transparent;
    background: transparent;
  }
  /deep/ .el-input__suffix { right: 2px; }
}
.value-area {
  display: flex;
  align-items: center;
  gap: 1px;
}
.temp-input {
  width: 42px;
  padding: 3px 4px;
  border: 1px solid transparent;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  border-radius: 3px;
  background: transparent;
  outline: none;
  &:focus { background: #fff; border-color: #1a73e8; }
  &::placeholder { color: #ddd; font-weight: 400; }
}
.temp-input.out-of-range { color: #d32f2f; }
.unit {
  font-size: 10px;
  color: #999;
}
.special-label {
  font-size: 12px;
  color: #e65100;
  font-weight: 500;
  white-space: nowrap;
}
.cooling-icon {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  &:hover svg path { fill: #1b5e20; }
}
</style>
