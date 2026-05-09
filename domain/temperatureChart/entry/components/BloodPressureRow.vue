<template>
  <div class="bp-row">
    <span class="bp-label">上午</span>
    <div class="bp-group" :class="{ 'bp-error': amError }">
      <el-input :value="amSystolic" size="mini" placeholder="收缩压" style="width:70px" @input="handleAmSystolic" />
      <span>/</span>
      <el-input :value="amDiastolic" size="mini" placeholder="舒张压" style="width:70px" @input="handleAmDiastolic" />
    </div>
    <span class="bp-label">下午</span>
    <div class="bp-group" :class="{ 'bp-error': pmError }">
      <el-input :value="pmSystolic" size="mini" placeholder="收缩压" style="width:70px" @input="handlePmSystolic" />
      <span>/</span>
      <el-input :value="pmDiastolic" size="mini" placeholder="舒张压" style="width:70px" @input="handlePmDiastolic" />
    </div>
    <div v-if="amError || pmError" class="bp-alert">{{ amError || pmError }}</div>
  </div>
</template>

<script>
export default {
  name: 'BloodPressureRow',
  props: {
    value: { type: Object, default: function () { return { am: {}, pm: {} } } }
  },
  data: function () {
    var v = this.value || {}
    return {
      amSystolic: v.am ? v.am.systolic || '' : '',
      amDiastolic: v.am ? v.am.diastolic || '' : '',
      pmSystolic: v.pm ? v.pm.systolic || '' : '',
      pmDiastolic: v.pm ? v.pm.diastolic || '' : ''
    }
  },
  computed: {
    amError: function () {
      return this.validatePair(this.amSystolic, this.amDiastolic)
    },
    pmError: function () {
      return this.validatePair(this.pmSystolic, this.pmDiastolic)
    }
  },
  watch: {
    value: {
      deep: true,
      handler: function (val) {
        this.amSystolic = val && val.am ? val.am.systolic || '' : ''
        this.amDiastolic = val && val.am ? val.am.diastolic || '' : ''
        this.pmSystolic = val && val.pm ? val.pm.systolic || '' : ''
        this.pmDiastolic = val && val.pm ? val.pm.diastolic || '' : ''
      }
    }
  },
  methods: {
    validatePair: function (sys, dia) {
      var s = parseFloat(sys)
      var d = parseFloat(dia)
      if (isNaN(s) && isNaN(d)) return ''
      if (!isNaN(s) && (s < 60 || s > 260)) return '收缩压超出范围(60~260)'
      if (!isNaN(d) && (d < 30 || d > 150)) return '舒张压超出范围(30~150)'
      if (!isNaN(s) && !isNaN(d) && s <= d) return '收缩压应大于舒张压'
      return ''
    },
    handleAmSystolic: function (val) { this.amSystolic = val; this.emitChange() },
    handleAmDiastolic: function (val) { this.amDiastolic = val; this.emitChange() },
    handlePmSystolic: function (val) { this.pmSystolic = val; this.emitChange() },
    handlePmDiastolic: function (val) { this.pmDiastolic = val; this.emitChange() },
    emitChange: function () {
      this.$emit('input', {
        am: { systolic: this.amSystolic, diastolic: this.amDiastolic },
        pm: { systolic: this.pmSystolic, diastolic: this.pmDiastolic }
      })
      this.$emit('change')
    }
  }
}
</script>

<style lang="less" scoped>
.bp-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.bp-label {
  margin: 0 4px;
  color: #909399;
  font-size: 12px;
}
.bp-group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  &.bp-error {
    /deep/ .el-input__inner {
      border-color: #f56c6c;
    }
  }
}
.bp-alert {
  width: 100%;
  font-size: 11px;
  color: #f56c6c;
  margin-top: 2px;
}
</style>
