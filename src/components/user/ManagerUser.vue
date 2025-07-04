<template>
  <!-- 用户管理主容器 -->
  <div class="mu-mod-config" style="margin-top: 2rem; height: calc(100vh - 10rem);">
    <!-- 搜索表单区域 -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="mu-search-form">
      <!-- 用户账号搜索输入框 -->
      <el-form-item>
        <el-input v-model="dataForm.username" placeholder="请输入用户账号" class="mu-centered-input" clearable></el-input>
      </el-form-item>
      <!-- 用户启用状态筛选下拉框 -->
      <el-form-item>
        <el-select v-model="dataForm.isUse" placeholder="请选择用户是否启用" class="mu-selected-input" clearable>
          <el-option  :value="1" label="启用"></el-option>
          <el-option :value="0" label="未启用"></el-option>
        </el-select>
      </el-form-item>
      <!-- 操作按钮组 -->
      <el-form-item>
        <el-button class="mu-action-button" type="primary" @click="getDataList()">查询</el-button>
        <el-button class="mu-action-button" type="danger" @click="batchDeleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格容器 - 添加高度限制和滚动 -->
    <div class="mu-table-container">
      <!-- 用户数据表格 - 添加ref引用 -->
      <el-table
          ref="dataTable"
          :data="dataList"
          border
          v-loading="dataListLoading"
          @selection-change="selectionChangeHandle"
          class="mu-data-table">
        <!-- 多选列 -->
        <el-table-column type="selection" header-align="center" align="center" width="50">
        </el-table-column>
        <!-- 名称列 -->
        <el-table-column
            prop="name" header-align="center" align="center" width="200" label="名称">
        </el-table-column>
        <!-- 用户账号列 -->
        <el-table-column
            prop="username" header-align="center" align="center" width="150" label="用户账号">
        </el-table-column>
        <!-- 电话列 -->
        <el-table-column
            prop="phone" header-align="center" align="center" width="150" label="用户电话">
        </el-table-column>
        <!-- 邮箱列 -->
        <el-table-column
            prop="email" header-align="center" align="center" width="300" label="用户邮箱">
        </el-table-column>
        <!-- 住址列 -->
        <el-table-column
            prop="address" header-align="center" align="center" width="200" label="住址">
        </el-table-column>
        <!-- 配送员列 -->
        <el-table-column
            prop="delivery" header-align="center" align="center" width="80" label="配送员">
          <template #default="scope">
            {{ scope.row.delivery === 0 ? '用户' : '配送员' }}
          </template>
        </el-table-column>
        <!-- 权限列 -->
        <el-table-column
            prop="permission" header-align="center" align="center" width="80" label="权限">
        </el-table-column>
        <!-- 启用状态列 - 使用开关组件 -->
        <el-table-column
            prop="isUse" header-align="center" align="center" width="100" label="是否启用">
          <template #default="scope">
            <el-switch
                v-model="scope.row.isUse" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                @change="isUseStatusChange(scope.row)" :active-value="1" :inactive-value="0">
            </el-switch>
          </template>
        </el-table-column>
        <!-- 注册时间列 -->
        <el-table-column
            prop="registerTime" header-align="center" align="center" width="300" label="用户注册时间">
        </el-table-column>
        <!-- 登录时间列 -->
        <el-table-column
            prop="loginTime" header-align="center" align="center" width="300" label="用户登录时间">
        </el-table-column>
        <!-- 操作列 - 改为固定宽度 -->
        <el-table-column
            fixed="right" header-align="center" align="center" width="330" label="操作">
          <template #default="scope">
            <!-- 修改按钮 -->
            <el-button class="mu-table-button" type="primary" size="small"
                       @click="confirmUpdate(scope.row)">修改
            </el-button>
            <!-- 删除按钮 -->
            <el-button class="mu-table-button" type="danger" size="small"
                       @click="confirmDelete(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 - 移动到表格容器内，紧贴表格底部 -->
      <div class="mu-pagination-container">
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

    <!-- 用户信息修改组件 - 条件渲染 -->
    <ManagerUserUpdate v-if="userUpdateVisible" ref="managerUserUpdate" @refreshDataList="getDataList"></ManagerUserUpdate>
  </div>
</template>

