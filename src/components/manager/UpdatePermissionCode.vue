<!--
 @Author: leon--ZGJ
 @Create: 2025/1/10 16:45
 @Version: 1.0
 Description:
-->
<template>
  <!--背景-->
  <div class="background-container">
    <!--修改密码 el-row 布局-->
    <el-row class="update-permission-code-row">
      <!--
         1. 为什么设置 :xs="24" :sm="24" :md="24" :lg="24" :xl="24"
           设置 :xs="24" :sm="24" :md="24" :lg="24" :xl="24"
           的目的是让该列 在所有屏幕尺寸下都占据 100% 的宽度。
           也就是说，无论用户使用的是手机、平板还是桌面，该列都会占满整行。
      -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <!-- 修改密码容器 -->
        <div class="update-permission-code-container">
          <!-- 修改密码部分部分 -->
          <div class="update-permission-code">
            <!--修改密码标题 -->
            <span class="update-permission-code-title">管理系统-权限码修改</span>
            <!-- 修改密码表单 -->
            <div class="update-permission-code-form">
              <el-form
                  ref="ruleFormRef"
                  :model="manager"
                  :rules="formRules"
                  status-icon
                  class="update-permission-code-el-form"
                  label-width="auto">

                <el-form-item prop="username">
                  <el-input style="width: 70%;" v-model="manager.username" type="text" placeholder="请输入账号"/>
                </el-form-item>
                

                <el-form-item prop="password">
                  <el-input style="width: 70%;" v-model="manager.password" type="password" placeholder="请输入密码"/>
                </el-form-item>

                <el-form-item prop="oldPermissionCode">
                  <el-input style="width: 70%;" v-model="manager.oldPermissionCode" type="password"
                            placeholder="请输入旧权限码"/>
                </el-form-item>

                <el-form-item prop="permissionCode">
                  <el-input style="width: 70%;" v-model="manager.permissionCode" type="password"
                            placeholder="请输入新权限密码"/>
                </el-form-item>

                <el-form-item prop="verificationCode">
                  <el-input style="width: 30%;margin-left: 3.8rem;margin-right:3.5rem" v-model="manager.verificationCode" placeholder="请输入验证码"/>
                  <img style="width: 100px;height: 40px;" :src="captchaImage" @click="refreshCode()" alt="验证码"/>
                </el-form-item>

                <el-form-item class="update-permission-code-button-container">
                  <div class="update-permission-code-button">
                    <el-row :gutter="30">
                      <el-col :span="12">
                        <el-button type="primary" @click="submitForm()">修改</el-button>
                      </el-col>
                      <el-col :span="12">
                        <el-button @click="resetForm()">重置</el-button>
                      </el-col>
                    </el-row>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'MainView',
  data() {
    return {
      /* 验证码图片 */
      captchaImage: require('@/assets/temp-manage.png'),
      /* 管理者对象*/
      manager: {
        username: '',
        password: '',
        oldPermissionCode: '',
        permissionCode: '',
        verificationCode: ''
      },
      /* 表单验证规则 */
      formRules: {
        username: [
          {required: true, message: '请输入账号', trigger: 'blur'},
          {pattern: /^\d{9}$/, message: '账号必须是9位数字', trigger: 'blur'},
          {
            validator: this.validateUsername,
            trigger: 'blur'
          }, {
            validator: this.validateLoginUsername,
            trigger: 'blur'
          }],
        password: [
          {required: true, message: '请输入新的密码', trigger: 'blur'},
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{6,}$/,
            message: '密码必须包含大小写字母和数字，且长度在大于等于6位',
            trigger: 'blur'
          }],
        oldPermissionCode: [
          {required: true, message: '请输入旧权限码', trigger: 'blur'},
         ],
        permissionCode: [{required: true, message: '请输入新权限码', trigger: 'blur'},],
        verificationCode: [
          {required: true, message: '请输入验证码', trigger: 'blur'}],
      },
    }
  },
  /* 页面加载完成时的处理函数 */
  created() {
    this.refreshCode();
  },
  methods: {

    /**
     * 验证是否是要修改登录的账号
     * @param rule
     * @param value
     * @param callback
     */
    validateLoginUsername(rule, value, callback) {
      const tempUsername = this.$store.getters.getManager.username

      if (value === tempUsername) {
        // 账号存在
        callback();
      } else {
        // 账号不存在
        callback(new Error('请输入登录账号'));
      }

    },
    // 自定义验证规则，验证账号是否存在
    validateUsername(rule, value, callback) {
      // 发送请求，验证账号是否存在
      this.$http.get("/data/snack_platform/manager/verifyUsername", {
        params: {
          username: value
        }
      }).then(data => {
        // 数据输出测试
        // console.log(result)
        // 判断账号是否存在
        if (data && data.code === 200) {
          // 账号存在
          callback();
        } else {
          // 账号不存在
          callback(new Error(data.msg));
        }
      })
    },
    /* 刷新验证码 */
    refreshCode() {
      // 从后端获取验证码图片
      this.$http.get("/data/snack_platform/captcha/getCaptcha").then(result => {
        // 判断是否获取到验证码图片
        if (result.image) {
          // 成功获取验证码图片
          this.captchaImage = result.image;
        }
      }).catch(error => {
        console.log(error)
      })
    },
    /* 提交表单 */
    submitForm() {
      // 验证表单
      this.$refs['ruleFormRef'].validate((valid) => {
        //  如果验证通过，则提交表单
        if (valid) {
          // 发送登录请求
          this.$http.put("/data/snack_platform/manager/updatePermissionCode", this.manager).then(data => {
            // console.log("---------------",data)
            // 判断是否登录成功
            if (data && data.code === 200) {
              // 登录成功，跳转到管理页面
              this.$message({
                type: "success",
                message: "修改成功"
              })
              // 可以重置表单或者跳转到登录页
              this.resetForm();

              // 清除本地存储的登录信息
              this.$store.dispatch('loginOut')

              // 延迟0.5秒后跳转到首页
              setTimeout(() => {
                this.$router.push('/');
              }, 500);


            } else {

              // 登录失败，显示错误信息
              this.$message({
                type: "error",
                message: data.msg
              })

              //  刷新验证码
              this.refreshCode();

            }

          }).catch(error => {
            console.log(error)
          })
        }

      })

    },
    /* 重置表单 */
    resetForm() {
      this.manager = {
        username: '',
        password: '',
        oldPermissionCode: '',
        permissionCode: '',
        verificationCode: ''
      }
    }
  }

}
</script>

