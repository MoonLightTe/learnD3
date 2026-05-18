<template>
  <div class="fluid-input">
    <div class="fluid-field">
      <input
        class="fluid-val"
        inputmode="numeric"
        :value="value"
        placeholder="数值"
        @input="handleValueInput"
        @keydown.enter="handleEnter"
      />
      <span class="fluid-unit">ml</span>
    </div>
    <div class="fluid-field">
      <input
        class="fluid-val"
        inputmode="numeric"
        :value="hours"
        placeholder="小时"
        @input="handleHoursInput"
        @keydown.enter="handleEnter"
      />
      <span class="fluid-unit">h</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FluidInput',
  props: {
    value: { type: [String, Number], default: '' },
    hours: { type: [String, Number], default: '' }
  },
  methods: {
    handleValueInput: function (e) {
      this.$emit('input', e.target.value)
      this.$emit('change')
    },
    handleHoursInput: function (e) {
      this.$emit('hours-change', e.target.value)
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
.fluid-input {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.fluid-field {
  display: inline-flex;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 2px 6px;
  height: 28px;
  transition: background 0.15s, border-color 0.15s;
  &:focus-within {
    background: #fff;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
  }
}
.fluid-val {
  width: 60px;
  border: none;
  background: transparent;
  font-size: 13px;
  outline: none;
  padding: 0 2px;
  &::placeholder { color: #bbb; font-size: 12px; }
}
.fluid-unit {
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
  margin-left: 2px;
}
</style>
