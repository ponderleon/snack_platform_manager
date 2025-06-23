<template>
  <!-- 属性管理主容器 - 添加了居中样式和高度限制 -->
  <div class="attr-config attr-container-center" style="margin-top: 2rem; height: calc(100vh - 10rem);">
    <!-- 搜索表单区域 -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="attr-search-form">
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
            class="attr-category-cascader"
        ></el-cascader>
      </el-form-item>

      <!-- 属性名搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="请输入属性名称" class="attr-centered-input" clearable></el-input>
      </el-form-item>

      <!-- 是否启用搜索选择框 - 新增 -->
      <el-form-item>
        <el-select v-model="dataForm.isUse" placeholder="是否启用" clearable class="attr-selected-input">
          <el-option label="已启用" :value="1"></el-option>
          <el-option label="未启用" :value="0"></el-option>
        </el-select>
      </el-form-item>

      <!-- 操作按钮组 -->
      <el-form-item>
        <el-button class="attr-action-button" type="primary" @click="getDataList()">查询</el-button>
        <el-button class="attr-action-button" type="warning" @click="resetSearchForm()">重置</el-button>
        <el-button class="attr-action-button" type="success" @click="attributeAddHandle()">新增</el-button>
        <el-button class="attr-action-button" type="danger" @click="batchDeleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格容器 - 添加了占满宽度的样式和滚动功能 -->
    <div class="attr-table-container">
      <!-- 属性数据表格 - 添加ref引用 -->
      <el-table
          ref="dataTable"
          :data="dataList"
          border
          v-loading="dataListLoading"
          @selection-change="selectionChangeHandle"
          class="attr-data-table">
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
            label="属性ID">
        </el-table-column>
        <el-table-column
            prop="name"
            header-align="center"
            align="center"
            width="120"
            label="属性名称">
        </el-table-column>
        <el-table-column
            prop="isSearch"
            header-align="center"
            align="center"
            width="100"
            label="是否检索">
          <template #default="scope">
            {{ scope.row.isSearch === 1 ? '需要' : '不需要' }}
          </template>
        </el-table-column>
        <el-table-column
            prop="icon"
            header-align="center"
            align="center"
            width="100"
            label="属性图标">
        </el-table-column>
        <el-table-column
            prop="valueSelect"
            header-align="center"
            align="center"
            width="230"
            label="可选值列表">
        </el-table-column>
        <el-table-column
            prop="type"
            header-align="center"
            align="center"
            width="100"
            label="属性类型">
          <template #default="scope">
            {{ scope.row.type === 0 ? '基本属性' : '销售属性' }}
          </template>
        </el-table-column>

        <!-- 修改后的是否启用列 - 使用开关组件 -->
        <el-table-column
            prop="isUse"
            header-align="center"
            align="center"
            width="100"
            label="是否启用">
          <template #default="scope">
            <el-switch
                v-model="scope.row.isUse"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                @change="isUseStatusChange(scope.row)"
                :active-value="1"
                :inactive-value="0">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
            prop="categoryId"
            header-align="center"
            align="center"
            width="100"
            label="分类ID">
        </el-table-column>
        <el-table-column
            prop="showIntro"
            header-align="center"
            align="center"
            width="120"
            label="是否展示">
          <template #default="scope">
            {{ scope.row.showIntro === 1 ? '展示' : '不展示' }}
          </template>
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
            width="200"
            label="操作">
          <template #default="scope">
            <el-button class="attr-table-button" type="primary" size="small" @click="confirmUpdate(scope.row)">修改</el-button>
            <el-button class="attr-table-button" type="danger" size="small" @click="confirmDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 - 移动到表格容器内，紧贴表格底部 -->
      <div class="attr-pagination-container">
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
    <AttributeUpdate v-if="attributeUpdateVisible" ref="AttributeUpdate" @refreshDataList="getDataList"></AttributeUpdate>

    <!-- 弹窗, 添加 -->
    <AttributeAdd v-if="attributeAddVisible" ref="AttributeAdd" @refreshDataList="getDataList"></AttributeAdd>
  </div>