<script>
import ManagerUserUpdate from '@/components/user/ManagerUserUpdate.vue'
export default {
  // 组件数据定义
  data() {
    return {
      // 搜索表单数据
      dataForm: {
        username: '',          // 搜索关键字 - 用户账号
        isUse: '' ,        // 用户启用状态筛选
        delivery: ''      // 用户类型筛选 - 添加delivery属性
      },
      dataList: [],       // 表格数据列表
      pageIndex: 1,       // 当前页码
      pageSize: 2,       // 每页显示数量
      totalPage: 10,       // 总记录数
      dataListLoading: false,     // 数据加载状态
      dataListSelections: [],     // 表格多选数据
      userUpdateVisible: false,    // 修改组件是否可见
      resizeTimer: null  // 添加用于防抖的定时器变量
    }
  },
  // 注册子组件
  components: {
    ManagerUserUpdate
  },
  // 监听路由变化，以确保每次路由到这个页面时都会刷新
  watch: {
    '$route': {
      handler(to) {
        // 重置搜索条件
        this.dataForm.username = ''
        this.dataForm.isUse = ''

        // 获取路由查询参数中的delivery
        if (to.query.delivery !== undefined) {
          this.dataForm.delivery = parseInt(to.query.delivery)
        } else {
          this.dataForm.delivery = ''
        }

        // 重置分页
        this.pageIndex = 1

        // 重新获取数据列表
        this.getDataList()
      },
      immediate: true  // 组件创建时立即执行一次
    }
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

    /**
     * 获取用户数据列表
     * 根据搜索条件、分页信息请求后端数据
     */
    getDataList() {
      this.dataListLoading = true  // 显示加载状态

      // 发起API请求
      this.$http.get('/data/snack_platform/user/list', {
        params: {
          'page': this.pageIndex,     // 当前页码
          'limit': this.pageSize,     // 每页显示数量
          'username': this.dataForm.username,   // 搜索关键字
          'isUse': this.dataForm.isUse, // 启用状态筛选
          'delivery': this.dataForm.delivery // 是否为配送员
        }
      }).then((data) => {
        if (data && data.code === 200) {
          // 更新数据和总记录数
          this.dataList = data.data.page.list
          this.totalPage = data.data.page.totalCount

          // 数据加载完成后重新计算表格布局
          this.$nextTick(() => {
            if (this.$refs.dataTable) {
              this.$refs.dataTable.doLayout();
            }
          });
        } else {
          // 请求失败时重置数据
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false  // 隐藏加载状态
      })
    },

    /**
     * 每页显示数量变化处理
     * @param {Number} val - 新的每页显示数量
     */
    sizeChangeHandle(val) {
      this.pageSize = val     // 更新每页显示数量
      this.pageIndex = 1      // 重置为第一页
      this.getDataList()      // 重新获取数据
    },

    /**
     * 当前页变化处理
     * @param {Number} val - 新的当前页码
     */
    currentChangeHandle(val) {
      this.pageIndex = val    // 更新当前页码
      this.getDataList()      // 重新获取数据
    },

    /**
     * 表格多选变化处理
     * @param {Array} val - 当前选中的行数据数组
     */
    selectionChangeHandle(val) {
      this.dataListSelections = val  // 更新选中的数据数组
    },

    /**
     * 确认是否修改用户
     * @param {Object} row - 当前行数据
     */
    confirmUpdate(row) {
      // 显示确认对话框，自定义确认按钮样式
      this.$confirm(`确定要修改用户 "${row.name}" (账号: ${row.username}) 的信息吗?`, '修改确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'mu-custom-confirm-dialog' // 添加自定义类名
      }).then(() => {
        // 用户点击确认后显示修改组件
        this.userUpdateHandle(row.id)
      }).catch(() => {
        // 用户点击取消，不执行任何操作
        this.$message({
          type: 'info',
          message: '已取消修改操作'
        })
      })
    },

    /**
     * 显示用户更新组件
     * @param {Number} id - 用户ID
     */
    userUpdateHandle(id) {
      this.userUpdateVisible = true
      // 等待DOM更新后初始化修改组件
      this.$nextTick(() => {
        this.$refs.managerUserUpdate.init(id)
      })
    },

    /**
     * 确认是否删除单个用户
     * @param {Object} row - 当前行数据
     */
    confirmDelete(row) {
      // 调用删除处理方法，传入用户ID
      this.deleteHandle(row.id, row.username)
    },

    /**
     * 确认是否批量删除用户
     */
    batchDeleteHandle() {
      if (this.dataListSelections.length <= 0) {
        this.$message({
          message: '请先选择要删除的用户',
          type: 'warning'
        })
        return
      }

      // 获取所有选中用户的用户名列表
      const usernames = this.dataListSelections.map(item => item.username).join('、')
      // 调用删除处理方法，不传ID表示批量删除
      this.deleteHandle(null, usernames)
    },

    /**
     * 删除处理方法 - 单个或批量
     * @param {Number|null} id - 要删除的用户ID，为null时表示批量删除
     * @param {String} usernames - 用户名或用户名列表，用于显示在确认提示中
     */
    deleteHandle(id, usernames) {
      // 构建要删除的ID数组
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })

      // 显示确认对话框
      const confirmMessage = id
          ? `确定要删除用户 "${usernames}" 吗?`
          : `确定要批量删除以下用户吗?\n${usernames}`

      this.$confirm(confirmMessage, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'mu-custom-confirm-dialog' // 添加自定义类名
      }).then(() => {
        // 用户确认删除，发送删除请求
        this.$http.delete('/data/snack_platform/user/delete',{data: ids}).then((data) => {
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
     * 修改用户启用状态
     * @param {Object} row - 当前行数据
     */
    isUseStatusChange(row) {
      // 发送状态更新请求
      this.$http.put('/data/snack_platform/user/update', {
        'id': row.id,
        'isUse': row.isUse
      }).then((result) => {
        if (result && result.code === 200) {
          // 更新成功
          this.$message({
            message: `用户 "${row.username}" 已${row.isUse === 1 ? '启用' : '停用'}`,
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
/* 全局样式定义 - 使用mu-前缀 */

/* 主容器样式设置 */
.mu-mod-config {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 10rem); /* 设置容器高度为视口高度减去页面其他部分 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 表格容器样式 - 新增，实现滚动效果 */
.mu-table-container {
  flex: 1; /* 占用剩余空间 */
  overflow-y: auto; /* 垂直方向滚动 */
  overflow-x: auto; /* 水平方向滚动 */
  display: flex;
  flex-direction: column;
}

/* 表格基本样式 - 添加固定布局和性能优化 */
.mu-data-table {
  width: 100%;
  table-layout: fixed; /* 添加固定表格布局 */
  contain: content;    /* 添加性能优化 */
}

/* 搜索表单样式：使用flexbox布局实现居中对齐 */
.mu-search-form {
  display: flex; /* 使用弹性盒子布局 */
  justify-content: center; /* 水平居中对齐表单内的元素 */
  align-items: center; /* 垂直居中对齐表单内的元素 */
  margin-bottom: 0.625rem; /* 底部外边距，与下方内容保持间距 (10px -> 0.625rem) */
}

/* 输入框中的占位文本居中显示 */
.mu-centered-input input::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 输入框中的实际输入文本居中显示 */
.mu-centered-input input {
  text-align: center; /* 使用户输入的文字也居中显示 */
  width: 15rem; /* 输入框宽度 */
  height: 2rem; /* 输入框高度 */
}

/* 下拉框样式保持与输入框一致 */
.mu-selected-input {
  width: 15rem; /* 下拉框宽度 */
  height: 2rem; /* 下拉框高度 */
}

/* 下拉框占位文本居中显示 */
.mu-selected-input .el-input__inner::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 下拉框文本居中显示 - 包括选中的值 */
.mu-selected-input .el-input__inner {
  text-align: center; /* 使选中的值居中显示 */
}

/* 下拉选项居中显示 */
.el-select-dropdown__item {
  text-align: center; /* 下拉选项文字居中显示 */
}

/* 搜索和批量删除按钮 */
.mu-action-button {
  width: 8rem !important;
  height: 2rem !important;
  font-size: 0.875rem; /* 按钮文字大小 (14px -> 0.875rem) */
}

/* 表格内操作按钮样式 */
.mu-table-button {
  width: 5rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
}

/* 分页容器样式 - 新增 */
.mu-pagination-container {
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
.mu-pagination-container .el-pagination {
  font-size: 0.875rem; /* 文字大小 (14px -> 0.875rem) */
}

/* 自定义确认对话框样式 */
.mu-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  margin: 0 0.625rem;
}

/* 确保对话框内容居中 */
.mu-custom-confirm-dialog .el-message-box__btns {
  display: flex;
  justify-content: center;
}

/* 确保表格在小屏幕设备上可以水平滚动 */
@media screen and (max-width: 768px) {
  .mu-data-table {
    overflow-x: auto;
    contain: content;
  }

  /* 在小屏幕上缩小按钮尺寸 */
  .mu-table-button {
    width: 4rem !important;
    height: 1.8rem !important;
    font-size: 0.8rem;
  }

  /* 小屏幕上的表单元素调整 */
  .mu-centered-input input,
  .mu-selected-input {
    width: 12rem;
  }

  .mu-action-button {
    width: 6rem !important;
  }
}

/* 全局设置确认对话框按钮样式 */
body .mu-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 调整确认对话框按钮间距 */
body .mu-custom-confirm-dialog .el-button + .el-button {
  margin-left: 0.625rem;
}
</style>