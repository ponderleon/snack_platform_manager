<template>
  <div class="mod-config" style="margin-top: 2rem">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="search-form">
      <el-form-item>
        <el-input v-model="dataForm.key" placeholder="请输入用户账号" class="centered-input" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.isUse" placeholder="请选择用户是否启用" class="selected-input" clearable>
          <el-option :value="1" label="启用"></el-option>
          <el-option :value="0" label="未启用"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 8rem;height: 2rem" type="primary" @click="getDataList()">查询</el-button>
        <el-button style="width: 8rem;height: 2rem" type="danger" @click="deleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
        :data="dataList"
        border
        v-loading="dataListLoading"
        @selection-change="selectionChangeHandle"
        style="width: 100%;">
      <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50">
      </el-table-column>
      <el-table-column
          prop="name"
          header-align="center"
          align="center"
          width="200"
          label="名称">
      </el-table-column>
      <el-table-column
          prop="username"
          header-align="center"
          align="center"
          width="150"
          label="用户账号">
      </el-table-column>
      <el-table-column
          prop="phone"
          header-align="center"
          align="center"
          width="150"
          label="用户电话">
      </el-table-column>
      <el-table-column
          prop="email"
          header-align="center"
          align="center"
          width="300"
          label="用户邮箱">
      </el-table-column>
      <el-table-column
          prop="address"
          header-align="center"
          align="center"
          width="200"
          label="住址">
      </el-table-column>
      <el-table-column
          prop="delivery"
          header-align="center"
          align="center"
          width="80"
          label="配送员">
      </el-table-column>
      <el-table-column
          prop="permission"
          header-align="center"
          align="center"
          width="80"
          label="权限">
      </el-table-column>
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
          prop="registerTime"
          header-align="center"
          align="center"
          width="300"
          label="用户注册时间">
      </el-table-column>
      <el-table-column
          prop="loginTime"
          header-align="center"
          align="center"
          width="300"
          label="用户登录时间">
      </el-table-column>
      <el-table-column
          fixed="right"
          header-align="center"
          align="center"
          width="auto"
          label="操作">
        <template #default="scope">
          <el-button type="primary" style="width: 5rem;height: 2rem" size="small"
                     @click="userUpdateHandle(scope.row.id)">修改
          </el-button>
          <el-button type="danger" style="width: 5rem;height: 2rem" size="small" @click="deleteHandle(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex; justify-content: center; margin-top: 20px;">
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

    <!-- 弹窗, 新增 / 修改 -->
    <ManagerUserUpdate v-if="userUpdateVisible" ref="managerUserUpdate" @refreshDataList="getDataList"></ManagerUserUpdate>
  </div>
</template>

<script>
import ManagerUserUpdate from '@/components/user/ManagerUserUpdate.vue'
export default {
  data() {
    return {
      dataForm: {
        key: '',
        isUse: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      userUpdateVisible: false
    }
  },
  components: {
    ManagerUserUpdate
  },
  created() {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true
      this.$http.get('/data/snack_platform/user/list', {
        params: {
          'page': this.pageIndex,
          'limit': this.pageSize,
          'key': this.dataForm.key,
          'isUse': this.dataForm.isUse
        }
      }).then((data) => {
        console.log("=============", data)
        if (data && data.code === 200) {
          this.dataList = data.data.page.list
          this.totalPage = data.data.page.totalCount
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })

    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
    // 新增 / 修改
    userUpdateHandle(id) {
      console.log("======================",id)
      this.userUpdateVisible = true
      console.log("======================",this.userUpdateVisible)
      this.$nextTick(() => {
        this.$refs.managerUserUpdate.init(id)
      })
    },
    // 删除
    deleteHandle(id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })
      this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/snack_platform/user/delete'),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      })
    },
    // 设置是否启用状态
    isUseStatusChange(row) {
      // console.log("=====================",row)
      this.$http.put('/data/snack_platform/user/update', {
        'id': row.id,
        'isUse': row.isUse
      }).then((result) => {
        console.log("===================", result)
        if (result && result.code === 200) {
          this.$message({
            message: '操作成功',
            type: 'success',
          })
        } else {
          this.$message.error(result.msg)
          // 如果更新失败，还原状态
          row.isUse = row.isUse === 1 ? 0 : 1
        }
      }).catch(error => {
        console.log("异常为： ", error)
      })
    }
  }
}
</script>
<style>

/* 搜索表单样式：使用flexbox布局实现居中对齐 */
.search-form {
  display: flex; /* 使用弹性盒子布局 */
  justify-content: center; /* 水平居中对齐表单内的元素 */
  align-items: center; /* 垂直居中对齐表单内的元素 */
  margin-bottom: 10px; /* 底部外边距，与下方内容保持间距 */
}

/* 输入框中的占位文本居中显示 */
.centered-input input::placeholder {
  text-align: center; /* 使placeholder文字居中显示 */
}

/* 输入框中的实际输入文本居中显示 */
.centered-input input {
  text-align: center; /* 使用户输入的文字也居中显示 */
  width: 15rem;
  height: 2rem;
}

/* 下拉框样式保持与输入框一致 */
.selected-input {
  width: 15rem;
  height: 2rem;
}

/* 下拉框占位文本居中显示 */
.selected-input .el-input__inner::placeholder {
  text-align: center;
}

/* 下拉选项居中显示 */
.el-select-dropdown__item {
  text-align: center;
}

</style>