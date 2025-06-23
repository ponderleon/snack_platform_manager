<!--
 @Author: leon--ZGJ
 @Create: 2025/1/9 20:30
 @Version: 1.0
 Description:
-->
<template>
  <div class="manager-head">
    <div class="title-container">
      <span class="title">零食管理系统-管理页面</span>
      <span class="separator">|</span>
      <span  class="welcome">欢迎，来到管理控制台</span>
    </div>
    <div class="button-container">
      <button @click="logout" class="logout-button">
        <i class="logout-icon"></i>
        退出登录
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ManagerHead",

  methods: {
    logout() {
      // 清除本地存储的登录信息
      this.$store.dispatch('loginOut')

      // 跳转到登录页面
      this.$router.push('/');

    }
  }
}
</script>

<style scoped>
.manager-head {
  padding: 0;
  margin: 0;
  height: 10vh; /* 占满整个视口高度的 10% */
  width: 100vw; /* 占满整个视口宽度 */
  background-color: rgba(247, 238, 214, 0.8); /* 表单背景色，带透明度 */
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 两端对齐，标题靠左，按钮靠右 */
}

.title-container {
  display: flex;
  align-items: center;
  padding-left: 1.5rem; /* 调整左边距 */
}

.title {
  font-family: 'Pacifico', cursive; /* 使用 Pacifico 字体 */
  font-size: 2.25rem; /* 字体大小 */
  color: black; /* 字体颜色 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 文字阴影 */
  margin-right: 1rem; /* 标题与分隔符之间的间距 */
}

.separator {
  font-size: 2rem; /* 分隔符大小 */
  font-weight: 300; /* 调整分隔符粗细 */
  color: #555; /* 分隔符颜色 */
  margin: 0 1rem; /* 分隔符两边均等的空格 */
  align-self: center; /* 垂直居中 */
}

.welcome {
  font-family: 'Pacifico', cursive; /* 与标题保持一致的字体 */
  font-size: 1.5rem; /* 相对于标题稍小的字体大小 */
  color: black; /* 字体颜色 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3); /* 相对于标题稍淡的文字阴影 */
  margin-left: 1rem; /* 分隔符与欢迎文字之间的间距 */
}

.button-container {
  margin-right: 2rem; /* 按钮右侧间距 */
}

.logout-button {
  background-color: #ff6b6b; /* 退出按钮背景色 */
  color: white; /* 文字颜色 */
  border: none;
  border-radius: 4px; /* 圆角 */
  padding: 0.5rem 1rem; /* 内边距 */
  font-size: 1rem; /* 字体大小 */
  cursor: pointer; /* 鼠标指针样式 */
  display: flex;
  align-items: center;
  transition: background-color 0.3s; /* 过渡效果 */
}

.logout-button:hover {
  background-color: #ff5252; /* 悬停时的背景色 */
}

.logout-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}
</style>