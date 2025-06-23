<!--
 @Author: leon--ZGJ
 @Create: 2025/1/9 20:58
 @Version: 1.0
 Description:
-->
<template>
  <div class="manager-navigation">
    <el-menu
        active-text-color="#fffff"
        background-color="#E1C699"
        text-color="#5F3C1E"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
    >
      <el-sub-menu index="1">
        <template #title>
          <el-icon>
            <location/>
          </el-icon>
          <span>账号管理</span>
        </template>


        <el-menu-item>
          <template #title>
            <el-icon>
              <location/>
            </el-icon>
            <nav>
              <router-link :to="{name:'UpdatePassword'}" class="router-link">
                <span>修改密码</span>
              </router-link>
            </nav>
          </template>
        </el-menu-item>

        <el-menu-item>
          <template #title>
            <el-icon>
              <location/>
            </el-icon>
            <nav>
              <!--              :to="{ name: 'UpdatePermissionCode' }"-->
              <router-link :to="{ name: 'UpdatePermissionCode' }" class="router-link">
                <span>修改权限码</span>
              </router-link>
            </nav>
          </template>
        </el-menu-item>

      </el-sub-menu>


      <el-sub-menu index="2">
        <template #title>
          <el-icon>
            <location/>
          </el-icon>
          <span>用户管理</span>
        </template>

        <el-menu-item index="2-1">
          <el-icon>
            <icon-menu/>
          </el-icon>
          <nav>
            <router-link :to="{ name: 'ManagerMerchant'}" class="router-link">
              <span>商家</span>
            </router-link>
          </nav>

        </el-menu-item>
        <el-menu-item index="2-2">
          <el-icon>
            <icon-menu/>
          </el-icon>
          <nav>
            <router-link :to="{ name: 'ManagerUser', query: { delivery: 1 }  }" class="router-link">
              <span>配送员</span>
            </router-link>
          </nav>
        </el-menu-item>
        <el-menu-item index="2-3">
          <el-icon>
            <icon-menu/>
          </el-icon>
          <nav>
            <router-link :to="{ name: 'ManagerUser', query: { delivery: 0 } }" class="router-link">
              <span>普通用户</span>
            </router-link>
          </nav>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <el-icon>
            <location/>
          </el-icon>
          <span>产品管理</span>
        </template>

