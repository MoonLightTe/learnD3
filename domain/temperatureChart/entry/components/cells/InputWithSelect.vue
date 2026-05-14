<template>
  <div class="input-with-select" :class="rootClasses">
    <div class="iws-group">
      <span class="select-trigger" @click.stop="toggleSelectMenu" :title="localSelect || selectPlaceholder">
        <span class="select-text">{{ localSelect || selectPlaceholder }}</span>
        <svg class="chevron-down" viewBox="0 0 10 10" width="10" height="10">
          <path d="M2.5 3.5l2.5 2.5 2.5-2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="group-sep"></span>
      <template v-if="!isInputDisabled">
        <input
          class="iws-input"
          :class="{ 'out-of-range': isOutOfRange }"
          :value="localValue"
          :placeholder="inputPlaceholder"
          @input="handleInput"
        />
        <span v-if="unit" class="iws-unit">{{ unit }}</span>
      </template>
      <span v-else class="disabled-label">{{ disabledLabel }}</span>
    </div>

    <transition name="dropdown">
      <div v-if="selectMenuVisible" class="select-dropdown" @click.stop>
        <div
          v-for="opt in selectOptions"
          :key="opt"
          class="dd-item"
          :class="{ active: localSelect === opt }"
          @mousedown.prevent="selectOption(opt)"
        >
          <span class="dd-text">{{ opt }}</span>
          <svg v-if="localSelect === opt" class="dd-check" viewBox="0 0 16 16" width="12" height="12">
            <path d="M3 8l3 3 7-7" fill="none" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'InputWithSelect',
  props: {
    formData: Object,
    rowConfig: Object,
    inputPlaceholder: { type: String, default: '' },
    selectPlaceholder: { type: String, default: '请选择' },
    selectOptions: { type: Array, default: function () { return [] } },
    unit: { type: String, default: '' },
    disableInputOn: { type: String, default: '' }
  },
  data: function () {
    return {
      localValue: '',
      localSelect: '',
      selectMenuVisible: false
    }
  },
  computed: {
    npData: function () {
      var np = this.formData && this.formData.nonTimepoint
      var key = this.rowConfig && this.rowConfig.key
      if (!np || !key) return {}
      return np[key] || {}
    },
    isInputDisabled: function () {
      if (!this.disableInputOn) return false
      return this.localSelect === this.disableInputOn
    },
    isOutOfRange: function () {
      var range = this.rowConfig && this.rowConfig.alertRange
      if (!range) return false
      var v = parseFloat(this.localValue)
      if (isNaN(v)) return false
      return v < range[0] || v > range[1]
    },
    disabledLabel: function () {
      if (this.isInputDisabled) return this.disableInputOn
      return ''
    },
    rootClasses: function () {
      return {
        'menu-open': this.selectMenuVisible,
        'positive-result': this.localSelect === '阳性',
        'out-of-range': this.isOutOfRange
      }
    }
  },
  watch: {
    'npData.value': function (v) {
      this.localValue = v || ''
    },
    'npData.selectValue': function (v) {
      this.localSelect = v || ''
    }
  },
  created: function () {
    this.localValue = this.npData.value || ''
    this.localSelect = this.npData.selectValue || ''
  },
  mounted: function () {
    var self = this
    this._docClick = function (e) {
      if (!self.$el.contains(e.target)) self.selectMenuVisible = false
    }
    document.addEventListener('click', this._docClick, true)
  },
  beforeDestroy: function () {
    document.removeEventListener('click', this._docClick, true)
  },
  methods: {
    ensureNp: function () {
      var key = this.rowConfig.key
      if (!this.formData.nonTimepoint[key]) {
        this.$set(this.formData.nonTimepoint, key, {})
      }
      return this.formData.nonTimepoint[key]
    },
    toggleSelectMenu: function () {
      this.selectMenuVisible = !this.selectMenuVisible
    },
    selectOption: function (val) {
      this.localSelect = val
      this.$set(this.ensureNp(), 'selectValue', val)
      this.selectMenuVisible = false
      this.$emit('change')
    },
    handleInput: function (e) {
      this.localValue = e.target.value
      this.$set(this.ensureNp(), 'value', e.target.value)
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.input-with-select {
  display: inline-flex;
  align-items: center;
  position: relative;
}
.iws-group {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0 3px;
  height: 28px;
  transition: background 0.15s, border-color 0.15s;
}
.input-with-select.menu-open .iws-group,
.iws-group:focus-within {
  background: #fff;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}
.input-with-select.positive-result .iws-group {
  border-color: #f57c00;
  background: #fff8f0;
}
.input-with-select.out-of-range .iws-group {
  background: #fef2f2;
  border-color: #fecaca;
}
.input-with-select.out-of-range .iws-group:focus-within {
  background: #fff;
}

.select-trigger {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 3px;
  flex-shrink: 0;
  &:hover { background: rgba(0,0,0,0.04); }
}
.select-text {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}
.chevron-down { color: #aaa; flex-shrink: 0; }
.group-sep {
  width: 1px;
  height: 14px;
  background: #ddd;
  flex-shrink: 0;
  margin: 0 2px;
}
.iws-input {
  width: 80px;
  border: none;
  background: transparent;
  font-size: 13px;
  outline: none;
  padding: 0 2px;
  &::placeholder { color: #bbb; font-size: 12px; }
}
.out-of-range .iws-input {
  color: #d32f2f;
}
.iws-unit {
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
  margin-left: 2px;
}
.disabled-label {
  font-size: 12px;
  color: #999;
  font-style: italic;
  padding: 0 4px;
}

/* dropdown */
.select-dropdown {
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
  min-width: 120px;
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
.dd-text { flex: 1; font-size: 12px; color: #333; }
.dd-check { flex-shrink: 0; }

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.dropdown-enter, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
