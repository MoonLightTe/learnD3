<template>
  <div class="stool-cell clickable-cell" @click="dialogVisible = true">
    <span v-if="rawValue" class="np-value">{{ rawValue }}</span>
    <span v-else class="empty-cell">点击录入</span>
    <stool-dialog
      :visible.sync="dialogVisible"
      :value="rawValue"
      @confirm="onConfirm"
    />
  </div>
</template>

<script>
import StoolDialog from '../StoolDialog.vue'

export default {
  name: 'StoolCell',
  components: { StoolDialog },
  props: {
    formData: Object,
    rowConfig: Object
  },
  data: function () {
    return { dialogVisible: false }
  },
  computed: {
    rawValue: function () {
      var np = this.formData && this.formData.nonTimepoint
      var field = np && np[this.rowConfig.key]
      return field && field.rawValue ? field.rawValue : ''
    }
  },
  methods: {
    onConfirm: function (val) {
      this.$set(this.formData.nonTimepoint, this.rowConfig.key, { rawValue: val })
      this.$emit('change')
    }
  }
}
</script>

<style scoped>
.stool-cell { padding: 6px 4px; }
.clickable-cell { cursor: pointer; }
.clickable-cell:hover { background: #f0f7ff; }
.np-value { font-size: 13px; font-weight: 500; color: #333; }
.empty-cell { color: #c0c4cc; font-size: 12px; }
</style>
