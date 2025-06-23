<template>
  <!-- 品牌管理主容器 - 添加了居中样式和高度限制 -->
  <div class="br-mod-config br-container-center" style="margin-top: 2rem; height: calc(100vh - 10rem);">
    <!-- 搜索表单区域 -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="br-search-form">
      <!-- 品牌名称搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="请输入品牌名称" class="br-centered-input" clearable></el-input>
      </el-form-item>

      <!-- 是否发布搜索选择框 -->
      <el-form-item>
        <el-select v-model="dataForm.isRelease" placeholder="是否发布" clearable class="br-selected-input">
          <el-option label="已发布" :value="1"></el-option>
          <el-option label="未发布" :value="0"></el-option>
        </el-select>
      </el-form-item>

      <!-- 检索首字母搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.firstLetter" placeholder="请输入检索首字母" class="br-centered-input" clearable></el-input>
      </el-form-item>

      <!-- 操作按钮组 -->
      <el-form-item>
        <el-button class="br-action-button" type="primary" @click="getDataList()">查询</el-button>
        <el-button class="br-action-button" type="warning" @click="resetSearchForm()">重置</el-button>
        <el-button class="br-action-button" type="success" @click="addOrUpdateHandle()">新增</el-button>
        <el-button class="br-action-button" type="danger" @click="deleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格容器 - 添加了占满宽度的样式和滚动功能 -->
    <div class="br-table-container">
      <!-- 品牌数据表格 - 添加ref引用 -->
      <el-table
          ref="dataTable"
          :data="dataList"
          border
          v-loading="dataListLoading"
          @selection-change="selectionChangeHandle"
          class="br-data-table">
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
            label="品牌ID">
        </el-table-column>
        <el-table-column
            prop="name"
            header-align="center"
            align="center"
            width="290"
            label="品牌名称">
        </el-table-column>
        <el-table-column
            prop="log"
            header-align="center"
            align="center"
            width="100"
            label="品牌Logo">
        </el-table-column>
        <el-table-column
            prop="description"
            header-align="center"
            align="center"
            width="200"
            label="品牌说明">
        </el-table-column>

        <!-- 修改后的是否发布列 - 使用开关组件 -->
        <el-table-column
            prop="isRelease"
            header-align="center"
            align="center"
            width="100"
            label="是否发布">
          <template #default="scope">
            <el-switch
                v-model="scope.row.isRelease"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                @change="isReleaseStatusChange(scope.row)"
                :active-value="1"
                :inactive-value="0">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
            prop="firstLetter"
            header-align="center"
            align="center"
            width="100"
            label="检索首字母">
        </el-table-column>
        <el-table-column
            prop="sort"
            header-align="center"
            align="center"
            width="80"
            label="排序">
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
            <el-button class="br-table-button" type="primary" size="small" @click="confirmUpdate(scope.row)">修改</el-button>
            <el-button class="br-table-button" type="danger" size="small" @click="confirmDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 - 移动到表格容器内，紧贴表格底部 -->
      <div class="br-pagination-container">
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
    <BrandUpdate v-if="brandUpdateVisible" ref="BrandUpdate" @refreshDataList="getDataList"></BrandUpdate>

    <!-- 弹窗, 添加 -->
    <BrandAdd v-if="brandAddVisible" ref="BrandAdd" @refreshDataList="getDataList"></BrandAdd>
  </div>
</template>

<script>
// 引入子组件
import BrandUpdate from '@/components/goods/brand/BrandUpdate.vue'
import BrandAdd from '@/components/goods/brand/BrandAdd.vue'

