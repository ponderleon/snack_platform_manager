<!--
 @Author: leon--ZGJ
 @Create: 2025/1/12 21:54
 @Version: 1.0
 Description:
-->
<template>
  <!--  商品分类管理页面 -->
  <div class="goods-and-categories-tree">
    <el-row>
      <el-col :xs="24" :sm="8" :md="6" :lg="5" :xl="4" class="category-tree">
        <el-tree
            class="category-tree-container"
            :data="categories"
            :props="categoriesProps"
            show-checkbox
            node-key="id"
            :expand-on-click-node="false"
        >
          <template #default="{ node, data }">
            <!--  自定义节点标签 -->
            <span class="category-tree-node">
              <span class="node-label">{{ node.label }}</span>
              <!--  按钮组 -->
                <span class="category-tree-button-group">
                  <el-button v-if="node.level <= 2" class="category-tree-button-group-add" type="text" size="mini"
                             @click="handleAdd(data,node)">添加</el-button>
                  <el-button v-if="node.childNodes.length === 0" type="text" size="mini"
                             @click="handleDelete(data)">删除</el-button>
                  <el-button type="text" size="mini" @click="handleEdit(data)">编辑</el-button>
                </span>
            </span>
          </template>
        </el-tree>
      </el-col>
      <!--数据区域 -->
      <el-col :xs="24" :sm="16" :md="18" :lg="19" :xl="20" class="spu-list">
        <div class="spu-list-table-container">

          <div class="spu-list-table-header">
            <!--搜索区域 -->
            <el-input class="spu-list-table-header-search"  v-model="search" size="small" placeholder="请输入查询条件"/>
            <!--按钮组 -->
            <el-button class="spu-list-table-header-button" type="primary" size="small" @click="selectSpu">查询</el-button>
          </div>


          <!--spu商品列表 -->
          <el-table :data="spuDataList" style="width: 100%" class="spu-list-table">
            <el-table-column fixed prop="id" label="商品ID" width="100"/>
            <el-table-column prop="spuName" label="商品名称" width="180"/>
            <el-table-column prop="merchantUserName" label="所属商家" width="180"/>
            <el-table-column prop="categoryId" label="所属分类" width="180"/>
            <el-table-column prop="brandId" label="所属品牌" width="180"/>
            <el-table-column prop="publicStatus" label="上架状态" width="180"/>
            <el-table-column prop="createTime" label="创建时间" width="180"/>
            <el-table-column prop="modifyTime" label="修改时间" width="180"/>
            <el-table-column fixed="right" label="操作" min-width="120">
              <template #default>
                <div class="spu-table-button-group">
                  <el-button link type="primary" size="small">
                    修改
                  </el-button>
                  <el-button link type="primary" size="small">查看</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!--分页区域 -->
        <div class="spu-list-pagination">
          <el-pagination

              @size-change="sizeChangeHandle"
              @current-change="currentChangeHandle"
              :current-page="currentPage"
              :page-sizes="[5, 10, 15, 20]"
              :page-size="pageSize"
              :total="totalPage"
              layout="total, sizes, prev, pager, next, jumper"
          ></el-pagination>
        </div>
      </el-col>


    </el-row>
  </div>
</template>

<script>
export default {
  name: 'GoodsAndCategoriesTree',
  data() {
    return {
      categories: [], // 分类树形数据
      categoriesProps: {
        label: 'name', // 节点标签字段名
        children: 'childrenCategories' // 子节点字段名
      },
      totalPage: 100, // 总页数
      currentPage: 1, // 当前页数
      pageSize: 10, // 每页显示条数
      spuDataList: [
        {
          id: 1,
          spuName: 'SPU商品展示',
          merchantUserName: '商家',
          categoryId: '分类',
          brandId: '品牌',
          publicStatus: '发布状态',
          createTime: new Date(),
          modifyTime: new Date(),
        },
        {
          id: 1,
          spuName: 'SPU商品展示',
          merchantUserName: '商家',
          categoryId: '分类',
          brandId: '品牌',
          publicStatus: '发布状态',
          createTime: new Date(),
          modifyTime: new Date(),
        },
        {
          id: 1,
          spuName: 'SPU商品展示',
          merchantUserName: '商家',
          categoryId: '分类',
          brandId: '品牌',
          publicStatus: '发布状态',
          createTime: new Date(),
          modifyTime: new Date(),
        },
        {
          id: 1,
          spuName: 'SPU商品展示',
          merchantUserName: '商家',
          categoryId: '分类',
          brandId: '品牌',
          publicStatus: '发布状态',
          createTime: new Date(),
          modifyTime: new Date(),
        },
        {
          id: 1,
          spuName: 'SPU商品展示',
          merchantUserName: '商家',
          categoryId: '分类',
          brandId: '品牌',
          publicStatus: '发布状态',
          createTime: new Date(),
          modifyTime: new Date(),
        },
        {
          id: 1,
          spuName: 'SPU商品展示',
          merchantUserName: '商家',
          categoryId: '分类',
          brandId: '品牌',
          publicStatus: '发布状态',
          createTime: new Date(),
          modifyTime: new Date(),
        },
      ] // 商品列表数据
    }
  },
  created() {
    this.getCategoriesTreeData()
  },
  methods: {
    // 获取分类树形数据
    getCategoriesTreeData() {
      this.$http.get('/data/category/tree').then(result => {

        // console.log("================",result.data.categoriesTree)
        // 判断是否有查询到分类数据
        if (result.data.categoriesTree.length > 0) {
          // 将查询到的分类数据赋值给categories
          this.categories = result.data.categoriesTree
        } else {
          // 如果没有查询到分类数据，则提示用户
          this.$message({
            type: "error",
            message: "没有查询到分类数据！"
          })
        }

      }).catch(error => {
        console.log(error)
      })
    },
    // 处理分类树形数据的添加
    handleAdd(data, node) {
      console.log("添加分类=======", node)
    },
    // 处理分类树形数据的删除
    handleDelete(data) {

    },
    // 处理分类树形数据的编辑
    handleEdit(data) {

    },
    currentChangeHandle(currentPage) {
      console.log("当前页数=======", currentPage)
    },
    sizeChangeHandle(pageSize) {
      console.log("每页显示条数=======", pageSize)
    }
  }

}
</script>

