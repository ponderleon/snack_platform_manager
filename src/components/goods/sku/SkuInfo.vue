<template>
  <!-- 商品SKU管理主容器 - 添加了居中样式和高度限制 -->
  <div class="sku-config sku-container-center" style="margin-top: 2rem; height: calc(100vh - 10rem);">
    <!-- 搜索表单区域 -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="sku-search-form">
      <!-- 分类选择器 -->
      <el-form-item>
        <el-cascader
            v-model="dataForm.cascadedCategoryId"
            :options="categories"
            :props="categoryProps"
            @change="handleCategoryChange"
            placeholder="请选择分类"
            clearable
            filterable
            class="sku-category-cascader"
        ></el-cascader>
      </el-form-item>

      <!-- 商品名称搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.skuName" placeholder="请输入商品名称" class="sku-centered-input" clearable></el-input>
      </el-form-item>

      <!-- 品牌搜索选择框 -->
      <el-form-item>
        <el-select v-model="dataForm.brandId" placeholder="请选择品牌" clearable filterable class="sku-selected-input">
          <el-option
              v-for="brand in brandOptions"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id">
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 操作按钮组 -->
      <el-form-item>
        <el-button class="sku-action-button" type="primary" @click="getDataList()">查询</el-button>
        <el-button class="sku-action-button" type="warning" @click="resetSearchForm()">重置</el-button>
        <el-button class="sku-action-button" type="danger" @click="batchDeleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格容器 - 添加了占满宽度的样式和滚动功能 -->
    <div class="sku-table-container">
      <!-- 商品SKU数据表格 - 添加ref引用 -->
      <el-table
          ref="dataTable" :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" class="sku-data-table">
        <el-table-column
            type="selection" header-align="center" align="center" width="50">
        </el-table-column>
        <el-table-column
            prop="id" header-align="center" align="center" width="80" label="商品ID">
        </el-table-column>
        <el-table-column
            prop="skuName" header-align="center" align="center" width="150" label="商品名称">
        </el-table-column>
        <el-table-column
            prop="skuTitle" header-align="center" align="center" width="180" label="商品标题">
        </el-table-column>
        <el-table-column
            prop="skuDefaultImg" header-align="center" align="center" width="120" label="商品图片">
          <template #default="scope">
            <img v-if="scope.row.skuDefaultImg" :src="scope.row.skuDefaultImg" style="max-height: 60px; max-width: 60px;">
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column
            prop="price" header-align="center" align="center" width="100" label="价格">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column
            prop="saleCount" header-align="center" align="center" width="100" label="销量">
        </el-table-column>
        <el-table-column
            prop="stock" header-align="center" align="center" width="100" label="库存">
        </el-table-column>
        <el-table-column
            prop="skuDescription" header-align="center" align="center" width="180" label="商品说明">
        </el-table-column>
        <el-table-column
            prop="categoryId" header-align="center" align="center" width="100" label="分类ID">
        </el-table-column>
        <el-table-column
            prop="brandId" header-align="center" align="center" width="100" label="品牌ID">
        </el-table-column>
        <el-table-column
            prop="createTime" header-align="center" align="center" width="160" label="创建时间">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
            prop="modifyTime" header-align="center" align="center" width="160" label="修改时间">
          <template #default="scope">
            {{ formatDate(scope.row.modifyTime) }}
          </template>
        </el-table-column>
        <el-table-column
            fixed="right" header-align="center" align="center" width="200" label="操作">
          <template #default="scope">
            <el-button class="sku-table-button" type="primary" size="small" @click="confirmUpdate(scope.row)">修改</el-button>
            <el-button class="sku-table-button" type="danger" size="small" @click="confirmDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 - 移动到表格容器内，紧贴表格底部 -->
      <div class="sku-pagination-container">
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
    <SkuInfoUpdate v-if="skuInfoUpdateVisible" ref="SkuInfoUpdate" @refreshDataList="getDataList"></SkuInfoUpdate>


  </div>
</template>

<script>
// 需要创建这两个组件
import SkuInfoUpdate from './SkuInfoUpdate.vue'

