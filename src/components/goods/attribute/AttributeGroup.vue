<template>
  <!-- 属性分组管理主容器 - 添加了居中样式和高度限制 -->
  <div class="grp-config grp-container-center" style="margin-top: 2rem; height: calc(100vh - 10rem);">
    <!-- 搜索表单区域 -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="grp-search-form">
      <!-- 分类选择器 - 新增 -->
      <el-form-item>
        <el-cascader
            v-model="dataForm.cascadedCategoryId"
            :options="categories"
            :props="categoryProps"
            @change="handleCategoryChange"
            placeholder="请选择分类"
            clearable
            filterable
            class="grp-category-cascader"
        ></el-cascader>
      </el-form-item>

      <!-- 参数名搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="请输入属性分组名称" class="grp-centered-input" clearable></el-input>
      </el-form-item>

      <!-- 操作按钮组 -->
      <el-form-item>
        <el-button class="grp-action-button" type="primary" @click="getDataList()">查询</el-button>
        <el-button class="grp-action-button" type="warning" @click="resetSearchForm()">重置</el-button>
        <el-button class="grp-action-button" type="success" @click="attributeGroupAddHandle()">新增</el-button>
        <el-button class="grp-action-button" type="danger" @click="batchDeleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格容器 - 添加了居中样式和滚动功能 -->
    <div class="grp-table-container">
      <!-- 属性分组数据表格 - 添加ref引用 -->
      <el-table
          ref="dataTable"
          :data="dataList"
          border
          v-loading="dataListLoading"
          @selection-change="selectionChangeHandle"
          class="grp-data-table">
        <el-table-column
            type="selection"
            header-align="center"
            align="center"
            width="50">
        </el-table-column>
        <el-table-column
            prop="id"
            header-align="center"
            align="center"
            width="80"
            label="分组ID">
        </el-table-column>
        <el-table-column
            prop="name"
            header-align="center"
            align="center"
            width="200"
            label="分组名称">
        </el-table-column>
        <el-table-column
            prop="description"
            header-align="center"
            align="center"
            width="200"
            label="分组说明">
        </el-table-column>
        <el-table-column
            prop="sort"
            header-align="center"
            align="center"
            width="80"
            label="排序">
        </el-table-column>
        <el-table-column
            prop="categoryId"
            header-align="center"
            align="center"
            width="100"
            label="分类ID">
        </el-table-column>
        <el-table-column
            prop="createTime"
            header-align="center"
            align="center"
            width="300"
            label="创建时间">
        </el-table-column>
        <el-table-column
            prop="modifyTime"
            header-align="center"
            align="center"
            width="300"
            label="修改时间">
        </el-table-column>
        <el-table-column
            fixed="right"
            header-align="center"
            align="center"
            width="300"
            label="操作">
          <template #default="scope">
            <el-button class="grp-table-button" type="primary" size="small" @click="confirmUpdate(scope.row)">修改</el-button>
            <el-button class="grp-table-button" type="success" size="small" @click="handleRelation(scope.row)">关联</el-button>
            <el-button class="grp-table-button" type="danger" size="small" @click="confirmDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 - 移动到表格容器内，紧贴表格底部 -->
      <div class="grp-pagination-container">
        <el-pagination
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
            :current-page="pageIndex"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            :total="totalPage"
            layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>

    <!-- 弹窗, 修改 -->
    <AttributeGroupUpdate v-if="attributeGroupUpdateVisible" ref="AttributeGroupUpdate" @refreshDataList="getDataList"></AttributeGroupUpdate>

    <!-- 弹窗, 添加 -->
    <AttributeGroupAdd v-if="attributeGroupAddVisible" ref="AttributeGroupAdd" @refreshDataList="getDataList"></AttributeGroupAdd>

    <AttributeAttributeGroupRelation v-if="attributeAttributeGroupRelation" ref="attributeAttributeGroupRelation" @refreshDataList="getDataList"></AttributeAttributeGroupRelation>
  </div>
</template>

