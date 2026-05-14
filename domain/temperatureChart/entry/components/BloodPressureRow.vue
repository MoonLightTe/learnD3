<template>
  <div class="bp-row">
    <div class="bp-pair" :class="{ 'bp-error': amError }">
      <span class="bp-label">上午</span>
      <input class="bp-input" :value="amSystolic" placeholder="收缩压" @input="handleAmSystolic" />
      <span class="bp-slash">/</span>
      <input class="bp-input" :value="amDiastolic" placeholder="舒张压" @input="handleAmDiastolic" />
      <span class="bp-unit">mmHg</span>
    </div>
    <div class="bp-pair" :class="{ 'bp-error': pmError }">
      <span class="bp-label">下午</span>
      <input class="bp-input" :value="pmSystolic" placeholder="收缩压" @input="handlePmSystolic" />
      <span class="bp-slash">/</span>
      <input class="bp-input" :value="pmDiastolic" placeholder="舒张压" @input="handlePmDiastolic" />
      <span class="bp-unit">mmHg</span>
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
    handleAmSystolic: function (e) { this.amSystolic = e.target.value; this.emitChange() },
    handleAmDiastolic: function (e) { this.amDiastolic = e.target.value; this.emitChange() },
    handlePmSystolic: function (e) { this.pmSystolic = e.target.value; this.emitChange() },
    handlePmDiastolic: function (e) { this.pmDiastolic = e.target.value; this.emitChange() },
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
  gap: 12px;
  flex-wrap: wrap;
}
.bp-pair {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 2px 6px;
  transition: background 0.15s, border-color 0.15s;
  &:focus-within {
    background: #fff;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
  }
  &.bp-error {
    border-color: #f56c6c;
    background: #fef2f2;
  }
}
.bp-label {
  font-size: 11px;
  color: #999;
  flex-shrink: 0;
}
.bp-input {
  width: 46px;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 13px;
  outline: none;
  padding: 3px 2px;
  &::placeholder { color: #ccc; font-size: 11px; }
}
.bp-slash {
  color: #999;
  font-size: 13px;
}
.bp-unit {
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
}
.bp-alert {
  width: 100%;
  font-size: 11px;
  color: #f56c6c;
  margin-top: 2px;
}
</style>
