<template>
  <div class="inline-temperature" :class="rootClasses">
    <div class="temp-input-group">
      <span class="type-trigger" @click.stop="toggleTypeMenu" :title="currentTypeLabel">
        <span class="type-icon" v-html="currentTypeSvg"></span>
        <svg class="chevron-down" viewBox="0 0 10 10" width="10" height="10">
          <path d="M2.5 3.5l2.5 2.5 2.5-2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="group-sep"></span>
      <template v-if="showValueInput">
        <input
          ref="valueInput"
          class="temp-value"
          inputmode="decimal"
          :value="value"
          :placeholder="rangeHint"
          @input="handleValueInput"
          @keydown.enter="handleEnter"
        />
        <span class="unit">℃</span>
      </template>
      <span v-else-if="isSpecialType" class="special-label">{{ collectionMode }}</span>
      <span
        v-if="showCoolingIcon"
        class="cooling-suffix"
        title="点击查看/编辑降温记录"
        @click.stop="openCoolingDialog"
      >
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path d="M8 1a1 1 0 0 1 1 1v5.13A3.5 3.5 0 1 1 7 7.13V2a1 1 0 0 1 1-1zm0 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="#2e7d32"/>
        </svg>
      </span>
    </div>

    <transition name="dropdown">
      <div v-if="typeMenuVisible" class="type-dropdown" @click.stop>
        <div class="dd-section">常规</div>
        <div
          v-for="t in normalTypes"
          :key="t.collectionMode"
          class="dd-item"
          :class="{ active: collectionMode === t.collectionMode }"
          @mousedown.prevent="selectType(t.collectionMode)"
        >
          <span class="dd-icon" v-html="getTypeSvg(t.collectionMode)"></span>
          <span class="dd-text">{{ t.label }}</span>
          <svg v-if="collectionMode === t.collectionMode" class="dd-check" viewBox="0 0 16 16" width="12" height="12">
            <path d="M3 8l3 3 7-7" fill="none" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="dd-divider"></div>
        <div class="dd-section">特殊</div>
        <div
          v-for="t in specialTypes"
          :key="t.value"
          class="dd-item"
          :class="{ active: collectionMode === t.value }"
          @mousedown.prevent="selectType(t.value)"
        >
          <span class="dd-icon" v-html="getTypeSvg(t.value)"></span>
          <span class="dd-text">{{ t.label }}</span>
          <svg v-if="collectionMode === t.value" class="dd-check" viewBox="0 0 16 16" width="12" height="12">
            <path d="M3 8l3 3 7-7" fill="none" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </transition>

    <cooling-records-dialog
      :visible.sync="coolingDialogVisible"
      :records="coolingRecords"
      @confirm="handleCoolingConfirm"
    />
  </div>
</template>

<script>
import CoolingRecordsDialog from './CoolingRecordsDialog.vue'
import { TEMPERATURE_TYPES, TEMPERATURE_SPECIAL_TYPES } from '../constants.js'

var TYPE_SVGS = {}
TYPE_SVGS[1] = '<circle cx="8" cy="8" r="4" fill="#1a73e8"/>'
TYPE_SVGS[2] = '<line x1="4" y1="4" x2="12" y2="12" stroke="#1a73e8" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="4" x2="4" y2="12" stroke="#1a73e8" stroke-width="2" stroke-linecap="round"/>'
TYPE_SVGS[3] = '<circle cx="8" cy="8" r="4.5" fill="#fff" stroke="#1a73e8" stroke-width="1.5"/><circle cx="8" cy="8" r="1.5" fill="#1a73e8"/>'
TYPE_SVGS[4] = '<path d="M8 3 L14 13 L2 13 Z" fill="#1a73e8"/>'
TYPE_SVGS['不升'] = '<path d="M8 2v10M4 8l4 5 4-5" fill="none" stroke="#78909c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
TYPE_SVGS['拒测'] = '<circle cx="8" cy="8" r="5" fill="none" stroke="#e65100" stroke-width="1.5"/><line x1="5" y1="11" x2="11" y2="5" stroke="#e65100" stroke-width="1.5" stroke-linecap="round"/>'

var TYPE_LABELS = {}
TEMPERATURE_TYPES.forEach(function (t) { TYPE_LABELS[t.collectionMode] = t.label })
TEMPERATURE_SPECIAL_TYPES.forEach(function (t) { TYPE_LABELS[t.value] = t.label })

