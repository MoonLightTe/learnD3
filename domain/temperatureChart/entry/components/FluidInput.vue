<template>
  <div class="fluid-input">
    <el-input :value="value" size="mini" placeholder="数值" style="width:160px" @input="handleValueInput">
      <template slot="append">ml</template>
    </el-input>
    <el-input :value="hours" size="mini" placeholder="小时" style="width:140px" @input="handleHoursInput">
      <template slot="append">h</template>
    </el-input>
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
    handleValueInput(val) {
      this.$emit('input', val)
      this.$emit('change')
    },
    handleHoursInput(val) {
      this.$emit('hours-change', val)
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.fluid-input {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