</template>

<script>
// 需要创建这两个组件
import AttributeUpdate from '@/components/goods/attribute/AttributeUpdate.vue'
import AttributeAdd from '@/components/goods/attribute/AttributeAdd.vue'

export default {
  data() {
    return {
      dataForm: {
        name: '',
        categoryId: 0,
        cascadedCategoryId: [], // 级联选择器的路径数组
        type: null, // 添加type字段
        isUse: null  // 新增是否启用的搜索条件
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
      attributeUpdateVisible: false,
      attributeAddVisible: false,
      resizeTimer: null // 添加用于防抖的定时器变量
    }
  },
  components: {
    AttributeUpdate,
    AttributeAdd,
  },
  // 监听路由变化，以确保每次路由到这个页面或参数变化时都会刷新
  watch: {
    '$route': {
      handler(to) {
        // 重置搜索条件
        this.dataForm.name = '';
        this.dataForm.categoryId = 0;
        this.dataForm.cascadedCategoryId = [];
        this.dataForm.isUse = null; // 新增重置是否启用条件

        // 获取路由查询参数中的type
        if (to.query.type !== undefined) {
          this.dataForm.type = parseInt(to.query.type);
        } else {
          this.dataForm.type = null;
        }

        // 重置分页
        this.pageIndex = 1;

        // 重新获取数据列表
        this.getDataList();
      },
      immediate: true  // 组件创建时立即执行一次
    }
  },
  created() {
    // 加载分类树数据
    this.getCategoryTree();
    // 注意：不需要在这里调用getDataList()，因为watch会立即执行一次
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
    /**
     * 新增属性处理
     */
    attributeAddHandle() {
      this.attributeAddVisible = true;
      this.$nextTick(() => {
        this.$refs.AttributeAdd.init();
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
      this.dataForm.isUse = null; // 新增重置是否启用条件
      // 注意：不重置type，保留当前选择的属性类型

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

    /**
     * 获取数据列表
     * 根据搜索条件、分页信息请求后端数据
     */
    getDataList() {
      this.dataListLoading = true;

      // 构建查询参数
      const params = {
        'page': this.pageIndex,
        'limit': this.pageSize,
        'name': this.dataForm.name,
        'categoryId': this.dataForm.categoryId,
        'type': this.dataForm.type,
        'isUse': this.dataForm.isUse // 新增是否启用查询条件
      };

      this.$http.get('/data/snack_platform/attribute/list', { params }).then((data) => {
        if (data && data.code === 200) {
          this.dataList = data.data.page.list;
          this.totalPage = data.data.page.totalCount;

          // 数据加载完成后重新计算表格布局
          this.$nextTick(() => {
            if (this.$refs.dataTable) {
              this.$refs.dataTable.doLayout();
            }
          });
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },

    /**
     * 每页显示数量变化处理
     * @param {Number} val - 新的每页显示数量
     */
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },

    /**
     * 当前页变化处理
     * @param {Number} val - 新的当前页码
     */
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },

    /**
     * 表格多选变化处理
     * @param {Array} val - 当前选中的行数据数组
     */
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },

    /**
     * 确认是否修改属性
     * @param {Object} row - 当前行数据
     */
    confirmUpdate(row) {
      // 显示确认对话框，自定义确认按钮样式
      this.$confirm(`确定要修改属性 "${row.name}" 的信息吗?`, '修改确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'attr-custom-confirm-dialog'
      }).then(() => {
        // 用户点击确认后显示修改组件
        this.attributeUpdateHandle(row.id, row.categoryId);
      }).catch(() => {
        // 用户点击取消，不执行任何操作
        this.$message({
          type: 'info',
          message: '已取消修改操作'
        });
      });
    },

    /**
     * 显示属性更新组件
     * @param {Number} id - 属性ID
     * @param {Number} categoryId - 分类ID
     */
    attributeUpdateHandle(id, categoryId) {
      this.attributeUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.AttributeUpdate.init(id, categoryId);
      });
    },

    /**
     * 确认是否删除单个属性
     * @param {Object} row - 当前行数据
     */
    confirmDelete(row) {
      // 调用删除处理方法，传入属性ID
      this.deleteHandle(row.id, row.name);
    },

    /**
     * 确认是否批量删除属性
     */
    batchDeleteHandle() {
      if (this.dataListSelections.length <= 0) {
        this.$message({
          message: '请先选择要删除的属性',
          type: 'warning'
        });
        return;
      }

      // 获取所有选中属性的名称列表
      const attributeNames = this.dataListSelections.map(item => item.name).join('、');
      // 调用删除处理方法，不传ID表示批量删除
      this.deleteHandle(null, attributeNames);
    },

    /**
     * 删除处理方法 - 单个或批量
     * @param {Number|null} id - 要删除的属性ID，为null时表示批量删除
     * @param {String} names - 属性名或属性名列表，用于显示在确认提示中
     */
    deleteHandle(id, names) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id;
      });

      // 显示确认对话框
      const confirmMessage = id
          ? `确定要删除属性 "${names}" 吗?`
          : `确定要批量删除以下属性吗?\n${names}`;

      this.$confirm(confirmMessage, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'attr-custom-confirm-dialog'
      }).then(() => {
        // 用户确认删除，发送删除请求
        this.$http.delete('/data/snack_platform/attribute/delete', { data: ids }).then((data) => {
          if (data && data.code === 200) {
            // 删除成功
            this.$message({
              message: '删除操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList(); // 刷新数据列表
              }
            });
          } else {
            // 删除失败
            this.$message.error(data.msg || '删除操作失败');
          }
        });
      }).catch(() => {
        // 用户取消删除
        this.$message({
          type: 'info',
          message: '已取消删除操作'
        });
      });
    },

    /**
     * 修改属性启用状态
     * @param {Object} row - 当前行数据
     */
    isUseStatusChange(row) {
      // 显示确认对话框
      this.$confirm(`确定要${row.isUse === 1 ? '启用' : '停用'}属性 "${row.name}" 吗?`, '状态修改', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'attr-custom-confirm-dialog'
      }).then(() => {
        // 发送状态更新请求
        this.$http.put('/data/snack_platform/attribute/update', {
          'id': row.id,
          'isUse': row.isUse
        }).then((result) => {
          if (result && result.code === 200) {
            // 更新成功
            this.$message({
              message: `属性 "${row.name}" 已${row.isUse === 1 ? '启用' : '停用'}`,
              type: 'success',
              duration: 1500
            });
          } else {
            // 更新失败，还原状态
            this.$message.error(result.msg || '状态更新失败');
            row.isUse = row.isUse === 1 ? 0 : 1;
          }
        }).catch(error => {
          // 发生异常时还原状态并显示错误
          console.error("状态更新异常:", error);
          row.isUse = row.isUse === 1 ? 0 : 1;
          this.$message.error('操作失败，发生异常');
        });
      }).catch(() => {
        // 用户取消操作，还原状态
        row.isUse = row.isUse === 1 ? 0 : 1;
        this.$message({
          type: 'info',
          message: '已取消状态修改'
        });
      });
    }
  }
};
</script>
<style scoped>
/* 全局样式定义 - 添加了attr前缀 */
/* 主容器样式设置 */
.attr-container-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1900px; /* 增加最大宽度，从1650px提高到2000px */
  margin: 0 auto;
  padding: 0 1rem;
  height: calc(100vh - 10rem); /* 设置高度为视口高度减去页面其他部分 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 表格容器样式 - 增加滚动功能 */