export default {
  data() {
    return {
      dataForm: {
        name: '',          // 品牌名称
        isRelease: null,   // 是否发布
        firstLetter: null    // 检索首字母
      },
      dataList: [],         // 数据列表
      pageIndex: 1,         // 当前页码
      pageSize: 10,         // 每页数量
      totalPage: 0,         // 总条数
      dataListLoading: false, // 加载状态
      dataListSelections: [], // 选中数据
      brandUpdateVisible: false, // 修改对话框显示状态
      brandAddVisible: false,    // 添加对话框显示状态
      resizeTimer: null // 添加用于防抖的定时器变量
    }
  },
  components: {
    BrandUpdate,
    BrandAdd,
  },
  created() {
    // 初始化时获取数据列表
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

  methods: {
    /**
     * 重置搜索表单
     */
    resetSearchForm() {
      this.dataForm.name = '';
      this.dataForm.isRelease = null;
      this.dataForm.firstLetter = null;

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
        'isRelease': this.dataForm.isRelease,
        'firstLetter': this.dataForm.firstLetter
      };

      this.$http.get('/data/snack_platform/brand/list', { params }).then((data) => {
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
     * 弹出新增品牌对话框
     */
    addOrUpdateHandle() {
      this.brandAddVisible = true;
      this.$nextTick(() => {
        this.$refs.BrandAdd.init();
      });
    },

    /**
     * 确认是否修改品牌
     * @param {Object} row - 当前行数据
     */
    confirmUpdate(row) {
      // 显示确认对话框
      this.$confirm(`确定要修改品牌 "${row.name}" 的信息吗?`, '修改确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'br-custom-confirm-dialog'
      }).then(() => {
        // 用户点击确认后显示修改组件
        this.brandUpdateVisible = true;
        this.$nextTick(() => {
          this.$refs.BrandUpdate.init(row.id);
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
     * 确认是否删除单个品牌
     * @param {Object} row - 当前行数据
     */
    confirmDelete(row) {
      // 调用删除处理方法，传入品牌ID
      this.deleteHandle(row.id, row.name);
    },

    /**
     * 删除处理方法 - 单个或批量
     * @param {Number|null} id - 要删除的品牌ID，为null时表示批量删除
     * @param {String} names - 品牌名或品牌名列表，用于显示在确认提示中
     */
    deleteHandle(id, names) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id;
      });

      // 显示确认对话框
      const confirmMessage = id
          ? `确定要删除品牌 "${names}" 吗?`
          : `确定要批量删除以下品牌吗?\n${this.dataListSelections.map(item => item.name).join('、')}`;

      this.$confirm(confirmMessage, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'br-custom-confirm-dialog'
      }).then(() => {
        // 用户确认删除，发送删除请求
        this.$http.delete('/data/snack_platform/brand/delete', { data: ids }).then((data) => {
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
     * 修改品牌发布状态
     * @param {Object} row - 当前行数据
     */
    isReleaseStatusChange(row) {
      // 显示确认对话框
      this.$confirm(`确定要${row.isRelease === 1 ? '发布' : '取消发布'}品牌 "${row.name}" 吗?`, '状态修改', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'br-custom-confirm-dialog'
      }).then(() => {
        // 发送状态更新请求
        this.$http.put('/data/snack_platform/brand/update', {
          'id': row.id,
          'isRelease': row.isRelease
        }).then((result) => {
          if (result && result.code === 200) {
            // 更新成功
            this.$message({
              message: `品牌 "${row.name}" 已${row.isRelease === 1 ? '发布' : '取消发布'}`,
              type: 'success',
              duration: 1500
            });
          } else {
            // 更新失败，还原状态
            this.$message.error(result.msg || '状态更新失败');
            row.isRelease = row.isRelease === 1 ? 0 : 1;
          }
        }).catch(error => {
          // 发生异常时还原状态并显示错误
          console.error("状态更新异常:", error);
          row.isRelease = row.isRelease === 1 ? 0 : 1;
          this.$message.error('操作失败，发生异常');
        });
      }).catch(() => {
        // 用户取消操作，还原状态
        row.isRelease = row.isRelease === 1 ? 0 : 1;
        this.$message({
          type: 'info',
          message: '已取消状态修改'
        });
      });
    }
  }
}
</script>

<style scoped>
/* 全局样式定义 - 使用br-前缀 */
/* 主容器样式设置 */
.br-container-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1800px; /* 增加最大宽度 */
  margin: 0 auto;
  padding: 0 1rem;
  height: calc(100vh - 10rem); /* 设置高度为视口高度减去页面其他部分 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 表格容器样式 - 增加滚动功能 */
.br-table-container {
  width: 100%;
  flex: 1; /* 占用剩余空间 */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 垂直方向滚动 */
  overflow-x: auto; /* 水平方向滚动 */
}

/* 分页容器样式 - 新增 */
.br-pagination-container {
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
.br-data-table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: auto; /* 从fixed改为auto，让列宽根据内容自动调整 */
  margin: 0 !important;
}

/* 搜索表单样式：使用flexbox布局实现居中对齐 */
.br-search-form {
  display: flex; /* 使用弹性盒子布局 */
  justify-content: center; /* 水平居中对齐表单内的元素 */
  align-items: center; /* 垂直居中对齐表单内的元素 */
  margin-bottom: 0.625rem; /* 底部外边距，与下方内容保持间距 (10px -> 0.625rem) */
  width: 100%; /* 确保搜索表单占据整个容器宽度 */
  flex-wrap: wrap; /* 允许在小屏幕上换行 */
  gap: 0.625rem; /* 表单项间距 */
}

/* 输入框中的占位文本居中显示 */
.br-centered-input input::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 输入框中的实际输入文本居中显示 */
.br-centered-input input {
  text-align: center; /* 使用户输入的文字也居中显示 */
  width: 15rem; /* 输入框宽度 */
  height: 2rem; /* 输入框高度 */
}

/* 下拉框样式保持与输入框一致 */
.br-selected-input {
  width: 15rem; /* 下拉框宽度 */
  height: 2rem; /* 下拉框高度 */
}

/* 下拉框占位文本居中显示 */
.br-selected-input .el-input__inner::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 下拉框文本居中显示 - 包括选中的值 */
.br-selected-input .el-input__inner {
  text-align: center; /* 使选中的值居中显示 */
}

/* 下拉选项居中显示 */
.el-select-dropdown__item {
  text-align: center; /* 下拉选项文字居中显示 */
}

/* 搜索和批量删除按钮 */
.br-action-button {
  width: 7rem !important;
  height: 2rem !important;
  font-size: 0.875rem; /* 按钮文字大小 (14px -> 0.875rem) */
  margin: 0 0.3125rem; /* 按钮之间的间距 */
}

/* 表格内操作按钮样式 */
.br-table-button {
  width: 5rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
}

/* 分页控件样式 */
.br-pagination-container .el-pagination {
  font-size: 0.875rem; /* 文字大小 (14px -> 0.875rem) */
}

/* 自定义确认对话框样式 */
.br-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  margin: 0 0.625rem;
}

/* 确保对话框内容居中 */
.br-custom-confirm-dialog .el-message-box__btns {
  display: flex;
  justify-content: center;
}

/* 确保表格在小屏幕设备上可以水平滚动 */
@media screen and (max-width: 768px) {
  .br-data-table {
    overflow-x: auto;
    contain: content;
  }

  /* 在小屏幕上缩小按钮尺寸 */
  .br-table-button {
    width: 4rem !important;
    height: 1.8rem !important;
    font-size: 0.8rem;
  }

  /* 小屏幕上的表单元素调整 */
  .br-centered-input input,
  .br-selected-input {
    width: 12rem !important;
  }

  .br-action-button {
    width: 5.5rem !important;
    margin: 0 0.15rem;
  }

  /* 在小屏幕设备上调整容器最大宽度 */
  .br-container-center {
    max-width: 100%;
    padding: 0 0.5rem;
  }

  /* 搜索表单在小屏幕上调整 */
  .br-search-form {
    padding: 0.3125rem;
  }

  /* 确保表单项在小屏幕上有足够空间 */
  .br-search-form .el-form-item {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 576px) {
  .br-search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .br-search-form .el-form-item {
    margin: 0 0 0.5rem 0;
    width: 100%;
  }

  .br-centered-input input,
  .br-selected-input {
    width: 100% !important;
  }

  .br-action-button {
    width: 100% !important;
    margin: 0.25rem 0;
  }
}

/* 全局设置确认对话框按钮样式 */
body .br-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 调整确认对话框按钮间距 */
body .br-custom-confirm-dialog .el-button + .el-button {
  margin-left: 0.625rem;
}

/* 确保el-table实例完全占据容器宽度 */
.br-data-table {
  width: 100% !important;
}

/* 确保表格内部元素也能正确展示 */
.br-data-table .el-table__body,
.br-data-table .el-table__header {
  width: 100% !important;
}
</style>