<script>
import AttributeGroupUpdate from '@/components/goods/attribute/AttributeGroupUpdate.vue'
import AttributeGroupAdd from '@/components/goods/attribute/AttributeGroupAdd.vue'
import AttributeAttributeGroupRelation from "@/components/goods/attribute/AttributeAttributeGroupRelation.vue";

export default {
  data () {
    return {
      dataForm: {
        name: '',
        categoryId: 0,
        cascadedCategoryId: [] // 级联选择器的路径数组
      },
      // 分类树数据
      categories: [],
      // 级联选择器配置
      categoryProps: {
        value: 'id',
        label: 'name',
        children: 'childrenCategories'
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      attributeGroupUpdateVisible: false,
      attributeGroupAddVisible: false, // 新增控制添加对话框显示的状态
      attributeAttributeGroupRelation: false,
      currentAttributeGroupId: 0, // 当前操作的属性分组ID
      resizeTimer: null // 添加用于防抖的定时器变量
    }
  },
  components: {
    AttributeAttributeGroupRelation,
    AttributeGroupUpdate,
    AttributeGroupAdd // 注册添加组件
  },
  created () {
    // 加载分类树数据
    this.getCategoryTree()
    // 加载表格数据
    this.getDataList()
  },
  // 添加生命周期钩子
  mounted() {
    // 窗口大小改变时重新调整表格布局
    this.handleResize = this.debounce(() => {
      if (this.$refs.dataTable) {
        this.$refs.dataTable.doLayout();
      }
    }, 200);

    window.addEventListener('resize', this.handleResize);

    // 组件加载后重新调整表格布局
    this.$nextTick(() => {
      if (this.$refs.dataTable) {
        this.$refs.dataTable.doLayout();
      }
    });
  },

  // 组件销毁前移除事件监听
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    // 在methods中添加
    /**
     * 处理属性分组关联
     * @param {Object} row - 当前行数据
     */
    handleRelation(row) {
      this.currentAttributeGroupId = row.id;
      this.attributeAttributeGroupRelation = true;
      this.$nextTick(() => {
        this.$refs.attributeAttributeGroupRelation.init(row.id);
      });
    },
    /**
     * 新增属性分组处理
     */
    attributeGroupAddHandle() {
      this.attributeGroupAddVisible = true;
      this.$nextTick(() => {
        this.$refs.AttributeGroupAdd.init();
      });
    },

    /**
     * 加载分类树数据
     */
    getCategoryTree() {
      this.$http.get('/data/snack_platform/category/tree').then((data) => {
        if (data && data.code === 200) {
          this.categories = data.data.categoriesTree;
        } else {
          this.$message.error(data?.msg || '获取分类数据失败');
        }
      }).catch(error => {
        console.error('获取分类树失败:', error);
        this.$message.error('获取分类树失败');
      });
    },

    /**
     * 处理分类选择变更
     * @param {Array} value - 选中的分类路径
     */
    handleCategoryChange(value) {
      if (value && value.length > 0) {
        // 获取最后一个选中分类作为查询条件
        this.dataForm.categoryId = value[value.length - 1];
      } else {
        // 清空分类选择时也清空分类ID
        this.dataForm.categoryId = null;
      }

      // 每次分类变更时重置分页到第一页
      this.pageIndex = 1;
    },

    /**
     * 重置搜索表单
     */
    resetSearchForm() {
      this.dataForm.name = '';
      this.dataForm.categoryId = 0;
      this.dataForm.cascadedCategoryId = [];

      // 重置后自动查询
      this.pageIndex = 1;
      this.getDataList();
    },

    /**
     * 防抖函数 - 减少频繁操作
     * @param {Function} fn - 要执行的函数
     * @param {Number} delay - 延迟时间(ms)
     */
    debounce(fn, delay) {
      return (...args) => {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
          fn.apply(this, args);
        }, delay);
      };
    },

    // 获取数据列表
    getDataList () {
      this.dataListLoading = true

      // 构建查询参数
      const params = {
        'page': this.pageIndex,
        'limit': this.pageSize,
        'name': this.dataForm.name,
        'categoryId': this.dataForm.categoryId
      };

      this.$http.get('/data/snack_platform/attributegroup/list', { params }).then((data) => {
        if (data && data.code === 200) {
          this.dataList = data.data.page.list
          this.totalPage = data.data.page.totalCount

          // 数据加载完成后重新计算表格布局
          this.$nextTick(() => {
            if (this.$refs.dataTable) {
              this.$refs.dataTable.doLayout();
            }
          });
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },

    // 每页数
    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },

    // 当前页
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },

    // 多选
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },

    /**
     * 确认是否修改属性分组
     * @param {Object} row - 当前行数据
     */
    confirmUpdate(row) {
      // 显示确认对话框，自定义确认按钮样式
      this.$confirm(`确定要修改属性分组 "${row.name}" 的信息吗?`, '修改确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'grp-custom-confirm-dialog'
      }).then(() => {
        // 用户点击确认后显示修改组件
        this.attributeGroupUpdateHandle(row.id, row.categoryId)
      }).catch(() => {
        // 用户点击取消，不执行任何操作
        this.$message({
          type: 'info',
          message: '已取消修改操作'
        })
      })
    },

    // 修改
    attributeGroupUpdateHandle (id, categoryId) {
      this.attributeGroupUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.AttributeGroupUpdate.init(id, categoryId)
      })
    },

    /**
     * 确认是否删除单个属性分组
     * @param {Object} row - 当前行数据
     */
    confirmDelete(row) {
      // 调用删除处理方法，传入属性分组ID
      this.deleteHandle(row.id, row.name)
    },

    /**
     * 确认是否批量删除属性分组
     */
    batchDeleteHandle() {
      if (this.dataListSelections.length <= 0) {
        this.$message({
          message: '请先选择要删除的属性分组',
          type: 'warning'
        })
        return
      }

      // 获取所有选中属性分组的名称列表
      const groupNames = this.dataListSelections.map(item => item.name).join('、')
      // 调用删除处理方法，不传ID表示批量删除
      this.deleteHandle(null, groupNames)
    },

    // 删除
    deleteHandle (id, names) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })

      // 显示确认对话框
      const confirmMessage = id
          ? `确定要删除属性分组 "${names}" 吗?`
          : `确定要批量删除以下属性分组吗?\n${names}`

      this.$confirm(confirmMessage, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'grp-custom-confirm-dialog'
      }).then(() => {
        // 用户确认删除，发送删除请求
        this.$http.delete('/data/snack_platform/attributegroup/delete', {data: ids}).then((data) => {
          if (data && data.code === 200) {
            // 删除成功
            this.$message({
              message: '删除操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList() // 刷新数据列表
              }
            })
          } else {
            // 删除失败
            this.$message.error(data.msg || '删除操作失败')
          }
        })
      }).catch(() => {
        // 用户取消删除
        this.$message({
          type: 'info',
          message: '已取消删除操作'
        })
      })
    }
  }
}
</script>

