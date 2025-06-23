<template>
  <!-- 商户信息修改对话框 -->
  <el-dialog
      title="修改商户信息"
      :close-on-click-modal="false"
      v-model="visible"
      :width="dialogWidth"
      custom-class="compact-dialog">

    <!-- 外层容器用于确保整体居中 -->
    <div class="dialog-center-container">
      <!-- 对话框内容容器 - 用于居中表单 -->
      <div class="dialog-content-wrapper">
        <!-- 商户信息表单 -->
        <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter.native="dataFormSubmit()"
                 :label-width="formLabelWidth" class="compact-form">
          <!-- 商户名称 - 可编辑 -->
          <el-form-item label="商户名称" prop="name">
            <el-input v-model="dataForm.name" placeholder="商户名称"></el-input>
          </el-form-item>

          <!-- 商户账号 - 可编辑 -->
          <el-form-item label="商户账号" prop="username">
            <el-input v-model="dataForm.username" placeholder="商户账号"></el-input>
          </el-form-item>

          <!-- 商户电话 - 可编辑 -->
          <el-form-item label="商户电话" prop="phone">
            <el-input v-model="dataForm.phone" placeholder="商户电话"></el-input>
          </el-form-item>

          <!-- 商户邮箱 - 可编辑 -->
          <el-form-item label="商户邮箱" prop="email">
            <el-input v-model="dataForm.email" placeholder="商户邮箱"></el-input>
          </el-form-item>

          <!-- 商户地址 - 可编辑 -->
          <el-form-item label="商户地址" prop="address">
            <el-input v-model="dataForm.address" placeholder="商户地址"></el-input>
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
    </div>

    <!-- 对话框底部按钮区域 - 居中显示 -->
    <template #footer>
      <div class="centered-footer">
        <!-- 使用compact-button类设置按钮尺寸 -->
        <el-button class="compact-button" @click="visible = false">取消</el-button>
        <el-button class="compact-button" type="primary" @click="dataFormSubmit()">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    // 自定义验证器：验证邮箱格式
    const validateEmail = (rule, value, callback) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (value && !emailRegex.test(value)) {
        callback(new Error('请输入有效的邮箱地址'));
      } else {
        callback();
      }
    };

    return {
      // 控制对话框显示/隐藏
      visible: false,

      // 添加窗口宽度跟踪
      windowWidth: window.innerWidth,

      // 商户数据表单对象
      dataForm: {
        id: 0,            // 商户ID
        name: '',         // 商户名称
        username: '',     // 商户账号
        password: '',     // 商户密码
        phone: '',        // 商户电话
        email: '',        // 商户邮箱
        address: '',      // 商户地址
        isUse: 1          // 是否启用 (0:未启用, 1:启用)
      },

      // 表单验证规则 - 验证所有字段
      dataRule: {
        name: [
          { required: true, message: '商户名称不能为空', trigger: 'change' }
        ],
        username: [
          { required: true, message: '商户账号不能为空', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '电话不能为空', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        isUse: [
          { required: true, message: '启用状态不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 根据窗口宽度动态计算对话框宽度
    dialogWidth() {
      if (this.windowWidth < 576) return '95%';
      if (this.windowWidth < 768) return '80%';
      if (this.windowWidth < 992) return '60%';
      if (this.windowWidth < 1200) return '45%';
      return '30%';
    },

    // 根据窗口宽度动态计算表单标签宽度
    formLabelWidth() {
      if (this.windowWidth < 576) return '5rem';
      if (this.windowWidth < 768) return '5.5rem';
      return '6.25rem';
    }
  },
  mounted() {
    // 添加窗口大小变化监听
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    // 组件销毁前移除监听器
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    // 窗口大小变化处理函数
    handleResize() {
      this.windowWidth = window.innerWidth;
    },

    /**
     * 初始化对话框
     * @param {Number} id - 商户ID
     */
    init(id) {
      console.log("============================",id)
      // 设置商户ID并显示对话框
      this.dataForm.id = id || 0
      this.visible = true

      // 使用nextTick等待DOM更新后再加载数据
      this.$nextTick(() => {
        // 重置表单数据
        this.resetForm()

        // 如果有ID，则获取商户信息
        if (this.dataForm.id) {
          // 发送请求获取商户详细信息
          this.$http.get(`/data/snack_platform/merchant/info/${this.dataForm.id}`).then((data) => {
            if (data && data.code === 200) {
              this.dataForm = data.data.merchant
            }
          })
        }
      });
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
        password: '',
        phone: '',
        email: '',
        address: '',
        isUse: 1
      }

      // 如果表单引用存在，重置表单验证状态
      if (this.$refs.dataFormRef) {
        this.$refs.dataFormRef.resetFields();
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
          // 准备提交数据
          const updateData = {
            id: this.dataForm.id,
            name: this.dataForm.name,
            username: this.dataForm.username,
            phone: this.dataForm.phone,
            email: this.dataForm.email,
            address: this.dataForm.address,
            isUse: this.dataForm.isUse
          }

          // 如果密码字段不为空，则包含在更新数据中
          if (this.dataForm.password) {
            updateData.password = this.dataForm.password;
          }

          // 发送更新请求
          this.$http.put('/data/snack_platform/merchant/update', updateData).then((data) => {
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
              this.$message.error(response.data?.msg || '操作失败')
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
/* 紧凑型对话框样式 - 限制整体对话框大小 */
.compact-dialog {
  margin: 0 auto;       /* 水平居中对话框 */
}

/* 新增：外层居中容器 - 确保内部元素可靠地居中 */
.dialog-center-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 改为顶部对齐，避免因错误信息导致的布局跳动 */
  min-height: 18.75rem;    /* 确保有足够高度实现垂直居中 */
  overflow-y: auto;        /* 在内容过多时允许滚动 */
}

/* 对话框内容容器 - 用于居中表单 */
.dialog-content-wrapper {
  width: 100%;          /* 使用全宽 */
  padding: 0.9375rem;   /* 增加内边距 */
  box-sizing: border-box; /* 确保内边距不增加总宽度 */
  display: flex;          /* 使用flex使表单居中 */
  justify-content: center; /* 表单水平居中 */
}

/* 紧凑型表单样式 - 控制表单大小并使其居中 */
.compact-form {
  width: 70%;           /* 将表单宽度设为70%，减少约三分之一 */
  margin: 0 auto;       /* 水平居中 */
}

/* 控制输入框和下拉框宽度 - 使所有输入控件保持一致宽度 */
.compact-form .el-input,
.compact-form .el-select {
  width: 100% !important; /* 强制应用宽度100% */
}

/* 特定短输入框样式 - 权限输入框专用小尺寸 */
.short-input {
  max-width: 6.25rem !important; /* 减小权限输入框宽度 */
}

/* 减小表单项间距 - 为错误提示留出适当空间但不过宽 */
.el-form-item {
  margin-bottom: 1.5rem !important;  /* 减小表单项间距 */
}

/* 确保错误信息可以完整显示 */
:deep(.el-form-item__error) {
  position: absolute;
  top: 100%;            /* 错误信息紧跟在输入框下方 */
  left: 0;
  padding-top: 0.25rem; /* 错误信息与输入框的间距 */
  font-size: 0.75rem;   /* 错误信息字体大小 */
  line-height: 1.2;     /* 适当的行高 */
  white-space: normal;  /* 允许错误信息换行 */
}

/* 居中显示底部按钮 - 确保按钮组居中对齐 */
.centered-footer {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  padding: 0.3125rem 0;    /* 增加一些内边距 */
  width: 100%;             /* 确保占满全宽，修复居中问题 */
}

/* 按钮样式 - 指定固定宽高和居中 */
.compact-button {
  width: 8rem !important;           /* 指定固定宽度为8rem */
  height: 2rem !important;          /* 指定固定高度为2rem */
  font-size: 0.8125rem !important;  /* 字体大小 */
  line-height: 1 !important;        /* 确保文字垂直居中 */
  margin: 0 0.5rem !important;      /* 按钮间距 */
  display: flex !important;        /* 使用flex布局使内容居中 */
  justify-content: center !important; /* 水平居中内容 */
  align-items: center !important;   /* 垂直居中内容 */
}

/* 针对Element Plus的深度选择器，确保样式能正确应用到组件内部 */
:deep(.el-dialog__body) {
  padding: 0.625rem !important;      /* 减小对话框内部内边距 */
  overflow-y: auto;                  /* 允许内容滚动 */
  max-height: calc(80vh - 9rem);     /* 限制最大高度，避免超出屏幕 */
}

:deep(.el-dialog__footer) {
  padding: 0.625rem 1.25rem 0.9375rem !important; /* 调整底部按钮区域内边距 */
}

/* 自适应媒体查询 - 针对不同屏幕尺寸优化布局 */
@media screen and (max-width: 768px) {
  .compact-form {
    width: 85%;         /* 在中小屏幕上稍微加宽表单 */
  }

  .el-form-item {
    margin-bottom: 1.75rem !important; /* 在小屏幕上保留足够间距 */
  }

  /* 小屏幕上表单项标签和内容垂直排列更清晰 */
  :deep(.el-form-item__label) {
    text-align: left !important;
  }

  .compact-button {
    width: 7rem !important; /* 小屏幕上减小按钮宽度 */
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 576px) {
  .compact-form {
    width: 95%;         /* 在极小屏幕上几乎使用全宽 */
  }

  .el-form-item {
    margin-bottom: 2rem !important; /* 极小屏幕上提供更多空间给错误提示 */
  }

  .compact-button {
    width: 6rem !important; /* 极小屏幕上进一步减小按钮宽度 */
    margin: 0 0.25rem !important; /* 减小按钮间距 */
  }

  :deep(.el-dialog__header) {
    padding: 0.75rem 0.625rem !important; /* 调整对话框标题区域内边距 */
  }

  :deep(.el-dialog__footer) {
    padding: 0.5rem 0.75rem !important; /* 调整底部区域内边距 */
  }
}
</style>