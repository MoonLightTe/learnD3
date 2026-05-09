<template>
  <div class="custom-input-cell">
    <template v-if="inputType === 'select'">
      <el-select
        :value="value"
        size="mini"
        :placeholder="'请选择' + label"
        style="width:160px"
        @input="handleInput"
      >
        <el-option v-for="opt in options" :key="opt" :label="opt" :value="opt" />
      </el-select>
    </template>
    <template v-else>
      <input
        class="custom-field"
        :type="inputType === 'number' ? 'text' : 'text'"
        inputmode="decimal"
        :class="{ 'out-of-range': isOutOfRange }"
        :style="isOutOfRange ? { color: '#d32f2f' } : {}"
        :value="value"
        :placeholder="label"
        @input="handleInput"
      />
    </template>
    <span v-if="unit" class="custom-unit">{{ unit }}</span>
  </div>
</template>

<script>
export default {
  name: 'CustomInput',
  props: {
    formData: Object,
    rowConfig: Object,
    inputType: { type: String, default: 'text' },
    label: { type: String, default: '' },
    unit: { type: String, default: '' },
    options: { type: Array, default: function () { return [] } },
    value: { type: [String, Number], default: '' }
  },
  computed: {
    isOutOfRange: function () {
      var range = this.rowConfig && this.rowConfig.alertRange
      if (!range) return false
      var v = parseFloat(this.value)
      if (isNaN(v)) return false
      return v < range[0] || v > range[1]
    }
  },
  methods: {
    handleInput: function (val) {
      var raw = val && val.target ? val.target.value : val
      if (this.inputType === 'number' && raw) {
        raw = raw.replace(/[^\d.]/g, '')
      }
      this.$emit('input', raw)
      this.$emit('change')
    },
    getFocusableInputs: function () {
      var el = this.$el
      if (!el) return []
      return Array.from(el.querySelectorAll('input, select'))
    }
  }
}
</script>

<style scoped>
.custom-input-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}
.custom-field {
  padding: 4px 6px;
  border: 1px solid transparent;
  text-align: center;
  font-size: 13px;
  border-radius: 3px;
  background: transparent;
  outline: none;
  width: 100px;
}
.custom-field:focus {
  background: #fff;
  border-color: #1a73e8;
}
.custom-field::placeholder {
  color: #ddd;
}
.custom-field.out-of-range {
  color: #d32f2f;
}
.custom-unit {
  font-size: 11px;
  color: #999;
}
</style>
