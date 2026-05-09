<template>
  <div class="vital-signs-tab" @keydown="handleKeyNav" tabindex="-1">
    <data-grid
      :form-data="formData"
      :template-config="templateConfig"
      @change="$emit('change')"
      @clear-column="handleClearColumn"
    />
    <non-timepoint-section
      :form-data="formData"
      :template-config="templateConfig"
      @change="$emit('change')"
    />
  </div>
</template>

<script>
import DataGrid from './DataGrid.vue'
import NonTimepointSection from './NonTimepointSection.vue'

export default {
  name: 'VitalSignsTab',
  components: { DataGrid: DataGrid, NonTimepointSection: NonTimepointSection },
  props: {
    formData: { type: Object, required: true },
    templateConfig: { type: Object, required: true }
  },
  methods: {
    handleClearColumn: function (timepoint) {
      var tp = this.formData.timepoints[timepoint]
      if (tp) {
        tp.temperature = { collectionMode: null, value: '', coolingRecords: [] }
        tp.pulse = { value: '', source: null }
        tp.heartRate = { value: '', source: null }
        tp.respiration = { value: '', ventilator: false }
      }
      this.$emit('change')
      this.$message.success('已清空 ' + timepoint + ' 数据')
    },

    // 方向键导航：跨 DataGrid 和 NonTimepointSection
    handleKeyNav: function (e) {
      var key = e.key
      if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight') return

      var active = document.activeElement
      if (!active) return

      // 找当前焦点所在的 td
      var currentTd = active.closest('td')
      if (!currentTd) return

      // 确保在 VitalSignsTab 内部
      var container = this.$el
      if (!container.contains(currentTd)) return

      var currentTr = currentTd.parentElement
      var currentTable = currentTr.closest('table')
      if (!currentTable) return

      var tbody = currentTable.querySelector('tbody') || currentTable
      var rows = Array.from(tbody.children).filter(function (el) { return el.tagName === 'TR' })
      var rowIndex = rows.indexOf(currentTr)
      var cells = Array.from(currentTr.children).filter(function (el) { return el.tagName === 'TD' })
      var colIndex = cells.indexOf(currentTd)

      if (rowIndex < 0 || colIndex < 0) return

      // 多输入组件内部导航
      var focusable = currentTd.querySelectorAll('input:not([disabled]), select:not([disabled])')
      if (focusable.length > 1) {
        var idx = Array.from(focusable).indexOf(active)
        if (idx >= 0) {
          if (key === 'ArrowRight' && idx < focusable.length - 1) {
            focusable[idx + 1].focus()
            e.preventDefault()
            return
          }
          if (key === 'ArrowLeft' && idx > 0) {
            focusable[idx - 1].focus()
            e.preventDefault()
            return
          }
        }
      }

      // 计算目标位置
      var targetRow = rowIndex
      var targetCol = colIndex

      if (key === 'ArrowLeft') {
        targetCol = Math.max(1, colIndex - 1)
      } else if (key === 'ArrowRight') {
        targetCol = Math.min(cells.length - 1, colIndex + 1)
      } else if (key === 'ArrowUp') {
        // 在当前 table 内向上
        if (rowIndex > 0) {
          targetRow = rowIndex - 1
        } else {
          // 已是当前 table 第一行 → 跳到上一个 table
          var prevTable = this.findPrevTable(currentTable)
          if (prevTable) {
            var prevTbody = prevTable.querySelector('tbody') || prevTable
            var prevRows = Array.from(prevTbody.children).filter(function (el) { return el.tagName === 'TR' })
            if (prevRows.length > 0) {
              targetRow = prevRows.length - 1
              currentTable = prevTable
              rows = prevRows
              cells = this.getRowCells(prevRows[targetRow])
              colIndex = Math.min(colIndex, cells.length - 1)
              targetCol = Math.max(1, colIndex)
              rowIndex = targetRow + 1 // 确保 targetRow !== rowIndex
            }
          }
        }
      } else if (key === 'ArrowDown') {
        // 在当前 table 内向下
        if (rowIndex < rows.length - 1) {
          targetRow = rowIndex + 1
        } else {
          // 已是当前 table 最后一行 → 跳到下一个 table
          var nextTable = this.findNextTable(currentTable)
          if (nextTable) {
            var nextTbody = nextTable.querySelector('tbody') || nextTable
            var nextRows = Array.from(nextTbody.children).filter(function (el) { return el.tagName === 'TR' })
            if (nextRows.length > 0) {
              targetRow = 0
              currentTable = nextTable
              rows = nextRows
              cells = this.getRowCells(nextRows[0])
              colIndex = Math.min(colIndex, cells.length - 1)
              targetCol = Math.max(1, colIndex)
              rowIndex = -1 // 确保 targetRow !== rowIndex
            }
          }
        }
      }

      if (targetRow === rowIndex && targetCol === colIndex) return

      e.preventDefault()
      var targetTr = rows[targetRow]
      if (!targetTr) return
      var targetCells = this.getRowCells(targetTr)
      var targetTd = targetCells[targetCol]
      if (!targetTd) return

      var input = targetTd.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
      if (input) {
        input.focus()
        if (input.select) input.select()
      }
    },

    getRowCells: function (tr) {
      return Array.from(tr.children).filter(function (el) { return el.tagName === 'TD' })
    },

    findPrevTable: function (currentTable) {
      var tables = Array.from(this.$el.querySelectorAll('table'))
      var idx = tables.indexOf(currentTable)
      return idx > 0 ? tables[idx - 1] : null
    },

    findNextTable: function (currentTable) {
      var tables = Array.from(this.$el.querySelectorAll('table'))
      var idx = tables.indexOf(currentTable)
      return idx < tables.length - 1 ? tables[idx + 1] : null
    }
  }
}
</script>
