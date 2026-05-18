<template>
  <div class="urine-cell" :class="{ 'menu-open': markMenuVisible }">
    <div class="urine-group">
      <span class="mark-trigger" @click.stop="toggleMarkMenu" :title="currentMarkLabel">
        <span class="mark-text">{{ currentMarkLabel }}</span>
        <svg class="chevron-down" viewBox="0 0 10 10" width="10" height="10">
          <path d="M2.5 3.5l2.5 2.5 2.5-2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="group-sep"></span>
      <input
        class="urine-input"
        inputmode="numeric"
        :value="value"
        placeholder="尿量"
        :disabled="mark === '※'"
        :title="mark === '※' ? '失禁状态，无需输入' : ''"
        @input="handleInput"
      />
      <span class="urine-unit">ml</span>
    </div>
    <span v-if="previewText" class="urine-preview">{{ previewText }}</span>

    <transition name="dropdown">
      <div v-if="markMenuVisible" class="mark-dropdown" @click.stop>
        <div
          v-for="m in marks"
          :key="m.value"
          class="dd-item"
          :class="{ active: mark === m.value }"
          @mousedown.prevent="selectMark(m.value)"
        >
          <span class="dd-text">{{ m.label }}</span>
          <svg v-if="mark === m.value" class="dd-check" viewBox="0 0 16 16" width="12" height="12">
            <path d="M3 8l3 3 7-7" fill="none" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { URINE_MARKS } from '../constants.js'

var MARK_LABELS = {}
URINE_MARKS.forEach(function (m) { MARK_LABELS[m.value || '无'] = m.label })

export default {
  name: 'UrineCell',
  props: {
    value: { type: [String, Number], default: '' },
    mark: { type: String, default: '' }
  },
  data: function () {
    return {
      marks: URINE_MARKS,
      markMenuVisible: false
    }
  },
  computed: {
    currentMarkLabel: function () {
      return MARK_LABELS[this.mark || '无'] || '无'
    },
    previewText: function () {
      if (!this.value && !this.mark) return ''
      if (this.mark === '※') return '失禁'
      if (this.mark === 'C' || this.mark === 'C+') {
        return this.value ? this.value + '/' + this.mark : this.mark
      }
      return ''
    }
  },
  mounted: function () {
    var self = this
    this._docClick = function (e) {
      if (!self.$el.contains(e.target)) self.markMenuVisible = false
    }
    document.addEventListener('click', this._docClick, true)
  },
  beforeDestroy: function () {
    document.removeEventListener('click', this._docClick, true)
  },
  methods: {
    toggleMarkMenu: function () {
      this.markMenuVisible = !this.markMenuVisible
    },
    selectMark: function (val) {
      this.markMenuVisible = false
      this.$emit('mark-change', val)
      this.$emit('change')
    },
    handleInput: function (e) {
      this.$emit('input', e.target.value)
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.urine-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.urine-group {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0 3px;
  height: 28px;
  transition: background 0.15s, border-color 0.15s;
}
.urine-cell.menu-open .urine-group,
.urine-group:focus-within {
  background: #fff;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}

.mark-trigger {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 3px;
  flex-shrink: 0;
  &:hover { background: rgba(0,0,0,0.04); }
}
.mark-text {
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
.urine-input {
  width: 60px;
  border: none;
  background: transparent;
  font-size: 13px;
  outline: none;
  padding: 0 2px;
  &::placeholder { color: #bbb; font-size: 12px; }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
.urine-unit {
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
}
.urine-preview {
  font-size: 12px;
  color: #1a73e8;
  background: #eef4fd;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

/* dropdown */
.mark-dropdown {
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
.dd-text {
  flex: 1;
  font-size: 12px;
  color: #333;
}
.dd-check { flex-shrink: 0; }

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.dropdown-enter, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
