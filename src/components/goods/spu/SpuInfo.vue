<template>
  <!-- 商品管理主容器 - 添加了居中样式和高度限制 -->
  <div class="spu-config spu-container-center" style="margin-top: 2rem; height: calc(100vh - 10rem);">


    <!-- 搜索表单区域 -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="spu-search-form">
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
            class="spu-category-cascader"
        ></el-cascader>
      </el-form-item>

      <!-- 商品名称搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.spuName" placeholder="请输入产品名称" class="spu-centered-input" clearable></el-input>
      </el-form-item>

      <!-- 品牌选择器 -->
      <el-form-item>
        <el-select
            v-model="dataForm.brandId"
            placeholder="请选择品牌"
            clearable
            filterable
            class="spu-selected-input">
          <el-option
              v-for="item in brands"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>


      <!-- 操作按钮组 -->
      <el-form-item>
        <el-button class="spu-action-button" type="primary" @click="getDataList()">查询</el-button>
        <el-button class="spu-action-button" type="warning" @click="resetSearchForm()">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格容器 - 添加了占满宽度的样式和滚动功能 -->
    <div class="spu-table-container">
      <!-- 商品数据表格 - 添加ref引用 -->
      <el-table
          ref="dataTable"
          :data="dataList"
          border
          v-loading="dataListLoading"
          class="spu-data-table">
        <!-- 移除了复选框列 -->
        <el-table-column
            prop="id"
            header-align="center"
            align="center"
            width="80"
            label="产品ID">
        </el-table-column>
        <el-table-column
            prop="spuName"
            header-align="center"
            align="center"
            width="180"
            label="产品名称">
        </el-table-column>
        <el-table-column
            prop="merchantUsername"
            header-align="center"
            align="center"
            width="150"
            label="商家账号">
        </el-table-column>
        <el-table-column
            prop="categoryId"
            header-align="center"
            align="center"
            width="100"
            label="分类ID">
        </el-table-column>
        <el-table-column
            prop="brandId"
            header-align="center"
            align="center"
            width="100"
            label="品牌ID">
        </el-table-column>
        <el-table-column
            prop="publicStatus"
            header-align="center"
            align="center"
            width="120"
            label="上架状态">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.publicStatus)" class="spu-status-tag">
              {{ getStatusText(scope.row.publicStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="createTime"
            header-align="center"
            align="center"
            width="200"
            label="创建时间">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
            prop="modifyTime"
            header-align="center"
            align="center"
            width="200"
            label="修改时间">
          <template #default="scope">
            {{ formatDateTime(scope.row.modifyTime) }}
          </template>
        </el-table-column>
        <el-table-column
            fixed="right"
            header-align="center"
            align="center"
            width="200"
            label="操作">
          <template #default="scope">
            <el-button class="spu-table-button" type="primary" size="small" @click="confirmUpdate(scope.row)">修改</el-button>
            <el-button
                class="spu-table-button"
                :type="getActionButtonType(scope.row.publicStatus)"
                size="small"
                @click="handlePublicStatus(scope.row.id, scope.row.publicStatus)">
              {{ getActionButtonText(scope.row.publicStatus) }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 - 移动到表格容器内，紧贴表格底部 -->
      <div class="spu-pagination-container">
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
    <SpuInfoUpdate v-if="spuInfoUpdateVisible" ref="SpuInfoUpdate" @refreshDataList="getDataList"></SpuInfoUpdate>

    <!-- 弹窗, 添加 -->
  </div>
</template>

<script>
// 需要创建这两个组件
import SpuInfoUpdate from '@/components/goods/spu/SpuInfoUpdate.vue'

export default {
  name: 'SpuInfo',
  data() {
    return {
      dataForm: {
        spuName: '',
        categoryId: null,
        cascadedCategoryId: [], // 级联选择器的路径数组
        brandId: null,
        publicStatus: null  // 新增: 商品状态筛选
      },
      // 分类树数据
      categories: [],
      // 品牌数据
      brands: [],
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
      spuInfoUpdateVisible: false,
      spuInfoAddVisible: false,
      resizeTimer: null, // 添加用于防抖的定时器变量
    }
  },
  components: {
    SpuInfoUpdate,
  },
  computed: {
    /**
     * 根据路由参数和商品状态获取页面标题
     * @returns {String} 页面标题
     */
    getPageTitle() {
      const status = this.dataForm.publicStatus;

      switch (status) {
        case 0: return '新建商品管理';
        case 1: return '已上架商品管理';
        case 2: return '已下架商品管理';
        default: return '全部商品管理';
      }
    }
  },
  created() {
    // 从路由查询参数中获取publicStatus
    this.initFromRouteQuery();

    // 加载分类树数据
    this.getCategoryTree();
    // 加载品牌数据
    this.getBrands();
    // 初始加载数据列表
    this.getDataList();
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

  // 监听路由变化，重新初始化页面
  watch: {
    '$route'(to) {
      // 当路由发生变化时重新初始化
      this.initFromRouteQuery();
      this.getDataList();
    }
  },

  methods: {
    /**
     * 从路由查询参数初始化组件状态
     */
    initFromRouteQuery() {
      // 从路由查询参数中获取publicStatus
      const { publicStatus } = this.$route.query;

      // 如果存在publicStatus参数，转换为数字并设置到表单中
      if (publicStatus !== undefined) {
        this.dataForm.publicStatus = parseInt(publicStatus);
      } else {
        this.dataForm.publicStatus = null; // 如果没有参数，则显示全部
      }

      // 重置分页到第一页
      this.pageIndex = 1;
    },

    /**
     * 格式化日期时间
     * @param {String|Date} datetime - 日期时间字符串或对象
     * @returns {String} - 格式化后的日期时间字符串
     */
    formatDateTime(datetime) {
      if (!datetime) return '';

      const date = new Date(datetime);
      if (isNaN(date.getTime())) return datetime; // 如果无法转换为有效日期，则返回原始值

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    /**
     * 获取上架状态对应的Tag类型
     * @param {Number} status - 上架状态码
     * @returns {String} - Element UI Tag类型
     */
    getStatusTag(status) {
      switch (status) {
        case 0: return 'info';     // 新建 - 灰色(默认)
        case 1: return 'success';  // 已上架 - 绿色
        case 2: return 'danger';   // 已下架 - 红色
        default: return 'info';
      }
    },

    /**
     * 获取上架状态对应的文本
     * @param {Number} status - 上架状态码
     * @returns {String} - 状态描述文本
     */
    getStatusText(status) {
      switch (status) {
        case 0: return '新建';
        case 1: return '已上架';
        case 2: return '已下架';
        default: return '未知状态';
      }
    },

    /**
     * 获取操作按钮类型
     * @param {Number} status - 上架状态码
     * @returns {String} - Element UI Button类型
     */
    getActionButtonType(status) {
      switch (status) {
        case 0: return 'success';  // 新建 -> 上架按钮为绿色
        case 1: return 'warning';  // 已上架 -> 下架按钮为黄色
        case 2: return 'success';  // 已下架 -> 上架按钮为绿色
        default: return 'info';
      }
    },

    /**
     * 获取操作按钮文本
     * @param {Number} status - 上架状态码
     * @returns {String} - 按钮文本
     */
    getActionButtonText(status) {
      switch (status) {
        case 0: return '上架';
        case 1: return '下架';
        case 2: return '上架';
        default: return '操作';
      }
    },

    /**
     * 处理商品上下架状态
     * @param {Number} id - 商品ID
     * @param {Number} currentStatus - 当前上架状态
     */
    handlePublicStatus(id, currentStatus) {
      // 确定要切换到的新状态
      let newStatus;
      let actionText;

      if (currentStatus === 0 || currentStatus === 2) {
        // 当前为新建或已下架，则操作为上架
        newStatus = 1;
        actionText = '上架';
      } else if (currentStatus === 1) {
        // 当前为已上架，则操作为下架
        newStatus = 2;
        actionText = '下架';
      } else {
        this.$message.error('未知的商品状态');
        return;
      }

      // 确认操作 - 添加了自定义类以应用居中样式
      this.$confirm(`确定要${actionText}该商品吗?`, `${actionText}确认`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'spu-dialog-center'
      }).then(() => {
        // 发送请求更新状态
        this.$http.put('/data/snack_platform/spuinfo/update', {
          id: id,
          publicStatus: newStatus
        }).then(data => {
          if (data && data.code === 200) {
            this.$message({
              message: `商品${actionText}成功`,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList(); // 刷新列表
              }
            });
          } else {
            this.$message.error(data?.msg || `商品${actionText}失败`);
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        });
      });
    },

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
     * 加载品牌数据
     */
    getBrands() {
      this.$http.get('/data/snack_platform/brand/list').then((data) => {
        if (data && data.code === 200) {
          this.brands = data.data.page.list;
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
      this.dataForm.spuName = '';
      this.dataForm.categoryId = null;
      this.dataForm.cascadedCategoryId = [];
      this.dataForm.brandId = null;

      // 保持当前路由查询参数中的publicStatus
      if (this.$route.query.publicStatus !== undefined) {
        this.dataForm.publicStatus = parseInt(this.$route.query.publicStatus);
      } else {
        this.dataForm.publicStatus = null;
      }

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
        'spuName': this.dataForm.spuName,
        'categoryId': this.dataForm.categoryId,
        'brandId': this.dataForm.brandId,
        'publicStatus': this.dataForm.publicStatus,
      };


      this.$http.get('/data/snack_platform/spuinfo/list', { params }).then((data) => {
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
     * 确认是否修改商品
     * @param {Object} row - 当前行数据
     */
    confirmUpdate(row) {
      // 显示确认对话框，使用自定义类以应用居中样式
      this.$confirm(`确定要修改商品 "${row.spuName}" 的信息吗?`, '修改确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'spu-dialog-center'
      }).then(() => {
        // 用户点击确认后显示修改组件
        // 查询该商品完整的分类路径，确保能在级联选择器中显示
        this.findCategoryPath(row.categoryId, (path) => {
          this.spuInfoUpdateHandle(row.id, path);
        });
      }).catch(() => {
        // 用户点击取消，不执行任何操作
        this.$message({
          type: 'info',
          message: '已取消修改操作'
        });
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

      // 如果API请求失败，尝试通过递归搜索树来查找路径
      const path = this.searchCategoryPath(this.categories, categoryId);
      callback(path || [categoryId]);
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
    spuInfoUpdateHandle(id, categoryPath = []) {
      this.spuInfoUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.SpuInfoUpdate.init(id, categoryPath);
      });
    },

  }
};
</script>

<style scoped>
/* 全局样式定义 - 添加了spu前缀，确保只在当前组件生效 */
/* 主容器样式设置 */
.spu-container-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1330px; /* 设置最大宽度 */
  margin: 0 auto;
  padding: 0 1rem;
  height: calc(100vh - 10rem); /* 设置高度为视口高度减去页面其他部分 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 页面标题样式 - 新增 */
.spu-page-title {
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
  color: #303133;
}

.spu-page-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding: 0.5rem 0;
  border-bottom: 2px solid #409EFF;
  display: inline-block;
}

/* 表格容器样式 - 增加滚动功能 */
.spu-table-container {
  width: 100%;
  flex: 1; /* 占用剩余空间 */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 垂直方向滚动 */
  overflow-x: auto; /* 水平方向滚动 */
}

/* 分页容器样式 */
.spu-pagination-container {
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

/* 调整表格布局 */
.spu-data-table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: auto; /* 自动调整列宽 */
  margin: 0 !important;
}

/* 搜索表单样式 */
.spu-search-form {
  display: flex; /* 使用弹性盒子布局 */
  justify-content: center; /* 水平居中对齐表单内的元素 */
  align-items: center; /* 垂直居中对齐表单内的元素 */
  margin-bottom: 0.625rem; /* 底部外边距 */
  width: 100%; /* 确保搜索表单占据整个容器宽度 */
  flex-wrap: wrap; /* 允许在小屏幕上换行 */
  gap: 0.625rem; /* 表单项间距 */
}

/* 级联选择器样式 */
.spu-category-cascader {
  width: 15rem !important;
}

/* 输入框中的占位文本居中显示 */
.spu-centered-input input::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 输入框中的实际输入文本居中显示 */
.spu-centered-input input {
  text-align: center; /* 使用户输入的文字也居中显示 */
  width: 15rem; /* 输入框宽度 */
  height: 2rem; /* 输入框高度 */
}

/* 下拉框样式保持与输入框一致 */
.spu-selected-input {
  width: 15rem; /* 下拉框宽度 */
  height: 2rem; /* 下拉框高度 */
}

/* 下拉框占位文本居中显示 */
.spu-selected-input .el-input__inner::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 下拉框文本居中显示 - 包括选中的值 */
.spu-selected-input .el-input__inner {
  text-align: center; /* 使选中的值居中显示 */
}

/* 搜索和批量删除按钮 */
.spu-action-button {
  width: 7rem !important;
  height: 2rem !important;
  font-size: 0.875rem; /* 按钮文字大小 */
  margin: 0 0.3125rem; /* 按钮之间的间距 */
}

/* 表格内操作按钮样式 */
.spu-table-button {
  width: 5rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
}

/* 状态标签样式 - 增加字体大小 */
.spu-status-tag {
  font-size: 1rem !important;
  padding: 0.4rem 0.6rem !important;
  height: auto !important;
  line-height: 1.2 !important;
}

/* 对话框按钮居中样式 */
.spu-dialog-center .el-message-box__btns {
  text-align: center !important;
  justify-content: center !important;
  display: flex !important;
  padding-top: 20px;
}

.spu-dialog-center .el-message-box__btns .el-button {
  width: 120px !important;
  margin: 0 15px !important;
}

/* 自适应媒体查询 */
@media screen and (max-width: 768px) {
  .spu-data-table {
    overflow-x: auto;
    contain: content;
  }

  /* 在小屏幕上缩小按钮尺寸 */
  .spu-table-button {
    width: 4rem !important;
    height: 1.8rem !important;
    font-size: 0.8rem;
  }

  /* 小屏幕上的表单元素调整 */
  .spu-centered-input input,
  .spu-selected-input,
  .spu-category-cascader {
    width: 12rem !important;
  }

  .spu-action-button {
    width: 5.5rem !important;
    margin: 0 0.15rem;
  }

  /* 在小屏幕设备上调整容器最大宽度 */
  .spu-container-center {
    max-width: 100%;
    padding: 0 0.5rem;
  }

  /* 搜索表单在小屏幕上调整 */
  .spu-search-form {
    padding: 0.3125rem;
  }

  /* 确保表单项在小屏幕上有足够空间 */
  .spu-search-form .el-form-item {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }

  /* 小屏幕状态标签调整 */
  .spu-status-tag {
    font-size: 0.9rem !important;
    padding: 0.3rem 0.5rem !important;
  }

  /* 页面标题在小屏幕上的样式 */
  .spu-page-title h2 {
    font-size: 1.3rem;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 576px) {
  .spu-search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .spu-search-form .el-form-item {
    margin: 0 0 0.5rem 0;
    width: 100%;
  }

  .spu-centered-input input,
  .spu-selected-input,
  .spu-category-cascader {
    width: 100% !important;
  }

  .spu-action-button {
    width: 100% !important;
    margin: 0.25rem 0;
  }

  /* 页面标题在超小屏幕上的样式 */
  .spu-page-title h2 {
    font-size: 1.1rem;
  }
}
</style>