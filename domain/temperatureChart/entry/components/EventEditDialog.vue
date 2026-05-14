<template>
  <el-dialog
    :title="isEdit ? '编辑事件' : '新增事件'"
    :visible="visible"
    width="440px"
    :before-close="handleClose"
    append-to-body
  >
    <el-form label-width="100px" size="small">
      <el-form-item label="事件类型" required>
        <el-select v-model="form.type" placeholder="请选择" style="width:160px">
          <el-option v-for="t in eventTypes" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item label="事件标题">
        <el-input v-model="form.content" placeholder="请输入事件标题" style="width:240px" />
      </el-form-item>
      <el-form-item label="事件时间" required>
        <el-select v-model="form.eventTime" placeholder="选择时间点" style="width:160px">
          <el-option v-for="tp in timepoints" :key="tp" :label="tp" :value="tp" />
        </el-select>
      </el-form-item>
      <el-form-item label="记录时间">
        <el-time-picker
          v-model="form.recordTime"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="选择时间"
          style="width:160px"
        />
      </el-form-item>
      <el-form-item v-if="form.type === '转科'" label="目标科室" required>
        <el-input v-model="form.targetDept" placeholder="请输入目标科室" style="width:240px" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { EVENT_TYPES } from '../constants.js'
import TEMPLATE_CONFIG from '../template.json'
import dayjs from 'dayjs'

export default {
  name: 'EventEditDialog',
  props: {
    visible: { type: Boolean, default: false },
    editData: { type: Object, default: null },
    timepoints: { type: Array, default: function () { return [] } }
  },
  data: function () {
    return {
      eventTypes: EVENT_TYPES,
      form: { type: '', content: '', eventTime: '', recordTime: '', targetDept: '' }
    }
  },
  computed: {
    isEdit: function () {
      return !!(this.editData && this.editData.id)
    }
  },
  watch: {
    visible: function (val) {
      if (val) {
        if (this.editData) {
          this.form = {
            type: this.editData.type || '',
            content: this.editData.content || '',
            eventTime: this.editData.eventTime || '',
            recordTime: this.editData.recordTime || '',
            targetDept: this.editData.targetDept || ''
          }
        } else {
          this.form = {
            type: '',
            content: '',
            eventTime: this.timepoints.length > 0 ? this.timepoints[0] : '',
            recordTime: dayjs().format('HH:mm'),
            targetDept: ''
          }
        }
      }
    }
  },
  methods: {
    handleConfirm: function () {
      if (!this.form.type) return this.$message.warning('请选择事件类型')
      var self = this
      var eventConfig = (TEMPLATE_CONFIG.events || []).find(function (e) { return e.type === self.form.type })
      if (eventConfig && eventConfig.needTime !== false && !this.form.eventTime) return this.$message.warning('请选择事件时间')
      if (this.form.type === '转科' && !this.form.targetDept) return this.$message.warning('请填写目标科室')
      this.$emit('confirm', Object.assign({}, this.form))
      this.$emit('update:visible', false)
    },
    handleClose: function () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-dialog__header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
}
/deep/ .el-dialog__body {
  padding: 20px;
}
/deep/ .el-form-item {
  margin-bottom: 16px;
}
/deep/ .el-form-item__label {
  font-size: 13px;
  color: #555;
}
/deep/ .el-dialog__footer {
  padding: 12px 20px 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