.attr-table-container {
  width: 100%;
  flex: 1; /* 占用剩余空间 */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 垂直方向滚动 */
  overflow-x: auto; /* 水平方向滚动 */
}

/* 分页容器样式 - 新增 */
.attr-pagination-container {
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

/* 调整表格固定布局为自动布局，更好地适应内容 */
.attr-data-table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: auto; /* 从fixed改为auto，让列宽根据内容自动调整 */
  margin: 0 !important;
}

/* 搜索表单样式：使用flexbox布局实现居中对齐 */
.attr-search-form {
  display: flex; /* 使用弹性盒子布局 */
  justify-content: center; /* 水平居中对齐表单内的元素 */
  align-items: center; /* 垂直居中对齐表单内的元素 */
  margin-bottom: 0.625rem; /* 底部外边距，与下方内容保持间距 (10px -> 0.625rem) */
  width: 100%; /* 确保搜索表单占据整个容器宽度 */
  flex-wrap: wrap; /* 允许在小屏幕上换行 */
  gap: 0.625rem; /* 表单项间距 */
}

/* 级联选择器样式 */
.attr-category-cascader {
  width: 15rem !important;
}

/* 输入框中的占位文本居中显示 */
.attr-centered-input input::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 输入框中的实际输入文本居中显示 */
.attr-centered-input input {
  text-align: center; /* 使用户输入的文字也居中显示 */
  width: 15rem; /* 输入框宽度 */
  height: 2rem; /* 输入框高度 */
}