export default {
  data() {
    return {
      dataForm: {
        skuName: '',
        categoryId: null,
        cascadedCategoryId: [], // 级联选择器的路径数组
        brandId: null,
      },
      // 分类树数据
      categories: [],
      // 品牌选项数据
      brandOptions: [],
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
      skuInfoUpdateVisible: false,
      skuInfoAddVisible: false,
      resizeTimer: null, // 添加用于防抖的定时器变量
    }
  },
  components: {
    SkuInfoUpdate,
  },
  // 监听路由变化
  watch: {
    '$route': {
      handler() {
        // 重置搜索条件
        this.dataForm.skuName = '';
        this.dataForm.categoryId = null;
        this.dataForm.cascadedCategoryId = [];
        this.dataForm.brandId = null;

        // 重置分页
        this.pageIndex = 1;


        // 重新获取数据列表
        this.getDataList();
      },
      immediate: true  // 组件创建时立即执行一次
    }
  },
  created() {

    // 加载分类树数据和品牌数据
    this.getCategoryTree();
    this.getBrandOptions();
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
     * 格式化日期
     */
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString();
    },

    // /**
    //  * 新增商品处理
    //  */
    // skuInfoAddHandle() {
    //   this.skuInfoAddVisible = true;
    //   this.$nextTick(() => {
    //     this.$refs.SkuInfoAdd.init();
    //   });
    // },

    /**
     * 加载分类树数据
     */
    getCategoryTree() {
      this.$http.get('/data/snack_platform/category/tree').then((data) => {
        if (data && data.code === 200) {
          this.categories = data.data;
        } else {
          this.$message.error(data?.msg || '获取分类数据失败');
        }
      }).catch(error => {
        console.error('获取分类树失败:', error);
        this.$message.error('获取分类树失败');
      });
    },

    /**
     * 加载品牌选项数据
     */
    getBrandOptions() {
      this.$http.get('/data/snack_platform/brand/list').then((data) => {
        if (data && data.code === 200) {
          this.brandOptions = data.data.page.list || [];
        } else {
          this.$message.error(data?.msg || '获取品牌数据失败');
        }
      }).catch(error => {
        console.error('获取品牌数据失败:', error);
        this.$message.error('获取品牌数据失败');
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
      this.dataForm.skuName = '';
      this.dataForm.categoryId = null;
      this.dataForm.cascadedCategoryId = [];
      this.dataForm.brandId = null;
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
        'skuName': this.dataForm.skuName,
        'categoryId': this.dataForm.categoryId,
        'brandId': this.dataForm.brandId,
      };

      console.log(JSON.stringify(params))

      this.$http.get('/data/snack_platform/skuinfo/list', {params:params }).then((data) => {
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
     * 确认是否修改商品
     * @param {Object} row - 当前行数据
     */
    confirmUpdate(row) {
      // 显示确认对话框，自定义确认按钮样式
      this.$confirm(`确定要修改商品 "${row.skuName}" 的信息吗?`, '修改确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'sku-custom-confirm-dialog',
        center: true, // 添加center属性使内容居中
        distinguishCancelAndClose: true // 区分取消与关闭
      }).then(() => {
        // 用户点击确认后，查找商品分类的完整路径
        this.findCategoryPath(row.categoryId, (path) => {
          // 显示修改组件，并传递找到的分类路径
          this.skuInfoUpdateHandle(row.id, path);
        });
      }).catch((action) => {
        // 只有在明确点击取消按钮时才显示取消消息
        if (action === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消修改操作'
          });
        }
      });
    },

    /**
     * 查找分类路径
     * @param {Number} categoryId - 分类ID
     * @param {Function} callback - 找到路径后的回调函数
     */
    findCategoryPath(categoryId, callback) {
      if (!categoryId) {
        callback([]);
        return;
      }

      // 先尝试通过API获取完整路径
      this.$http.get(`/data/snack_platform/category/path/${categoryId}`).then((data) => {
        if (data && data.code === 200 && data.data) {
          callback(data.data);
        } else {
          // 如果API调用失败，尝试通过递归查找
          const path = this.searchCategoryPath(this.categories, categoryId);
          callback(path || [categoryId]);
        }
      }).catch(() => {
        // 如果API请求失败，尝试递归查找
        const path = this.searchCategoryPath(this.categories, categoryId);
        callback(path || [categoryId]);
      });
    },

    /**
     * 递归搜索分类路径
     * @param {Array} categories - 分类树
     * @param {Number} targetId - 目标分类ID
     * @param {Array} currentPath - 当前路径
     * @returns {Array|null} - 找到的路径或null
     */
    searchCategoryPath(categories, targetId, currentPath = []) {
      if (!categories || categories.length === 0) return null;

      for (const category of categories) {
        // 构建当前路径
        const newPath = [...currentPath, category.id];

        // 如果找到目标ID，返回完整路径
        if (category.id === targetId) {
          return newPath;
        }

        // 如果有子分类，递归搜索
        if (category.childrenCategories && category.childrenCategories.length > 0) {
          const result = this.searchCategoryPath(category.childrenCategories, targetId, newPath);
          if (result) return result;
        }
      }

      return null;
    },

    /**
     * 显示商品更新组件
     * @param {Number} id - 商品ID
     * @param {Array} categoryPath - 分类路径
     */
    skuInfoUpdateHandle(id, categoryPath = []) {
      this.skuInfoUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.SkuInfoUpdate.init(id, categoryPath);
      });
    },

    /**
     * 确认是否删除单个商品
     * @param {Object} row - 当前行数据
     */
    confirmDelete(row) {
      // 显示确认对话框，添加center属性使内容居中
      this.$confirm(`确定要删除商品 "${row.skuName}" 吗?`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'sku-custom-confirm-dialog',
        center: true, // 添加center属性使内容居中
        distinguishCancelAndClose: true // 区分取消与关闭
      }).then(() => {
        // 调用删除处理方法，传入商品ID
        this.deleteHandle(row.id, row.skuName);
      }).catch((action) => {
        // 只有在明确点击取消按钮时才显示取消消息
        if (action === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消删除操作'
          });
        }
      });
    },

    /**
     * 确认是否批量删除商品
     */
    batchDeleteHandle() {
      if (this.dataListSelections.length <= 0) {
        this.$message({
          message: '请先选择要删除的商品',
          type: 'warning'
        });
        return;
      }

      // 获取所有选中商品的名称列表
      const skuNames = this.dataListSelections.map(item => item.skuName).join('、');

      // 显示确认对话框，添加center属性使内容居中
      const confirmMessage = `确定要批量删除以下商品吗?\n${skuNames}`;

      this.$confirm(confirmMessage, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'sku-custom-confirm-dialog',
        center: true, // 添加center属性使内容居中
        distinguishCancelAndClose: true // 区分取消与关闭
      }).then(() => {
        // 用户确认删除，调用删除方法
        const ids = this.dataListSelections.map(item => item.id);
        this.deleteHandle(null, skuNames);
      }).catch((action) => {
        // 只有在明确点击取消按钮时才显示取消消息
        if (action === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消删除操作'
          });
        }
      });
    },

    /**
     * 删除处理方法 - 单个或批量
     * @param {Number|null} id - 要删除的商品ID，为null时表示批量删除
     * @param {String} names - 商品名或商品名列表，用于显示在确认提示中
     */
    deleteHandle(id, names) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id;
      });

      // 用户确认删除，发送删除请求
      this.$http.delete('/data/snack_platform/skuinfo/delete', { data: ids }).then((data) => {
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
    }
  }
};
</script>

