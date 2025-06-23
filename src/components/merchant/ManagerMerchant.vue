<template>
  <!-- 商户管理主容器 -->
  <div class="mm-mod-config" style="margin-top: 2rem; height: calc(100vh - 10rem);">
    <!-- 搜索表单区域 -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="mm-search-form">
      <!-- 参数名搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="请输入商户名称" class="mm-centered-input" clearable></el-input>
      </el-form-item>
      <!-- 参数名搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.username" placeholder="请输入商户账号" class="mm-centered-input" clearable></el-input>
      </el-form-item>
      <!-- 商户启用状态筛选下拉框 -->
      <el-form-item>
        <el-select v-model="dataForm.isUse" placeholder="请选择商户是否启用" class="mm-selected-input" clearable>
          <el-option :value="1" label="启用"></el-option>
          <el-option :value="0" label="未启用"></el-option>
        </el-select>
      </el-form-item>
      <!-- 操作按钮组 -->
      <el-form-item>
        <el-button class="mm-action-button" type="primary" @click="getDataList()">查询</el-button>
        <el-button class="mm-action-button" type="danger" @click="batchDeleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格容器 - 添加高度限制和滚动 -->
    <div class="mm-table-container">
      <!-- 商户数据表格 - 添加ref引用 -->
      <el-table
          ref="dataTable" :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle" class="mm-data-table">
        <el-table-column
            type="selection" header-align="center" align="center" width="50">
        </el-table-column>
        <el-table-column
            prop="name" header-align="center" align="center" width="210" label="商户名称">
        </el-table-column>
        <el-table-column
            prop="username" header-align="center" align="center" width="150" label="商户账号">
        </el-table-column>
        <el-table-column
            prop="phone" header-align="center" align="center" width="200" label="商户电话">
        </el-table-column>
        <el-table-column
            prop="email" header-align="center" align="center" width="300" label="商户邮箱">
        </el-table-column>
        <el-table-column
            prop="isUse" header-align="center" align="center" width="100" label="是否启用">
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
            prop="address" header-align="center" align="center" width="300" label="商家地址">
        </el-table-column>
        <el-table-column
            prop="registerTime" header-align="center" align="center" width="300" label="商户注册时间">
        </el-table-column>
        <el-table-column
            prop="loginTime" header-align="center" align="center" width="300" label="商户登录时间">
        </el-table-column>
        <el-table-column
            fixed="right" header-align="center" align="center" width="330" label="操作">
          <template #default="scope">
            <el-button class="mm-table-button" type="primary" size="small" @click="confirmUpdate(scope.row)">修改</el-button>
            <el-button class="mm-table-button" type="danger" size="small" @click="confirmDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 - 移动到表格容器内，紧贴表格底部 -->
      <div class="mm-pagination-container">
        <el-pagination
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
            :current-page="pageIndex"
            :page-sizes="[2, 4, 5, 10]"
            :page-size="pageSize"
            :total="totalPage"
            layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>

    <!-- 弹窗, 新增 / 修改 -->
    <ManagerMerchantUpdate v-if="merchantUpdateVisible" ref="merchantUpdate" @refreshDataList="getDataList"></ManagerMerchantUpdate>
  </div>
</template>

