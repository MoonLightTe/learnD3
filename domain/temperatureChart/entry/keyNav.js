/**
 * 方向键表格导航 — 公共逻辑
 *
 * 用法：
 *   handleKeyNav(e, {
 *     container: this.$el,
 *     safeColMin: 1,       // 左边界列最小值（跳过标签列）
 *     findUp:   function(ctx) { ... },  // 可选：上边界自定义（如跨 table）
 *     findDown: function(ctx) { ... },  // 可选：下边界自定义
 *   })
 *
 * ctx = { rows, rowIndex, cells, colIndex, currentTable }
 * findUp/findDown 返回新的 ctx 或 null（表示不可移动）
 */

export function handleTableKeyNav(e, opts) {
  var key = e.key
  if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight') return

  var active = document.activeElement
  if (!active) return

  var currentTd = active.closest('td')
  if (!currentTd) return

  var container = opts.container
  if (!container || !container.contains(currentTd)) return

  var currentTr = currentTd.parentElement
  var currentTable = currentTr.closest('table')
  if (!currentTable) return

  var tbody = currentTable.querySelector('tbody') || currentTable
  var rows = filterRows(tbody)
  var rowIndex = rows.indexOf(currentTr)
  var cells = filterCells(currentTr)
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

  var safeColMin = opts.safeColMin || 0
  var ctx = { rows: rows, rowIndex: rowIndex, cells: cells, colIndex: colIndex, currentTable: currentTable }

  if (key === 'ArrowLeft') {
    ctx.colIndex = Math.max(safeColMin, colIndex - 1)
  } else if (key === 'ArrowRight') {
    ctx.colIndex = Math.min(cells.length - 1, colIndex + 1)
  } else if (key === 'ArrowUp') {
    if (rowIndex > 0) {
      ctx.rowIndex = rowIndex - 1
    } else if (opts.findUp) {
      var upCtx = opts.findUp(ctx)
      if (!upCtx) return
      ctx = upCtx
    } else {
      return
    }
  } else if (key === 'ArrowDown') {
    if (rowIndex < rows.length - 1) {
      ctx.rowIndex = rowIndex + 1
    } else if (opts.findDown) {
      var downCtx = opts.findDown(ctx)
      if (!downCtx) return
      ctx = downCtx
    } else {
      return
    }
  }

  if (ctx.rowIndex === rowIndex && ctx.colIndex === colIndex) return

  e.preventDefault()
  var targetTr = ctx.rows[ctx.rowIndex]
  if (!targetTr) return
  var targetCells = filterCells(targetTr)
  var safeCol = Math.max(safeColMin, Math.min(ctx.colIndex, targetCells.length - 1))
  var targetTd = targetCells[safeCol]
  if (!targetTd) return

  var input = targetTd.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
  if (input) {
    input.focus()
    if (input.select) input.select()
  }
}

function filterRows(el) {
  return Array.from(el.children).filter(function (c) { return c.tagName === 'TR' })
}

function filterCells(tr) {
  return Array.from(tr.children).filter(function (c) { return c.tagName === 'TD' })
}

export { filterRows, filterCells }