<style scoped>
/* 全局样式定义 - 添加了sku前缀 */
/* 主容器样式设置 */
.sku-container-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1900px; /* 增加最大宽度，从1650px提高到1900px */
  margin: 0 auto;
  padding: 0 1rem;
  height: calc(100vh - 10rem); /* 设置高度为视口高度减去页面其他部分 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 表格容器样式 - 增加滚动功能 */
.sku-table-container {
  width: 100%;
  flex: 1; /* 占用剩余空间 */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 垂直方向滚动 */
  overflow-x: auto; /* 水平方向滚动 */
}

/* 分页容器样式 - 新增 */
.sku-pagination-container {
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
.sku-data-table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: auto; /* 从fixed改为auto，让列宽根据内容自动调整 */
  margin: 0 !important;
}

/* 搜索表单样式：使用flexbox布局实现居中对齐 */
.sku-search-form {
  display: flex; /* 使用弹性盒子布局 */
  justify-content: center; /* 水平居中对齐表单内的元素 */
  align-items: center; /* 垂直居中对齐表单内的元素 */
  margin-bottom: 0.625rem; /* 底部外边距，与下方内容保持间距 (10px -> 0.625rem) */
  width: 100%; /* 确保搜索表单占据整个容器宽度 */
  flex-wrap: wrap; /* 允许在小屏幕上换行 */
  gap: 0.625rem; /* 表单项间距 */
}

