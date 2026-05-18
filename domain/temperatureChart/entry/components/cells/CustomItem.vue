<template>
  <div class="custom-item" :class="{ 'out-of-range': isOutOfRange }">
    <input
      class="custom-label"
      :value="itemLabel"
      placeholder="输入名称"
      @input="handleLabelChange"
    />
    <input
      v-if="inputType !== 'select'"
      class="custom-value"
      :value="itemValue"
      :placeholder="valuePlaceholder"
      @input="handleValueChange"
      @keydown.enter="handleEnter"
    />
    <el-select
      v-else
      :value="itemValue"
      size="mini"
      class="custom-select"
      :placeholder="valuePlaceholder"
      @change="handleValueChange"
    >
      <el-option v-for="opt in options" :key="opt" :label="opt" :value="opt" />
    </el-select>
    <span v-if="unit" class="custom-unit">{{ unit }}</span>
  </div>
</template>

<script>
export default {
  name: 'CustomItem',
  props: {
    formData: Object,
    rowConfig: Object,
    inputType: { type: String, default: 'text' },
    unit: { type: String, default: '' },
    options: { type: Array, default: function () { return [] } },
    valuePlaceholder: { type: String, default: '数值' }
  },
  computed: {
    npData: function () {
      var np = this.formData && this.formData.nonTimepoint
      var key = this.rowConfig && this.rowConfig.key
      if (!np || !key) return {}
      return np[key] || {}
    },
    itemLabel: function () {
      return this.npData.label || (this.rowConfig && this.rowConfig.label) || ''
    },
    itemValue: function () {
      return this.npData.value || ''
    },
    isOutOfRange: function () {
      var range = this.rowConfig && this.rowConfig.alertRange
      if (!range) return false
      var v = parseFloat(this.itemValue)
      if (isNaN(v)) return false
      return v < range[0] || v > range[1]
    }
  },
  methods: {
    ensureNp: function () {
      var key = this.rowConfig.key
      if (!this.formData.nonTimepoint[key]) {
        this.$set(this.formData.nonTimepoint, key, { label: this.rowConfig.label || '', value: '' })
      }
      return this.formData.nonTimepoint[key]
    },
    handleLabelChange: function (e) {
      this.$set(this.ensureNp(), 'label', e.target.value)
      this.$emit('change')
      this.$emit('label-change', { key: this.rowConfig.key, label: e.target.value })
    },
    handleValueChange: function (val) {
      var raw = val && val.target ? val.target.value : val
      this.$set(this.ensureNp(), 'value', raw)
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

<style lang="less" scoped>
.custom-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.custom-label {
  width: 80px;
  padding: 4px 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  background: #fafafa;
  outline: none;
  transition: background 0.15s, border-color 0.15s;
}
.custom-label:focus {
  border-color: #1a73e8;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}
.custom-value {
  padding: 4px 6px;
  border: 1px solid transparent;
  text-align: center;
  font-size: 13px;
  border-radius: 4px;
  background: #f5f7fa;
  outline: none;
  width: 100px;
  transition: background 0.15s, border-color 0.15s;
}
.custom-value:focus {
  background: #fff;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}
.custom-value::placeholder {
  color: #bbb;
  font-size: 12px;
}
.custom-item.out-of-range .custom-value {
  color: #d32f2f;
  background: #fef2f2;
}
.custom-unit {
  font-size: 11px;
  color: #999;
}
.custom-select {
  width: 120px;
  /deep/ .el-input__inner {
    padding: 0 20px 0 6px;
    font-size: 11px;
    height: 28px;
    line-height: 28px;
    background: #f5f7fa;
    border: 1px solid transparent;
    border-radius: 4px;
  }
}
</style>
