<template>
  <div class="stool-inline-row">
    <div class="stool-fields">
      <label>自行</label>
      <input
        class="stool-input"
        :value="form.selfCount"
        type="number"
        min="0"
        max="99"
        placeholder="0"
        @input="onInput('selfCount', $event)"
      />
      <label>灌肠</label>
      <input
        class="stool-input"
        :value="form.enemaCount"
        type="number"
        min="0"
        max="99"
        placeholder="0"
        @input="onInput('enemaCount', $event)"
      />
      <label>灌后</label>
      <input
        class="stool-input"
        :class="{ disabled: form.enemaCount === 0 }"
        :value="form.enemaStoolCount"
        type="number"
        min="0"
        max="99"
        placeholder="0"
        :disabled="form.enemaCount === 0"
        @input="onInput('enemaStoolCount', $event)"
      />
      <select class="stool-select" :value="form.specialStatus" @change="onSelect($event)">
        <option value="">无</option>
        <option value="☆">人工肛门</option>
        <option value="※">大便失禁</option>
      </select>
    </div>
    <span v-if="previewValue" class="stool-preview">{{ previewValue }}</span>
  </div>
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

  return selfCount > 0 ? String(selfCount) : ''
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
  name: 'StoolInlineRow',
  props: {
    formData: Object,
    rowConfig: Object
  },
  data: function () {
    return {
      form: { selfCount: 0, enemaCount: 0, enemaStoolCount: 0, specialStatus: '' }
    }
  },
  computed: {
    rawValue: function () {
      var np = this.formData && this.formData.nonTimepoint
      var field = np && np[this.rowConfig.key]
      return field && field.rawValue ? field.rawValue : ''
    },
    previewValue: function () {
      return assembleStoolValue(this.form)
    }
  },
  watch: {
    rawValue: {
      immediate: true,
      handler: function (val) {
        this.form = parseStoolValue(val)
      }
    }
  },
  methods: {
    onInput: function (field, e) {
      var val = parseInt(e.target.value) || 0
      if (val < 0) val = 0
      if (val > 99) val = 99
      this.form[field] = val
      this.emitChange()
    },
    onSelect: function (e) {
      this.form.specialStatus = e.target.value
      this.emitChange()
    },
    emitChange: function () {
      var val = assembleStoolValue(this.form)
      this.$set(this.formData.nonTimepoint, this.rowConfig.key, { rawValue: val })
      this.$emit('change')
    }
  }
}
</script>

<style scoped>
.stool-inline-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.stool-fields {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #666;
}
.stool-fields label {
  flex-shrink: 0;
  color: #999;
  font-size: 10px;
}
.stool-input {
  width: 36px;
  padding: 3px 4px;
  border: 1px solid transparent;
  border-radius: 3px;
  text-align: center;
  font-size: 12px;
  background: transparent;
  outline: none;
}
.stool-input:focus {
  background: #fff;
  border-color: #1a73e8;
}
.stool-input.disabled {
  opacity: 0.4;
}
.stool-input::-webkit-inner-spin-button,
.stool-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.stool-select {
  width: 72px;
  padding: 3px 4px;
  border: 1px solid transparent;
  border-radius: 3px;
  font-size: 11px;
  background: transparent;
  outline: none;
  cursor: pointer;
}
.stool-select:focus {
  background: #fff;
  border-color: #1a73e8;
}
.stool-preview {
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
</style>
