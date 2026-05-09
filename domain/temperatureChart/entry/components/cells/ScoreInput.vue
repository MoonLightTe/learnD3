<template>
  <div class="score-input">
    <span class="score-placeholder">评分组件（待定义）</span>
  </div>
</template>

<script>
export default {
  name: 'ScoreInput',
  props: {
    formData: Object,
    rowConfig: Object
  }
}
</script>

<style scoped>
.score-placeholder {
  color: #c0c4cc;
  font-size: 12px;
  font-style: italic;
}
</style>
