<!--
 @Author: leon--ZGJ
 @Create: 2025/1/9 20:30
 @Version: 1.0
 Description:
-->
<template>
  <div class="manager-head">
    <span class="title">零食管理系统-管理页面</span>
  </div>
</template>

<script>
export default {
  name: "ManagerHead",
}

</script>

<style>


.manager-head {
  padding: 0;
  margin: 0;
  height: 10vh; /* 占满整个视口高度的 10% */
  width: 100vw; /* 占满整个视口宽度 */
  background-color: rgba(247, 238, 214, 0.8); /* 表单背景色，带透明度 */
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
}
.title {
  font-family: 'Pacifico', cursive; /* 使用 Pacifico 字体 */
  font-size: 2.25rem;; /* 字体大小 */
  color: black; /* 字体颜色 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 文字阴影 */
  text-align: left; /* 文字靠左 */
  padding-left: 1.5rem; /* 调整左边距，使文字在视觉上居中*/
}

</style>