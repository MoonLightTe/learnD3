<template>
  <div class="custom-item">
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
      :class="{ 'out-of-range': isOutOfRange }"
      :style="isOutOfRange ? { color: '#d32f2f' } : {}"
      @input="handleValueChange"
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
        this.$set(this.formData.nonTimepoint, key, { label: this.rowConfig.label || '' })
      }
      return this.formData.nonTimepoint[key]
    },
    handleLabelChange: function (e) {
      this.ensureNp().label = e.target.value
      this.$emit('change')
    },
    handleValueChange: function (val) {
      var raw = val && val.target ? val.target.value : val
      this.ensureNp().value = raw
      this.$emit('change')
    }
  }
}
</script>

<style scoped>
.custom-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.custom-label {
  width: 80px;
  padding: 4px 6px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  font-size: 12px;
  color: #333;
  background: #fafafa;
  outline: none;
}
.custom-label:focus {
  border-color: #1a73e8;
  background: #fff;
}
.custom-value {
  padding: 4px 6px;
  border: 1px solid transparent;
  text-align: center;
  font-size: 13px;
  border-radius: 3px;
  background: transparent;
  outline: none;
  width: 100px;
}
.custom-value:focus {
  background: #fff;
  border-color: #1a73e8;
}
.custom-value::placeholder {
  color: #ddd;
}
.custom-value.out-of-range {
  color: #d32f2f;
}
.custom-unit {
  font-size: 11px;
  color: #999;
}
.custom-select {
  width: 100px;
  /deep/ .el-input__inner {
    padding: 0 20px 0 6px;
    font-size: 11px;
    height: 26px;
    line-height: 26px;
  }
}
</style>