<script>
import ManagerMerchantUpdate from '@/components/merchant/ManagerMerchantUpdate.vue'
export default {
  data () {
    return {
      dataForm: {
        username: '',
        isUse: '',
        name: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 2,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      merchantUpdateVisible: false,
      resizeTimer: null
    }
  },
  components: {
    ManagerMerchantUpdate
  },
  created () {
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
      this.$http.get('/data/snack_platform/merchant/list', {
        params: {
          'page': this.pageIndex,
          'limit': this.pageSize,
          'username': this.dataForm.username,
          'isUse': this.dataForm.isUse,
          'name': this.dataForm.name
        }
      }).then((data) => {
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
     * 确认是否修改商户
     * @param {Object} row - 当前行数据
     */
    confirmUpdate(row) {
      // 显示确认对话框，自定义确认按钮样式
      this.$confirm(`确定要修改商户 "${row.name}" (账号: ${row.username}) 的信息吗?`, '修改确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'mm-custom-confirm-dialog'
      }).then(() => {
        // 用户点击确认后显示修改组件
        this.merchantUpdateHandle(row.id)
      }).catch(() => {
        // 用户点击取消，不执行任何操作
        this.$message({
          type: 'info',
          message: '已取消修改操作'
        })
      })
    },

    // 新增 / 修改
    merchantUpdateHandle(id) {
      this.merchantUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.merchantUpdate.init(id)
      })
    },

    /**
     * 确认是否删除单个商户
     * @param {Object} row - 当前行数据
     */
    confirmDelete(row) {
      // 调用删除处理方法，传入商户ID
      this.deleteHandle(row.id, row.name)
    },

    /**
     * 确认是否批量删除商户
     */
    batchDeleteHandle() {
      if (this.dataListSelections.length <= 0) {
        this.$message({
          message: '请先选择要删除的商户',
          type: 'warning'
        })
        return
      }

      // 获取所有选中商户的名称列表
      const merchantNames = this.dataListSelections.map(item => item.name).join('、')
      // 调用删除处理方法，不传ID表示批量删除
      this.deleteHandle(null, merchantNames)
    },

    // 删除
    deleteHandle (id, names) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })

      // 显示确认对话框
      const confirmMessage = id
          ? `确定要删除商户 "${names}" 吗?`
          : `确定要批量删除以下商户吗?\n${names}`

      this.$confirm(confirmMessage, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'mm-custom-confirm-dialog'
      }).then(() => {
        // 用户确认删除，发送删除请求
        this.$http.delete('/data/snack_platform/merchant/delete', {data: ids}).then((data) => {
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
    },

    /**
     * 修改商户启用状态
     * @param {Object} row - 当前行数据
     */
    isUseStatusChange(row) {
      // 发送状态更新请求
      this.$http.put('/data/snack_platform/merchant/update', {
        'id': row.id,
        'isUse': row.isUse
      }).then((result) => {
        if (result && result.code === 200) {
          // 更新成功
          this.$message({
            message: `商户 "${row.name}" 已${row.isUse === 1 ? '启用' : '停用'}`,
            type: 'success',
            duration: 1500
          })
        } else {
          // 更新失败，还原状态
          this.$message.error(result.msg || '状态更新失败')
          row.isUse = row.isUse === 1 ? 0 : 1
        }
      }).catch(error => {
        // 发生异常时还原状态并显示错误
        console.log("异常为： ", error)
        row.isUse = row.isUse === 1 ? 0 : 1
        this.$message.error('操作失败，发生异常')
      })
    }
  }
}
</script>

<style scoped>
/* 全局样式定义 - 使用mm-前缀 */

/* 主容器样式设置 */
.mm-mod-config {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 10rem); /* 设置容器高度为视口高度减去页面其他部分 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 表格容器样式 - 新增，实现滚动效果 */
.mm-table-container {
  flex: 1; /* 占用剩余空间 */
  overflow-y: auto; /* 垂直方向滚动 */
  overflow-x: auto; /* 水平方向滚动 */
  display: flex;
  flex-direction: column;
}

/* 表格基本样式 - 添加固定布局和性能优化 */
.mm-data-table {
  width: 100%;
  table-layout: fixed; /* 添加固定表格布局 */
  contain: content;    /* 添加性能优化 */
}

/* 搜索表单样式：使用flexbox布局实现居中对齐 */
.mm-search-form {
  display: flex; /* 使用弹性盒子布局 */
  justify-content: center; /* 水平居中对齐表单内的元素 */
  align-items: center; /* 垂直居中对齐表单内的元素 */
  margin-bottom: 0.625rem; /* 底部外边距，与下方内容保持间距 (10px -> 0.625rem) */
}

/* 输入框中的占位文本居中显示 */
.mm-centered-input input::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 输入框中的实际输入文本居中显示 */
.mm-centered-input input {
  text-align: center; /* 使用户输入的文字也居中显示 */
  width: 15rem; /* 输入框宽度 */
  height: 2rem; /* 输入框高度 */
}

/* 下拉框样式保持与输入框一致 */
.mm-selected-input {
  width: 15rem; /* 下拉框宽度 */
  height: 2rem; /* 下拉框高度 */
}

/* 下拉框占位文本居中显示 */
.mm-selected-input .el-input__inner::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 下拉框文本居中显示 - 包括选中的值 */
.mm-selected-input .el-input__inner {
  text-align: center; /* 使选中的值居中显示 */
}

/* 下拉选项居中显示 */
.el-select-dropdown__item {
  text-align: center; /* 下拉选项文字居中显示 */
}

/* 搜索和批量删除按钮 */
.mm-action-button {
  width: 8rem !important;
  height: 2rem !important;
  font-size: 0.875rem; /* 按钮文字大小 (14px -> 0.875rem) */
}

/* 表格内操作按钮样式 */
.mm-table-button {
  width: 5rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
}

/* 分页容器样式 - 新增 */
.mm-pagination-container {
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

/* 分页控件样式 */
.mm-pagination-container .el-pagination {
  font-size: 0.875rem; /* 文字大小 (14px -> 0.875rem) */
}

/* 自定义确认对话框样式 */
.mm-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  margin: 0 0.625rem;
}

/* 确保对话框内容居中 */
.mm-custom-confirm-dialog .el-message-box__btns {
  display: flex;
  justify-content: center;
}

/* 确保表格在小屏幕设备上可以水平滚动 */
@media screen and (max-width: 768px) {
  .mm-data-table {
    overflow-x: auto;
    contain: content;
  }

  /* 在小屏幕上缩小按钮尺寸 */
  .mm-table-button {
    width: 4rem !important;
    height: 1.8rem !important;
    font-size: 0.8rem;
  }

  /* 小屏幕上的表单元素调整 */
  .mm-centered-input input,
  .mm-selected-input {
    width: 12rem;
  }

  .mm-action-button {
    width: 6rem !important;
  }
}

/* 全局设置确认对话框按钮样式 */
body .mm-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 调整确认对话框按钮间距 */
body .mm-custom-confirm-dialog .el-button + .el-button {
  margin-left: 0.625rem;
}
</style>