<style scoped>
/* 全局样式定义 - 添加了grp前缀 */
/* 主容器样式设置 */
.grp-container-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1610px; /* 设置一个最大宽度，可以根据表格实际内容调整 */
  margin: 0 auto; /* 水平居中 */
  padding: 0 1rem; /* 左右添加一些内边距 */
  height: calc(100vh - 10rem); /* 设置高度为视口高度减去页面其他部分 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 表格容器样式 - 增加滚动功能 */
.grp-table-container {
  width: 100%;
  flex: 1; /* 占用剩余空间 */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 垂直方向滚动 */
  overflow-x: auto; /* 水平方向滚动 */
}

/* 表格基本样式 - 添加固定布局和性能优化 */
.grp-data-table {
  width: auto; /* 修改为auto，使表格宽度自适应内容 */
  min-width: 80%; /* 确保表格至少占据一定宽度 */
  max-width: 100%; /* 防止表格溢出容器 */
  table-layout: fixed; /* 添加固定表格布局 */
  contain: content;    /* 添加性能优化 */
  margin: 0 auto;      /* 表格自身居中 */
}

/* 分页容器样式 - 新增 */
.grp-pagination-container {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #EBEEF5;
  border-left: 1px solid #EBEEF5;
  border-right: 1px solid #EBEEF5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  margin-bottom: 0.5rem;
}

