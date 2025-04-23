<template>
  <!-- 用户信息修改对话框 -->
  <el-dialog
      title="修改用户信息"
      :close-on-click-modal="false"
      v-model="visible"
      width="30%"
      custom-class="compact-dialog">

    <!-- 对话框内容容器 - 用于居中表单 -->
    <div class="dialog-content-wrapper">
      <!-- 用户信息表单 -->
      <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter.native="dataFormSubmit()"
               label-width="100px" class="compact-form">
        <!-- 用户名称 - 只读 -->
        <el-form-item label="名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="名称" disabled></el-input>
        </el-form-item>

        <!-- 用户账号 - 只读 -->
        <el-form-item label="用户账号" prop="username">
          <el-input v-model="dataForm.username" placeholder="用户账号" disabled></el-input>
        </el-form-item>

        <!-- 用户电话 - 只读 -->
        <el-form-item label="用户电话" prop="phone">
          <el-input v-model="dataForm.phone" placeholder="用户电话" disabled></el-input>
        </el-form-item>

        <!-- 用户邮箱 - 只读 -->
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="dataForm.email" placeholder="用户邮箱" disabled></el-input>
        </el-form-item>

        <!-- 用户住址 - 只读 -->
        <el-form-item label="住址" prop="address">
          <el-input v-model="dataForm.address" placeholder="住址" disabled></el-input>
        </el-form-item>

        <!-- 配送员状态 - 只读 -->
        <el-form-item label="配送员" prop="delivery">
          <el-select v-model="dataForm.delivery" placeholder="请选择" disabled>
            <el-option :value="1" label="是"></el-option>
            <el-option :value="0" label="否"></el-option>
          </el-select>
        </el-form-item>

        <!-- 权限设置 - 可编辑，直接输入 -->
        <el-form-item label="权限" prop="permission">
          <el-input v-model.number="dataForm.permission" placeholder="请输入权限值" class="short-input"></el-input>
        </el-form-item>

        <!-- 是否启用开关 - 可编辑 -->
        <el-form-item label="是否启用" prop="isUse">
          <el-switch
              v-model="dataForm.isUse"
              :active-value="1"
              :inactive-value="0"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949">
          </el-switch>
        </el-form-item>
      </el-form>
    </div>

    <!-- 对话框底部按钮区域 - 居中显示 -->
    <template #footer>
      <div class="centered-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      // 控制对话框显示/隐藏
      visible: false,

      // 用户数据表单对象
      dataForm: {
        id: 0,            // 用户ID
        name: '',         // 用户名称
        username: '',     // 用户账号
        phone: '',        // 用户电话
        email: '',        // 用户邮箱
        address: '',      // 用户住址
        delivery: 0,      // 是否是配送员 (0:否, 1:是)
        permission: 0,    // 用户权限 (数值输入)
        isUse: 1          // 是否启用 (0:未启用, 1:启用)
      },

      // 表单验证规则 - 只验证可编辑字段
      dataRule: {
        permission: [
          { required: true, message: '权限不能为空', trigger: 'blur' },
          { type: 'number', message: '权限必须为数字', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    /**
     * 初始化对话框
     * @param {Number} id - 用户ID
     */
    init(id) {
      // 设置用户ID并显示对话框
      this.dataForm.id = id || 0
      this.visible = true

      // 重置表单数据
      this.resetForm()

      // 如果有ID，则获取用户信息
      if (this.dataForm.id) {
        // 发送请求获取用户详细信息
        this.$http.get(`/data/snack_platform/user/info/${this.dataForm.id}`).then((data) => {
          if (data && data.code === 200) {
            console.log("===========================", data)
            this.dataForm = data.data.user; // 填充表单数据
          }
        })
      }
    },

    /**
     * 重置表单数据为默认值
     */
    resetForm() {
      // 手动重置表单数据，保留ID
      this.dataForm = {
        id: this.dataForm.id,
        name: '',
        username: '',
        phone: '',
        email: '',
        address: '',
        delivery: 0,
        permission: 0,
        isUse: 1
      }
    },

    /**
     * 表单提交处理
     * 验证表单并提交更新请求
     */
    dataFormSubmit() {
      // 获取表单引用
      const formRef = this.$refs.dataFormRef
      if (!formRef) {
        console.error('表单引用不存在')
        return
      }

      // 验证表单
      formRef.validate((valid) => {
        if (valid) {
          // 只提交需要更新的字段：ID、权限和是否使用
          const updateData = {
            id: this.dataForm.id,
            permission: this.dataForm.permission,
            isUse: this.dataForm.isUse
          }

          // 发送更新请求
          this.$http.put('/data/snack_platform/user/update', updateData).then((data) => {
            if (data && data.code === 200) {
              // 更新成功提示
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  // 关闭对话框并通知父组件刷新列表
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              // 更新失败提示
              this.$message.error(data?.msg || '操作失败')
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
/* 紧凑型对话框样式 */
.compact-dialog {
  max-width: 400px;     /* 限制最大宽度 */
}

/* 对话框内容容器 - 用于居中表单 */
.dialog-content-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 紧凑型表单样式 */
.compact-form {
  width: 85%;           /* 表单宽度 */
}

/* 控制输入框和下拉框宽度 */
.compact-form .el-input,
.compact-form .el-select {
  width: 200px;         /* 统一宽度 */
}

/* 特定短输入框样式 */
.short-input {
  width: 150px !important; /* 权限输入框宽度 */
}

/* 减小表单项间距 */
.el-form-item {
  margin-bottom: 15px;  /* 减小间距使表单更紧凑 */
}

/* 居中显示底部按钮 */
.centered-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 底部按钮间距 */
.centered-footer .el-button {
  margin: 0 10px;
}
</style>