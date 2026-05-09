<template>
  <div class="input-with-select">
    <el-input
      v-model="localValue"
      size="mini"
      class="field-input"
      :placeholder="inputPlaceholder"
      :disabled="isInputDisabled"
      @input="handleInput"
    />
    <span v-if="unit" class="field-unit">{{ unit }}</span>
    <el-select
      v-model="localSelect"
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
  data: function () {
    return {
      localValue: '',
      localSelect: ''
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
      if(!this.disableInputOn) return false
      return this.disableInputOn && this.localSelect === this.disableInputOn
    },
    disabledLabel: function () {
      if (this.isInputDisabled) return this.disableInputOn
      return ''
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
  methods: {
    ensureNp: function () {
      var key = this.rowConfig.key
      if (!this.formData.nonTimepoint[key]) {
        this.$set(this.formData.nonTimepoint, key, {})
      }
      return this.formData.nonTimepoint[key]
    },
    handleInput: function (val) {
      this.$set(this.ensureNp(), 'value', val)
      this.$emit('change')
    },
    handleSelect: function (val) {
      this.localSelect = val
      this.$set(this.ensureNp(), 'selectValue', val)
      this.$emit('change')
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
  width: 120px;
}
.field-unit {
  font-size: 11px;
  color: #999;
}
.field-select {
  width: 120px;
}
.disabled-label {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}
</style>