/* 搜索表单样式：使用flexbox布局实现居中对齐 */
.grp-search-form {
  display: flex; /* 使用弹性盒子布局 */
  justify-content: center; /* 水平居中对齐表单内的元素 */
  align-items: center; /* 垂直居中对齐表单内的元素 */
  margin-bottom: 0.625rem; /* 底部外边距，与下方内容保持间距 (10px -> 0.625rem) */
  width: 100%; /* 确保搜索表单占据整个容器宽度 */
  flex-wrap: wrap; /* 允许在小屏幕上换行 */
  gap: 0.625rem; /* 表单项间距 */
}

/* 级联选择器样式 */
.grp-category-cascader {
  width: 15rem !important;
}

/* 输入框中的占位文本居中显示 */
.grp-centered-input input::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 输入框中的实际输入文本居中显示 */
.grp-centered-input input {
  text-align: center; /* 使用户输入的文字也居中显示 */
  width: 15rem; /* 输入框宽度 */
  height: 2rem; /* 输入框高度 */
}

/* 下拉框样式保持与输入框一致 */
.grp-selected-input {
  width: 15rem; /* 下拉框宽度 */
  height: 2rem; /* 下拉框高度 */
}

/* 下拉框占位文本居中显示 */
.grp-selected-input .el-input__inner::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 下拉框文本居中显示 - 包括选中的值 */
.grp-selected-input .el-input__inner {
  text-align: center; /* 使选中的值居中显示 */
}

/* 下拉选项居中显示 */
.grp-el-select-dropdown__item {
  text-align: center; /* 下拉选项文字居中显示 */
}

/* 搜索和批量删除按钮 */
.grp-action-button {
  width: 7rem !important;
  height: 2rem !important;
  font-size: 0.875rem; /* 按钮文字大小 (14px -> 0.875rem) */
  margin: 0 0.3125rem; /* 按钮之间的间距 */
}

/* 表格内操作按钮样式 */
.grp-table-button {
  width: 5rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
}

/* 分页控件样式 */
.grp-el-pagination {
  font-size: 0.875rem; /* 文字大小 (14px -> 0.875rem) */
}

/* 自定义确认对话框样式 */
.grp-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  margin: 0 0.625rem;
}

/* 确保对话框内容居中 */
.grp-custom-confirm-dialog .el-message-box__btns {
  display: flex;
  justify-content: center;
}

/* 确保表格在小屏幕设备上可以水平滚动 */
@media screen and (max-width: 768px) {
  .grp-data-table {
    overflow-x: auto;
    contain: content;
    min-width: 100%; /* 在小屏幕上确保表格占据整个容器宽度 */
  }

  /* 在小屏幕上缩小按钮尺寸 */
  .grp-table-button {
    width: 4rem !important;
    height: 1.8rem !important;
    font-size: 0.8rem;
  }

  /* 小屏幕上的表单元素调整 */
  .grp-centered-input input,
  .grp-selected-input,
  .grp-category-cascader {
    width: 12rem !important;
  }

  .grp-action-button {
    width: 5.5rem !important;
    margin: 0 0.15rem;
  }

  /* 在小屏幕设备上调整容器最大宽度 */
  .grp-container-center {
    max-width: 100%;
    padding: 0 0.5rem;
  }

  /* 搜索表单在小屏幕上调整 */
  .grp-search-form {
    padding: 0.3125rem;
  }

  /* 确保表单项在小屏幕上有足够空间 */
  .grp-search-form .el-form-item {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 576px) {
  .grp-search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .grp-search-form .el-form-item {
    margin: 0 0 0.5rem 0;
    width: 100%;
  }

  .grp-centered-input input,
  .grp-selected-input,
  .grp-category-cascader {
    width: 100% !important;
  }

  .grp-action-button {
    width: 100% !important;
    margin: 0.25rem 0;
  }
}

/* 全局设置确认对话框按钮样式 */
body .el-message-box__btns .el-button {
  width: 8rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 调整确认对话框按钮间距 */
body .el-message-box__btns .el-button + .el-button {
  margin-left: 0.625rem;
}
</style>