<style>
/* 整体样式 */
.goods-and-categories-tree {
  height: calc(100vh - 10vh); /* 减去头部高度 */
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
}


/* 自定义分类树形控件样式 */
.el-tree {
  flex: 1; /* 占满父容剩余空间 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
}

/* 自定义分类树形控件节点标签样式 */
.category-tree-container .node-label {
  font-size: 1rem; /* 节点标签字体大小 */
}

/* el-row布局树形控件区域样式 */
.category-tree {
  background-color: rgba(247, 238, 214, 0.8); /* 背景色 */
  height: calc(100vh - 10vh); /* 占满父容器高度 */
  display: flex; /* 子元素水平排列 */
  flex-direction: column; /* 子元素垂直排列 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 自定义树形控件节点样式 */
.category-tree-node {
  flex: 1; /* 占满父容剩余空间 */
  display: flex; /* 子元素水平排列 */
  align-items: center; /* 子元素垂直居中 */
}

/* 自定义树形控件按钮组样式 */
.category-tree-button-group {
  display: flex; /* 子元素水平排列 */
  align-items: center;
  gap: 0.5rem; /* 按钮之间的间距 */
  margin-left: 0.9rem; /* 按钮组与节点标签的间距 */
}

/* 自定义树形控件按钮组添加按钮样式 */
.category-tree-button-group .el-button {
  padding: 0; /* 调整按钮内边距 */
  margin: 0; /* 去掉按钮默认的外边距 */
  font-size: 1rem; /* 调整按钮字体大小 */
  width: 2rem; /* 调整按钮宽度 */
  white-space: nowrap; /* 防止按钮文字换行 */
}

/* 搜索区域容器样式 */
.spu-list-table-header {
  display: flex; /* 启用 Flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  gap: 0.5rem; /* 输入框和按钮之间的间距 */
  height: 5rem; /* 高度 */
}

/* 搜索区域，输入框样式 */
.spu-list-table-header-search {
  width: 20rem; /* 宽度 */
  height: 4vh; /* 高度 */
}
/* 搜索区域，按钮样式 */
.spu-list-table-header-button{
  width: 5rem; /* 宽度 */
  height: 4vh; /* 高度 */
  font-size: 1rem; /* 字体大小 */
}


/* 数据区域样式 */
.spu-list {
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
  height: calc(100vh - 10vh); /* 占满父容器高度 */
}

/* 表格容器样式 */
.spu-list-table-container {
  height: calc(100vh - 25vh); /* 根据实际需求调整高度 */
  overflow-y: auto; /* 启用垂直滚动条 */
}


/* spu商品列表按钮组按钮样式 */
.spu-table-button-group .el-button {
  padding: 0; /* 调整按钮内边距 */
  margin: 0.5rem; /* 去掉按钮默认的外边距 */
  font-size: 1rem; /* 调整按钮字体大小 */
  width: 2rem; /* 调整按钮宽度 */
  white-space: nowrap; /* 防止按钮文字换行 */
}

/* spu商品列表区域分页组件样式 */
.spu-list-pagination {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  margin-top: 1.25rem; /* 上边距 */
  margin-bottom: 1.25rem; /* 下边距 */
}

/* 表格头部居中 */
.spu-list-table th.el-table__cell {
  text-align: center !important;
}

/* 表格内容居中 */
.spu-list-table td.el-table__cell {
  text-align: center !important;
}


/* 响应式布局调整 */
@media (max-width: 48rem) {
  /* 768px -> 48rem */
  .category-tree, .spu-list {
    width: 100% !important; /* 在小屏幕下占满整行 */
  }

  /* 768px -> 48rem */
  .spu-list-table-container {
    height: calc(100vh - 25rem); /* 在小屏幕下调整高度 */
  }
}
</style>