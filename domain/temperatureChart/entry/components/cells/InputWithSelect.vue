<template>
  <div class="input-with-select">
    <input
      class="field-input"
      :disabled="isInputDisabled"
      :value="innerValue"
      :placeholder="inputPlaceholder"
      inputmode="decimal"
      @input="handleInput"
    />
    <span v-if="unit" class="field-unit">{{ unit }}</span>
    <el-select
      :value="innerSelect"
      size="mini"
      class="field-select"
      :placeholder="selectPlaceholder"
      @change="handleSelect"
    >
      <el-option v-for="opt in selectOptions" :key="opt" :label="opt" :value="opt" />
    </el-select>
    <span v-if="disabledLabel" class="disabled-label">{{ disabledLabel }}</span>
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
  computed: {
    npData: function () {
      var np = this.formData && this.formData.nonTimepoint
      var key = this.rowConfig && this.rowConfig.key
      if (!np || !key) return {}
      return np[key] || {}
    },
    innerValue: function () {
      return this.npData.value || ''
    },
    innerSelect: function () {
      return this.npData.selectValue || ''
    },
    isInputDisabled: function () {
      return this.disableInputOn && this.innerSelect === this.disableInputOn
    },
    disabledLabel: function () {
      if (this.isInputDisabled) return this.disableInputOn
      return ''
    }
  },
  methods: {
    ensureNp: function () {
      var key = this.rowConfig.key
      if (!this.formData.nonTimepoint[key]) {
        this.$set(this.formData.nonTimepoint, key, {})
      }
      return this.formData.nonTimepoint[key]
    },
    handleInput: function (e) {
      this.ensureNp().value = e.target.value
      this.$emit('change')
    },
    handleSelect: function (val) {
      this.ensureNp().selectValue = val
      this.$emit('change')
    },
    getFocusableInputs: function () {
      var el = this.$el
      if (!el) return []
      return Array.from(el.querySelectorAll('input:not([disabled]), select:not([disabled])'))
    }
  }
}
</script>

<style scoped>
.input-with-select {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.field-input {
  padding: 4px 6px;
  border: 1px solid transparent;
  text-align: center;
  font-size: 13px;
  border-radius: 3px;
  background: transparent;
  outline: none;
  width: 100px;
}
.field-input:focus {
  background: #fff;
  border-color: #1a73e8;
}
.field-input::placeholder {
  color: #ddd;
}
.field-input:disabled {
  background: #f5f5f5;
  color: #bbb;
}
.field-unit {
  font-size: 11px;
  color: #999;
}
.field-select {
  width: 80px;
  /deep/ .el-input__inner {
    padding: 0 20px 0 6px;
    font-size: 11px;
    height: 26px;
    line-height: 26px;
  }
}
.disabled-label {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}
</style>
