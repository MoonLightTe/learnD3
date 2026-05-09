<template>
  <el-dialog title="同步数据" :visible.sync="dialogVisible" width="680px" @close="handleClose">
    <div class="sync-panel">
      <div class="sync-toolbar">
        <el-checkbox v-model="selectAll" :indeterminate="indeterminate" @change="toggleSelectAll">全选</el-checkbox>
        <span class="sync-hint">已有数据的字段将跳过，不覆盖</span>
      </div>
      <table class="sync-table">
        <thead>
          <tr>
            <th style="width:40px"></th>
            <th style="width:70px">时间</th>
            <th>体温</th>
            <th style="width:60px">脉搏</th>
            <th style="width:60px">心率</th>
            <th style="width:60px">呼吸</th>
            <th>血压</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dataList.length === 0">
            <td colspan="7" class="empty-row">暂无可同步数据</td>
          </tr>
          <tr v-for="(row, idx) in dataList" :key="idx" :class="{ 'row-selected': selected[idx] }">
            <td><el-checkbox v-model="selected[idx]" @change="updateSelectAll" /></td>
            <td class="cell-center">{{ row.time }}</td>
            <td>
              <span v-if="row.temperature">{{ row.temperature }}{{ row.tempMethod ? row.tempMethod : '' }}</span>
              <span v-else class="cell-empty">—</span>
            </td>
            <td class="cell-center">{{ row.pulse || '—' }}</td>
            <td class="cell-center">{{ row.heartRate || '—' }}</td>
            <td class="cell-center">{{ row.respiration || '—' }}</td>
            <td>{{ row.bloodPressure || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <span slot="footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button size="small" type="primary" :disabled="selectedCount === 0" @click="handleSync">
        导入选中 ({{ selectedCount }})
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'SyncDialog',
  props: {
    visible: { type: Boolean, default: false },
    dataList: { type: Array, default: function () { return [] } }
  },
  data: function () {
    return {
      selected: []
    }
  },
  computed: {
    dialogVisible: {
      get: function () { return this.visible },
      set: function (val) { this.$emit('update:visible', val) }
    },
    selectAll: {
      get: function () {
        return this.dataList.length > 0 && this.selected.every(function (s) { return s })
      },
      set: function () {}
    },
    indeterminate: function () {
      var checked = this.selected.filter(function (s) { return s }).length
      return checked > 0 && checked < this.dataList.length
    },
    selectedCount: function () {
      return this.selected.filter(function (s) { return s }).length
    }
  },
  watch: {
    visible: function (val) {
      if (val) {
        this.selected = this.dataList.map(function () { return true })
      }
    }
  },
  methods: {
    toggleSelectAll: function (val) {
      this.selected = this.dataList.map(function () { return val })
    },
    updateSelectAll: function () {
      this.$forceUpdate()
    },
    handleSync: function () {
      var selectedData = this.dataList.filter(function (_, i) { return this.selected[i] }.bind(this))
      this.$emit('sync', selectedData)
      this.dialogVisible = false
    },
    handleClose: function () {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.sync-panel {
  max-height: 400px;
  overflow-y: auto;
}
.sync-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.sync-hint {
  font-size: 12px;
  color: #909399;
}
.sync-table {
  width: 100%;
  border-collapse: collapse;
}
.sync-table th {
  text-align: left;
  padding: 8px 6px;
  font-size: 12px;
  font-weight: 500;
  color: #999;
  border-bottom: 1px solid #eee;
}
.sync-table td {
  padding: 8px 6px;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}
.sync-table tr.row-selected td {
  background: #f0f7ff;
}
.sync-table tr:hover td {
  background: #f8fbff;
}
.empty-row {
  text-align: center;
  color: #c0c4cc;
  padding: 32px 0;
}
.cell-center {
  text-align: center;
}
.cell-empty {
  color: #ddd;
}
</style>