/* 下拉框样式保持与输入框一致 */
.attr-selected-input {
  width: 15rem; /* 下拉框宽度 */
  height: 2rem; /* 下拉框高度 */
}

/* 下拉框占位文本居中显示 */
.attr-selected-input .el-input__inner::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 下拉框文本居中显示 - 包括选中的值 */
.attr-selected-input .el-input__inner {
  text-align: center; /* 使选中的值居中显示 */
}

/* 搜索和批量删除按钮 */
.attr-action-button {
  width: 7rem !important;
  height: 2rem !important;
  font-size: 0.875rem; /* 按钮文字大小 (14px -> 0.875rem) */
  margin: 0 0.3125rem; /* 按钮之间的间距 */
}

/* 表格内操作按钮样式 */
.attr-table-button {
  width: 5rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
}

/* 自定义确认对话框样式 */
.attr-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  margin: 0 0.625rem;
}

/* 确保对话框内容居中 */
.attr-custom-confirm-dialog .el-message-box__btns {
  display: flex;
  justify-content: center;
}

/* 确保表格在小屏幕设备上可以水平滚动 */
@media screen and (max-width: 768px) {
  .attr-data-table {
    overflow-x: auto;
    contain: content;
  }

  /* 在小屏幕上缩小按钮尺寸 */
  .attr-table-button {
    width: 4rem !important;
    height: 1.8rem !important;
    font-size: 0.8rem;
  }

  /* 小屏幕上的表单元素调整 */
  .attr-centered-input input,
  .attr-selected-input,
  .attr-category-cascader {
    width: 12rem !important;
  }

  .attr-action-button {
    width: 5.5rem !important;
    margin: 0 0.15rem;
  }

  /* 在小屏幕设备上调整容器最大宽度 */
  .attr-container-center {
    max-width: 100%;
    padding: 0 0.5rem;
  }

  /* 搜索表单在小屏幕上调整 */
  .attr-search-form {
    padding: 0.3125rem;
  }

  /* 确保表单项在小屏幕上有足够空间 */
  .attr-search-form .el-form-item {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 576px) {
  .attr-search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .attr-search-form .el-form-item {
    margin: 0 0 0.5rem 0;
    width: 100%;
  }

  .attr-centered-input input,
  .attr-selected-input,
  .attr-category-cascader {
    width: 100% !important;
  }

  .attr-action-button {
    width: 100% !important;
    margin: 0.25rem 0;
  }
}

/* 确保el-table实例完全占据容器宽度 */
:deep(.el-table) {
  width: 100% !important;
}

/* 确保表格内部元素也能正确展示 */
:deep(.el-table__body),
:deep(.el-table__header) {
  width: 100% !important;
}
</style>