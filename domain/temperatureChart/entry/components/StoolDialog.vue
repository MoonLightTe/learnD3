<template>
  <el-dialog
    title="大便记录"
    :visible="visible"
    width="420px"
    :before-close="handleClose"
    append-to-body
  >
    <div class="stool-form">
      <el-form label-width="100px" size="small">
        <el-form-item label="自行排便">
          <el-input-number v-model="form.selfCount" :min="0" :max="99" />
          <span class="unit">次</span>
        </el-form-item>
        <el-form-item label="灌肠次数">
          <el-input-number v-model="form.enemaCount" :min="0" :max="99" />
          <span class="unit">次</span>
        </el-form-item>
        <el-form-item label="灌肠后排便">
          <el-input-number
            v-model="form.enemaStoolCount"
            :min="0"
            :max="99"
            :disabled="form.enemaCount === 0"
          />
          <span class="unit">次</span>
        </el-form-item>
        <el-form-item label="特殊状态">
          <el-radio-group v-model="form.specialStatus">
            <el-radio label="">无</el-radio>
            <el-radio label="☆">人工肛门</el-radio>
            <el-radio label="※">大便失禁</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="记录结果">
          <span class="preview-value">{{ previewValue }}</span>
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
function assembleStoolValue(form) {
  var selfCount = form.selfCount || 0
  var enemaCount = form.enemaCount || 0
  var enemaStoolCount = form.enemaStoolCount || 0
  var specialStatus = form.specialStatus

  if (specialStatus === '☆') return '☆'
  if (specialStatus === '※') return enemaCount > 0 ? '※/E' : '※'

  if (enemaCount > 0) {
    if (enemaStoolCount > 0) return selfCount + '/' + enemaStoolCount + '/E'
    if (enemaCount > 1) return selfCount + '/' + enemaCount + 'E'
    return selfCount + '/E'
  }

  return String(selfCount)
}

function parseStoolValue(rawValue) {
  var form = { selfCount: 0, enemaCount: 0, enemaStoolCount: 0, specialStatus: '' }
  if (!rawValue) return form

  if (rawValue === '☆') return { selfCount: 0, enemaCount: 0, enemaStoolCount: 0, specialStatus: '☆' }
  if (rawValue === '※') return { selfCount: 0, enemaCount: 0, enemaStoolCount: 0, specialStatus: '※' }
  if (rawValue === '※/E') return { selfCount: 0, enemaCount: 1, enemaStoolCount: 0, specialStatus: '※' }

  var parts = rawValue.split('/')
  form.selfCount = parseInt(parts[0]) || 0

  if (parts.length > 1) {
    var last = parts[parts.length - 1]
    if (last.endsWith('E')) {
      form.enemaCount = 1
      var num = parseInt(last)
      if (num > 1) form.enemaCount = num
      if (parts.length === 3) {
        form.enemaStoolCount = parseInt(parts[1]) || 0
      }
    }
  }

  return form
}

export default {
  name: 'StoolDialog',
  props: {
    visible: { type: Boolean, default: false },
    value: { type: String, default: '' }
  },
  data: function () {
    return {
      form: { selfCount: 0, enemaCount: 0, enemaStoolCount: 0, specialStatus: '' }
    }
  },
  computed: {
    previewValue: function () {
      return assembleStoolValue(this.form)
    }
  },
  watch: {
    visible: function (val) {
      if (val) {
        this.form = parseStoolValue(this.value)
      }
    }
  },
  methods: {
    handleConfirm: function () {
      var selfCount = this.form.selfCount
      var enemaCount = this.form.enemaCount
      var specialStatus = this.form.specialStatus
      if (selfCount === 0 && enemaCount === 0 && !specialStatus) {
        this.$message.warning('请至少填写一项')
        return
      }
      this.$emit('confirm', this.previewValue)
      this.doClose()
    },
    handleClose: function () {
      this.doClose()
    },
    doClose: function () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="less" scoped>
.stool-form {
  padding: 0 4px;
}

.unit {
  margin-left: 6px;
  font-size: 12px;
  color: #909399;
}

.preview-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  letter-spacing: 1px;
}
</style>