<style scoped>
/* 背景容器 */
.background-container {
  height: 100%; /* 占满整个视口高度 */
  width: 100%; /* 占满整个视口宽度 */
  background-image: url('@/assets/background.jpg'); /* 背景图片路径 */
  background-size: cover; /* 背景图片覆盖整个容器 */
  background-position: center; /* 背景图片居中 */
  background-repeat: no-repeat; /* 背景图片不重复 */
  margin: 0; /* 去除默认的外边距 */
}

/* 修改密码行样式设置*/
.update-permission-code-row {
  height: 100%; /* 占满父容器高度 */
  margin: 0; /* 去除默认的外边距 */
}

/* 修改密码容器 */
.update-permission-code-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100%; /* 占满父容器高度 */
}

/* 修改密码部分样式 */
.update-permission-code {
  width: 100%; /* 占满父容器宽度 */
  max-width: 1100px; /* 最大宽度限制 */
  padding: 2rem; /* 内边距 */
  background-color: rgba(255, 255, 255, 0.1); /* 表单背景色，带透明度 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

/* 修改密码部分标题样式 */
.update-permission-code-title {
  font-family: 'Pacifico', cursive; /* 使用 Pacifico 字体 */
  font-size: 2.25rem;; /* 字体大小 */
  color: black; /* 字体颜色 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 文字阴影 */
  display: block; /* 块级元素 */
}

/* 修改密码部分表单样式 */
.update-permission-code-form {
  display: flex;
  width: 100%; /* 占满父容器宽度 */
  max-width: 400px; /* 表单最大宽度 */
  margin: 0 auto; /* 水平居中 */
  padding: 1.25rem;; /* 内边距 */
  background-color: #fff; /* 表单背景色 */
  background-color: rgba(255, 255, 255, 0.5); /* 表单背景色，带透明度 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

.update-permission-code-el-form {
  margin: 0 auto;
}

/* 增加输入框高度 */
.update-permission-code-el-form .el-input {
  margin: 2px auto;
}

/* 统一设置输入框高度 */
:deep(.el-input__inner) {
  height: 35px; /* 增加输入框高度 */

}

/* 表单校验错误信息样式 - 保持原有高度，与表单对齐 */
:deep(.el-form-item__error) {
  position: absolute; /* 使用绝对定位不占用布局空间 */
  left: 15%; /* 左边距与输入框对齐 */
  top: 100%; /* 定位到表单项底部 */
  text-align: left; /* 错误信息左对齐 */
  color: #f56c6c; /* 错误信息颜色 */
  font-size: 15px; /* 错误信息字体大小 */
  line-height: 1.2; /* 保持紧凑的行高 */
  width: 70%; /* 与输入框宽度一致 */
  padding-top: 4px; /* 与输入框保持距离 */
}

/* 为验证码输入框的错误信息特别调整 */
:deep(.el-form-item[prop="verificationCode"] .el-form-item__error) {
  left: calc(3.8rem + 15%); /* 与验证码输入框对齐 */
  width: 30%; /* 与验证码输入框宽度一致 */
}

/* 增加表单项间距，但不要太大 */
:deep(.el-form-item) {
  margin-bottom: 22px; /* 适当的表单项间距 */
}



/* 按钮容器样式 */
.update-permission-code-button {
  margin: 0 auto; /* 去除默认的 margin */
}

/* 按钮样式 - 增加高度与输入框一致 */
.el-button {
  width: 7.5rem; /* 按钮宽度 */
  height: 42px; /* 增加按钮高度与输入框一致 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .update-permission-code-form {
    max-width: 90%; /* 在小屏幕上缩小表单宽度 */
  }

  .update-permission-code-title {
    font-size: 1.5rem; /* 小屏幕上字体缩小 */
  }

  .update-permission-code-button {
    max-width: 100%; /* 小屏幕上按钮占满宽度 */
  }

  /* 响应式调整错误信息样式 */
  :deep(.el-form-item__error) {
    left: 15%; /* 保持左边距 */
  }

  :deep(.el-form-item[prop="verificationCode"] .el-form-item__error) {
    left: calc(3.8rem + 5%); /* 调整验证码输入框错误信息对齐 */
  }
}
</style>