<!--        <el-menu-item index="3-1">-->
<!--          <el-icon>-->
<!--            <icon-menu/>-->
<!--          </el-icon>-->
<!--          <nav>-->
<!--            <router-link :to="{ name: 'GoodsEnterView' }" class="router-link">-->
<!--              <span>添加产品</span>-->
<!--            </router-link>-->
<!--          </nav>-->
<!--        </el-menu-item>-->

        <el-sub-menu index="3-2">
          <template #title>
            <el-icon>
              <location/>
            </el-icon>
            <span>产品</span>
          </template>
          <el-menu-item index="3-2-1">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <nav>
              <router-link :to="{ name: 'SpuInfo', query: { publicStatus: 0 } }" class="router-link">
                <span>新建产品</span>
              </router-link>
            </nav>

          </el-menu-item>
          <el-menu-item index="3-2-2">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <nav>
              <router-link :to="{ name: 'SpuInfo', query: { publicStatus: 1 } }" class="router-link">
                <span>上架产品</span>
              </router-link>
            </nav>

          </el-menu-item>
          <el-menu-item index="3-2-3">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <nav>
              <router-link :to="{ name: 'SpuInfo', query: { publicStatus: 2 } }" class="router-link">
                <span>下架产品</span>
              </router-link>
            </nav>

          </el-menu-item>
        </el-sub-menu>
      </el-sub-menu>

      <el-sub-menu index="4">
        <template #title>
          <el-icon>
            <location/>
          </el-icon>
          <span>商品管理</span>
        </template>

        <el-menu-item index="4-1">
          <el-icon>
            <icon-menu/>
          </el-icon>
          <nav>
            <router-link :to="{ name: 'SkuInfo' }" class="router-link">
              <span>商品</span>
            </router-link>
          </nav>
        </el-menu-item>

      </el-sub-menu>

      <el-sub-menu index="5">
        <template #title>
          <el-icon>
            <location/>
          </el-icon>
          <span>商品信息管理</span>
        </template>


        <el-menu-item index="5-1">
          <el-icon>
            <icon-menu/>
          </el-icon>
          <nav>
            <router-link :to="{ name: 'AttributeGroup' }" class="router-link">
              <span>商品信息组</span>
            </router-link>
          </nav>
        </el-menu-item>
        <el-sub-menu index="5-2">
          <template #title>
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>商品信息</span>
          </template>
          <el-menu-item index="5-2-1">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <nav>
              <router-link :to="{ name: 'Attribute', query: { type: 0 } }" class="router-link">
                <span>基本信息</span>
              </router-link>
            </nav>

          </el-menu-item>

          <el-menu-item index="5-2-2">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <nav>
              <router-link :to="{ name: 'Attribute', query: { type: 1 } }" class="router-link">
                <span>销售信息</span>
              </router-link>
            </nav>

          </el-menu-item>

        </el-sub-menu>
        <el-menu-item index="5-3">
          <el-icon>
            <icon-menu/>
          </el-icon>
          <nav>
            <router-link :to="{ name: 'Brand' }" class="router-link">
              <span>品牌管理</span>
            </router-link>
          </nav>
        </el-menu-item>

        <el-menu-item index="5-4">
          <el-icon>
            <icon-menu/>
          </el-icon>
          <nav>
            <router-link :to="{ name: 'CategoryManager' }" class="router-link">
              <span>分类管理</span>
            </router-link>
          </nav>
        </el-menu-item>
      </el-sub-menu>


      <el-sub-menu index="6">
        <template #title>
          <el-icon>
            <location/>
          </el-icon>
          <span>订单管理</span>
        </template>

        <el-menu-item index="6-1">
          <template #title>
            <el-icon>
              <location/>
            </el-icon>
            <nav>
              <router-link :to="{ name: 'Order',query: { status: 0 } }" class="router-link">
                <span>待发货订单</span>
              </router-link>
            </nav>
          </template>
        </el-menu-item>
        <el-menu-item index="6-2">
          <template #title>
            <el-icon>
              <location/>
            </el-icon>
            <nav>
              <router-link :to="{ name: 'Order' ,query: { status: 1 }}" class="router-link">
                <span>待收货订单</span>
              </router-link>
            </nav>
          </template>
        </el-menu-item>
        <el-menu-item index="6-3">
          <template #title>
            <el-icon>
              <location/>
            </el-icon>
            <nav>
              <router-link :to="{ name: 'Order' ,query: { status: 2 }}" class="router-link">
                <span>完成订单</span>
              </router-link>
            </nav>
          </template>
        </el-menu-item>
      </el-sub-menu>

    </el-menu>
  </div>
</template>

<script>
export default {
  name: "ManagerNavigation",
}
</script>

<style scoped>
/* 导航栏样式 */
.manager-navigation {
  height: calc(100vh - 10vh); /* 减去头部高度 */
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
}

/* 菜单样式 */
.el-menu {
  flex-grow: 1; /* 导航栏占满剩余空间 */
  overflow-y: auto; /* 垂直滚动条 */
}

/* 自定义 router-link 样式 */
.router-link {
  text-decoration: none; /* 移除下划线 */
  color: inherit; /* 继承父元素颜色 */
}

/* 自定义 router-link 鼠标悬停样式 */
.router-link:hover {
  color: inherit; /* 悬停时保持颜色不变 */
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 0.25rem; /* 滚动条宽度 */
  height: 0.5rem; /* 滚动条高度（水平滚动条） */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景色 */
  border-radius: 0.25rem; /* 圆角 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #f1f1f1; /* 滑块背景色 */
  border-radius: 0.25rem; /* 圆角 */
}

/* 滚动条滑块悬停效果 */
::-webkit-scrollbar-thumb:hover {
  background: #555; /* 悬停时滑块背景色 */
}

/* 响应式设计：小屏幕调整 */
@media (max-width: 768px) {
  .manager-navigation {
    height: auto; /* 小屏幕下高度自适应 */
  }

  .el-menu {
    width: 100%; /* 小屏幕下占满宽度 */
  }
}
</style>