function svgWrap(inner) {
  return '<svg viewBox="0 0 16 16" width="16" height="16">' + inner + '</svg>'
}

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
      specialTypes: TEMPERATURE_SPECIAL_TYPES,
      coolingDialogVisible: false,
      typeMenuVisible: false
    }
  },
  computed: {
    tpData: function () {
      var tp = this.formData && this.formData.timepoints && this.formData.timepoints[this.timepoint]
      return tp && tp.temperature ? tp.temperature : {}
    },
    collectionMode: function () {
      return this.tpData.collectionMode != null ? this.tpData.collectionMode : this.getPrevType()
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
      var range = this.rowConfig.alertRange || [34, 38]
      return v < range[0] || v > range[1]
    },
    showCoolingIcon: function () {
      var v = parseFloat(this.value)
      var upperLimit = this.rowConfig.alertRange ? this.rowConfig.alertRange[1] : 38
      var aboveThreshold = !isNaN(v) && v > upperLimit
      var hasRecords = this.coolingRecords.length > 0
      return aboveThreshold || hasRecords
    },
    rangeHint: function () {
      var range = this.rowConfig.alertRange || [34, 38]
      return range[0] + '-' + range[1]
    },
    currentTypeLabel: function () {
      return TYPE_LABELS[this.collectionMode] || '腋温'
    },
    currentTypeSvg: function () {
      return svgWrap(TYPE_SVGS[this.collectionMode] || TYPE_SVGS[2])
    },
    rootClasses: function () {
      return {
        'has-value': !!this.value,
        'menu-open': this.typeMenuVisible,
        'out-of-range': this.showValueInput && this.isOutOfRange
      }
    }
  },
  mounted: function () {
    var self = this
    this._docClickHandler = function (e) {
      if (!self.$el.contains(e.target)) {
        self.typeMenuVisible = false
      }
    }
    document.addEventListener('click', this._docClickHandler, true)
  },
  beforeDestroy: function () {
    document.removeEventListener('click', this._docClickHandler, true)
  },
  methods: {
    getTypeSvg: function (mode) {
      return svgWrap(TYPE_SVGS[mode] || TYPE_SVGS[2])
    },
    toggleTypeMenu: function () {
      this.typeMenuVisible = !this.typeMenuVisible
    },
    ensureTpData: function () {
      var tp = this.formData.timepoints[this.timepoint]
      if (!tp.temperature) {
        var prevMode = this.getPrevType()
        this.$set(tp, 'temperature', { collectionMode: prevMode, value: '', coolingRecords: [] })
      } else if (tp.temperature.collectionMode == null) {
        tp.temperature.collectionMode = this.getPrevType()
      }
      return tp.temperature
    },
    getPrevType: function () {
      var tps = this.templateConfig && this.templateConfig.timepoints
      if (!tps) return 2
      var idx = tps.indexOf(this.timepoint)
      for (var i = idx - 1; i >= 0; i--) {
        var prev = this.formData.timepoints[tps[i]]
        if (prev && prev.temperature && prev.temperature.collectionMode != null) {
          return prev.temperature.collectionMode
        }
      }
      return 2
    },
    selectType: function (val) {
      var temp = this.ensureTpData()
      if (typeof val === 'string') {
        if (this.value && !isNaN(Number(this.value))) {
          this.$message.warning('已清除体温数值 ' + this.value + '℃，切换为' + TYPE_LABELS[val])
        }
        temp.collectionMode = val
        temp.value = val
      } else {
        temp.collectionMode = val
        if (typeof temp.value === 'string' && isNaN(Number(temp.value))) {
          temp.value = ''
        }
      }
      this.typeMenuVisible = false
      this.$emit('change')
      if (typeof val === 'number') {
        var self = this
        this.$nextTick(function () {
          if (self.$refs.valueInput) self.$refs.valueInput.focus()
        })
      }
    },
    handleValueInput: function (e) {
      var temp = this.ensureTpData()
      var cleaned = e.target.value.replace(/[^\d.]/g, '')
      var parts = cleaned.split('.')
      if (parts.length > 1) parts[1] = parts[1].substring(0, 1)
      temp.value = parts.join('.')
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
    },
    openCoolingDialog: function () {
      this.coolingDialogVisible = true
    },
    handleCoolingConfirm: function (records) {
      var temp = this.ensureTpData()
      this.$set(temp, 'coolingRecords', records)
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.inline-temperature {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* ── unified input group ── */
.temp-input-group {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0 3px;
  height: 28px;
  transition: background 0.15s, border-color 0.15s;
}
.inline-temperature.menu-open .temp-input-group,
.temp-input-group:focus-within {
  background: #fff;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}
.inline-temperature.out-of-range .temp-input-group {
  background: #fef2f2;
  border-color: #fecaca;
}
.inline-temperature.out-of-range .temp-input-group:focus-within {
  background: #fff;
}

/* ── type trigger (icon + chevron) ── */
.type-trigger {
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 2px 3px;
  cursor: pointer;
  border-radius: 3px;
  flex-shrink: 0;
  transition: background 0.12s;
  &:hover { background: rgba(0,0,0,0.04); }
}
.type-icon {
  display: flex;
  align-items: center;
}
.chevron-down {
  color: #aaa;
  flex-shrink: 0;
}

/* ── separator ── */
.group-sep {
  width: 1px;
  height: 14px;
  background: #ddd;
  flex-shrink: 0;
  margin: 0 2px;
}

/* ── value input ── */
.temp-value {
  width: 38px;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  padding: 0 2px;
  color: #333;
  &::placeholder { color: #bbb; font-weight: 400; font-size: 11px; }
}
.inline-temperature.out-of-range .temp-value {
  color: #d32f2f;
}
.unit {
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
  margin-left: 1px;
}

/* ── special type label ── */
.special-label {
  font-size: 12px;
  color: #e65100;
  font-weight: 500;
  white-space: nowrap;
  padding: 0 4px;
}

/* ── cooling suffix ── */
.cooling-suffix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  flex-shrink: 0;
  margin-left: 2px;
  transition: background 0.12s;
  &:hover { background: #e8f5e9; }
  &:hover svg path { fill: #1b5e20; }
}

/* ── dropdown panel ── */
.type-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  padding: 4px 0;
  z-index: 100;
  min-width: 140px;
}
.dd-section {
  padding: 4px 12px 2px;
  font-size: 10px;
  color: #999;
  letter-spacing: 0.5px;
}
.dd-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: #f5f7fa; }
  &.active {
    background: #eef4fd;
    .dd-text { color: #1a73e8; font-weight: 500; }
  }
}
.dd-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.dd-text {
  flex: 1;
  font-size: 12px;
  color: #333;
}
.dd-check {
  flex-shrink: 0;
}
.dd-divider {
  height: 1px;
  background: #eee;
  margin: 4px 8px;
}

/* ── dropdown transition ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
