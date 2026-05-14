<template>
  <div class="np-simple-input">
    <input
      class="np-input"
      :value="value"
      :placeholder="rowConfig.label"
      @input="onInput"
    />
    <span v-if="rowConfig.unit" class="unit-label">{{ rowConfig.unit }}</span>
  </div>
</template>

<script>
export default {
  name: 'NpSimpleInput',
  props: {
    formData: Object,
    rowConfig: Object
  },
  computed: {
    value: function () {
      var np = this.formData && this.formData.nonTimepoint
      var field = np && np[this.rowConfig.key]
      return field && field.value != null ? field.value : ''
    }
  },
  methods: {
    onInput: function (e) {
      var key = this.rowConfig.key
      if (!this.formData.nonTimepoint[key]) {
        this.$set(this.formData.nonTimepoint, key, { value: e.target.value })
      } else {
        this.$set(this.formData.nonTimepoint[key], 'value', e.target.value)
      }
      this.$emit('change')
    }
  }
}
</script>

<style scoped>
.np-simple-input {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.np-input {
  width: 140px;
  padding: 5px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: #f5f7fa;
  font-size: 13px;
  outline: none;
  transition: background 0.15s, border-color 0.15s;
}
.np-input:focus {
  background: #fff;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}
.np-input::placeholder {
  color: #bbb;
  font-size: 12px;
}
.unit-label {
  font-size: 11px;
  color: #999;
}
</style>
