<template>
  <div class="weight-cell">
    <el-input
      :value="value"
      size="mini"
      placeholder="体重"
      style="width:160px"
      :disabled="assistMethod === '卧床'"
      @input="handleInput"
    >
      <template slot="append">kg</template>
    </el-input>
    <el-select :value="assistMethod" size="mini" style="width:80px" @change="handleAssistChange">
      <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
    </el-select>
    <span v-if="assistMethod === '卧床'" class="weight-bed-text">卧床</span>
  </div>
</template>

<script>
import { WEIGHT_ASSIST_METHODS } from '../constants.js'

export default {
  name: 'WeightCell',
  props: {
    value: { type: [String, Number], default: '' },
    assistMethod: { type: String, default: '无' }
  },
  data() {
    return { methods: WEIGHT_ASSIST_METHODS }
  },
  methods: {
    handleInput(val) {
      this.$emit('input', val)
      this.$emit('change')
    },
    handleAssistChange(val) {
      this.$emit('assist-change', val)
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.weight-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.weight-bed-text {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}
</style>