/* 级联选择器样式 */
.sku-category-cascader {
  width: 15rem !important;
}

/* 输入框中的占位文本居中显示 */
.sku-centered-input input::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 输入框中的实际输入文本居中显示 */
.sku-centered-input input {
  text-align: center; /* 使用户输入的文字也居中显示 */
  width: 15rem; /* 输入框宽度 */
  height: 2rem; /* 输入框高度 */
}

/* 下拉框样式保持与输入框一致 */
.sku-selected-input {
  width: 15rem; /* 下拉框宽度 */
  height: 2rem; /* 下拉框高度 */
}

/* 下拉框占位文本居中显示 */
.sku-selected-input .el-input__inner::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 下拉框文本居中显示 - 包括选中的值 */
.sku-selected-input .el-input__inner {
  text-align: center; /* 使选中的值居中显示 */
}

/* 搜索和批量删除按钮 */
.sku-action-button {
  width: 7rem !important;
  height: 2rem !important;
  font-size: 0.875rem; /* 按钮文字大小 (14px -> 0.875rem) */
  margin: 0 0.3125rem; /* 按钮之间的间距 */
}

/* 表格内操作按钮样式 */
.sku-table-button {
  width: 5rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
}

/* 自定义确认对话框样式 - 使用深度选择器确保样式生效 */
:deep(.sku-custom-confirm-dialog) {
  /* 确保对话框内部的按钮居中显示 */
  & .el-message-box__btns {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
  }

  /* 调整按钮样式 */
  & .el-button {
    width: 8rem !important;
    height: 2rem !important;
    margin: 0 0.625rem;
  }

  /* 确保内容文本也居中 */
  & .el-message-box__message {
    text-align: center;
  }
}

/* 确保表格在小屏幕设备上可以水平滚动 */
@media screen and (max-width: 768px) {
  .sku-data-table {
    overflow-x: auto;
    contain: content;
  }

  /* 在小屏幕上缩小按钮尺寸 */
  .sku-table-button {
    width: 4rem !important;
    height: 1.8rem !important;
    font-size: 0.8rem;
  }

  /* 小屏幕上的表单元素调整 */
  .sku-centered-input input,
  .sku-selected-input,
  .sku-category-cascader {
    width: 12rem !important;
  }

  .sku-action-button {
    width: 5.5rem !important;
    margin: 0 0.15rem;
  }

  /* 在小屏幕设备上调整容器最大宽度 */
  .sku-container-center {
    max-width: 100%;
    padding: 0 0.5rem;
  }

  /* 搜索表单在小屏幕上调整 */
  .sku-search-form {
    padding: 0.3125rem;
  }

  /* 确保表单项在小屏幕上有足够空间 */
  .sku-search-form .el-form-item {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 576px) {
  .sku-search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .sku-search-form .el-form-item {
    margin: 0 0 0.5rem 0;
    width: 100%;
  }

  .sku-centered-input input,
  .sku-selected-input,
  .sku-category-cascader {
    width: 100% !important;
  }

  .sku-action-button {
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