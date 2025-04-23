<!--
 @Author: leon--ZGJ
 @Create: 2025/1/9 20:28
 @Version: 1.0
 Description:
-->
<template>
    <div class="manager-controller">
      <el-row :gutter="1">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <ManagerHead></ManagerHead>
        </el-col>
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
          <ManagerNavigation></ManagerNavigation>
        </el-col>
        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="21">
          <router-view></router-view>
        </el-col>
      </el-row>
    </div>
</template>

<script>
import ManagerHead from "@/components/manager/ManagerHead.vue";
import ManagerNavigation from "@/components/manager/ManagerNavigation.vue";

export default {
  name: "ManagerControllerView",
  components:{
    ManagerHead,
    ManagerNavigation
  },
}
</script>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden; /* 防止滚动条 */
  font-size: 16px; /* 设置根元素字体大小 */
}
</style>