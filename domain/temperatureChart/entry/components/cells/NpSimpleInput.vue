<template>
  <div class="np-simple-input">
    <el-input
      :value="value"
      size="mini"
      :placeholder="rowConfig.label"
      style="width:160px"
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
    onInput: function (val) {
      var key = this.rowConfig.key
      if (!this.formData.nonTimepoint[key]) {
        this.$set(this.formData.nonTimepoint, key, { value: val })
      } else {
        this.$set(this.formData.nonTimepoint[key], 'value', val)
      }
      this.$emit('change')
    }
  }
}
</script>

<style scoped>
.np-simple-input { display: inline-flex; align-items: center; gap: 4px; }
.unit-label { font-size: 12px; color: #909399; }
</style>
