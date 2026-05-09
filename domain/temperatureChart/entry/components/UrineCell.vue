<template>
  <div class="urine-cell">
    <el-input
      :value="value"
      size="mini"
      placeholder="尿量"
      style="width:160px"
      :disabled="mark === '※'"
      @input="handleInput"
    />
    <el-select :value="mark" size="mini" style="width:90px" @change="handleMarkChange">
      <el-option v-for="m in marks" :key="m.value" :label="m.label" :value="m.value" />
    </el-select>
    <span v-if="previewText" class="urine-preview">{{ previewText }}</span>
  </div>
</template>

<script>
import { URINE_MARKS } from '../constants.js'

export default {
  name: 'UrineCell',
  props: {
    value: { type: [String, Number], default: '' },
    mark: { type: String, default: '' }
  },
  data() {
    return { marks: URINE_MARKS }
  },
  computed: {
    previewText() {
      if (!this.value && !this.mark) return ''
      if (this.mark === '※') return '失禁'
      if (this.mark === 'C' || this.mark === 'C+') {
        return this.value ? this.value + '/' + this.mark : this.mark
      }
      return ''
    }
  },
  methods: {
    handleMarkChange(val) {
      this.$emit('mark-change', val)
      this.$emit('change')
    },
    handleInput(val) {
      this.$emit('input', val)
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.urine-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.urine-preview {
  font-size: 12px;
  color: #1976d2;
  background: #e8f0fe;
  padding: 1px 6px;
  border-radius: 2px;
}
</style>
