<template>
  <div class="event-panel">
    <div class="event-table-wrap">
      <table class="event-table">
        <thead>
          <tr>
            <th style="width:100px">事件</th>
            <th>事件标题</th>
            <th style="width:80px">事件时间</th>
            <th style="width:90px">记录时间</th>
            <th style="width:70px">记录人</th>
            <th style="width:50px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="events.length === 0">
            <td colspan="6" class="empty-row">暂无事件记录</td>
          </tr>
          <tr v-for="(row, index) in events" :key="index" :class="{ 'row-highlight': highlightIndex === index }">
            <td>
              <span class="event-type-tag" :style="getTagStyle(row.type)">{{ row.type }}</span>
            </td>
            <td class="cell-content">{{ row.content || '—' }}</td>
            <td class="cell-center">{{ row.eventTime }}</td>
            <td class="cell-center">{{ row.recordTime }}</td>
            <td class="cell-center">{{ row.recorder }}</td>
            <td class="cell-center">
              <button class="event-op-btn" title="编辑" @click="handleEdit(row, index)">
                <i class="el-icon-edit"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="event-footer">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加新事件</el-button>
    </div>

    <event-edit-dialog
      :visible.sync="dialogVisible"
      :edit-data="dialogData"
      :timepoints="timepointOptions"
      @confirm="handleDialogConfirm"
    />
  </div>
</template>

<script>
import EventEditDialog from './EventEditDialog.vue'
import TEMPLATE_CONFIG from '../template.json'

// 事件类型 → 标签颜色映射
var EVENT_COLOR_MAP = {}
;(TEMPLATE_CONFIG.events || []).forEach(function (evt) {
  EVENT_COLOR_MAP[evt.type] = evt.color
})

export default {
  name: 'EventRecordTab',
  components: { EventEditDialog: EventEditDialog },
  props: {
    events: { type: Array, default: function () { return [] } }
  },
  data: function () {
    return {
      dialogVisible: false,
      dialogData: null,
      editingIndex: -1,
      highlightIndex: -1,
      timepointOptions: TEMPLATE_CONFIG.timepoints || []
    }
  },
  methods: {
    getTagStyle: function (type) {
      var color = EVENT_COLOR_MAP[type] || '#409EFF'
      var bgMap = {
        '#409EFF': { bg: '#e3f2fd', fg: '#1565c0' },
        '#F56C6C': { bg: '#fce4ec', fg: '#c62828' },
        '#9B59B6': { bg: '#f3e5f5', fg: '#7b1fa2' },
        '#E6A23C': { bg: '#fff3e0', fg: '#e65100' },
        '#909399': { bg: '#f5f5f5', fg: '#666' }
      }
      var mapped = bgMap[color] || bgMap['#409EFF']
      return { background: mapped.bg, color: mapped.fg }
    },
    handleAdd: function () {
      this.dialogData = null
      this.editingIndex = -1
      this.dialogVisible = true
    },
    handleEdit: function (row, index) {
      this.dialogData = Object.assign({}, row, { id: true })
      this.editingIndex = index
      this.dialogVisible = true
    },
    handleDialogConfirm: function (data) {
      if (this.editingIndex >= 0) {
        this.$set(this.events, this.editingIndex, Object.assign({}, data))
      } else {
        this.events.push(Object.assign({}, data, { recorder: '当前用户' }))
        this.highlightIndex = this.events.length - 1
        setTimeout(function () { this.highlightIndex = -1 }.bind(this), 2000)
      }
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.event-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-table-wrap {
  flex: 1;
  overflow: auto;
  padding: 0 16px;
}

.event-table {
  width: 100%;
  border-collapse: collapse;
}

.event-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #999;
  border-bottom: 1px solid #eee;
}

.event-table td {
  padding: 12px;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}

.event-table tr:hover td {
  background: #f8fbff;
}

@keyframes rowFlash {
  0% { background: #e3f2fd; }
  50% { background: #bbdefb; }
  100% { background: transparent; }
}
.row-highlight td {
  animation: rowFlash 0.6s ease 3;
}

.empty-row {
  text-align: center;
  color: #c0c4cc;
  padding: 40px 0;
}

.cell-content {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-center {
  text-align: center;
}

.event-type-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.event-op-btn {
  cursor: pointer;
  color: #999;
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 4px;
  border: none;
  background: none;
  &:hover { color: #1a73e8; background: #e8f0fe; }
}

.event-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
