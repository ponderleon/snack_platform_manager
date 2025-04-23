<template>
  <!--背景-->
  <div class="background-container">
    <!--登录 el-row 布局-->
    <el-row class="login-row">
      <!--
         1. 为什么设置 :xs="24" :sm="24" :md="24" :lg="24" :xl="24"
           设置 :xs="24" :sm="24" :md="24" :lg="24" :xl="24"
           的目的是让该列 在所有屏幕尺寸下都占据 100% 的宽度。
           也就是说，无论用户使用的是手机、平板还是桌面，该列都会占满整行。
      -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <!-- 登录容器 -->
        <div class="login-container">
          <!-- 登录部分 -->
          <div class="login">
            <!--登录标题 -->
            <span class="login-title">零食平台-管理系统</span>
            <!-- 登录表单 -->
            <div class="login-form">
              <el-form
                  ref="ruleFormRef"
                  :model="manager"
                  :rules="formRules"
                  status-icon
                  class="login-form-item"
                  label-width="auto">

                <el-form-item prop="username">
                  <el-input style="width: 80%;" v-model="manager.username" type="text" placeholder="请输入账号"/>
                </el-form-item>

                <el-form-item prop="password">
                  <el-input style="width: 80%;" v-model="manager.password" type="password" placeholder="请输入密码"/>
                </el-form-item>

                <el-form-item prop="permissionCode">
                  <el-input style="width: 80%;" v-model="manager.permissionCode" type="password"
                            placeholder="请输入确认密码"/>
                </el-form-item>

                <el-row :gutter="10" class="captcha-row">
                  <el-col :span="16">
                    <el-form-item prop="verificationCode">
                      <el-input style="width: 70%;" v-model="manager.verificationCode" placeholder="请输入验证码"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="7" class="login-captcha">
                    <img style="" :src="captchaImage" @click="refreshCode()" alt="验证码"/>
                  </el-col>
                </el-row>

                <el-form-item class="button-container">
                  <div class="login-button">
                    <el-button type="primary" @click="submitForm()">登录</el-button>
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
          }],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{10,}$/,
            message: '密码必须包含大小写字母和数字，且长度在大于等于10位',
            trigger: 'blur'
          }],
        permissionCode: [{required: true, message: '请输入权限码', trigger: 'blur'},],
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
    // 自定义验证规则，验证账号是否存在
    validateUsername(rule, value, callback) {
      // 发送请求，验证账号是否存在
      this.$http.get("/data/manager/verifyUsername", {
        params: {
          username: value
        }
      }).then(result => {
        // 数据输出测试
        // console.log(result)
        // 判断账号是否存在
        if (result.code === 200) {
          // 账号存在
          callback();
        } else {
          // 账号不存在
          callback(new Error(result.msg));
        }
      })
    },
    /* 刷新验证码 */
    refreshCode() {
      // 从后端获取验证码图片
      this.$http.get("/data/captcha/getCaptcha").then(result => {
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
          this.$http.post("/data/manager/login", {
            username: this.manager.username,
            password: this.manager.password,
            permissionCode: this.manager.permissionCode,
            verificationCode: this.manager.verificationCode
          }).then(result => {
            // console.log(result.code)
            // 判断是否登录成功
            if (result.code === 200) {
              // 登录成功，跳转到管理页面
              this.$message({
                type: "success",
                message: result.msg
              })
              // goto 跳转到管理页面

            } else {
              // 登录失败，显示错误信息
              this.$message({
                type: "error",
                message: result.msg
              })

            }

          }).catch(error => {
            console.log(error)
          })
        }

      })

    },

  }

}
</script>
<style>

/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden; /* 防止滚动条 */
}

/* 背景容器 */
.background-container {
  height: 100vh; /* 占满整个视口高度 */
  width: 100vw; /* 占满整个视口宽度 */
  background-image: url('@/assets/background.jpg'); /* 背景图片路径 */
  background-size: cover; /* 背景图片覆盖整个容器 */
  background-position: center; /* 背景图片居中 */
  background-repeat: no-repeat; /* 背景图片不重复 */
  margin: 0; /* 去除默认的外边距 */
}

/* 登录行样式设置*/
.login-row {
  height: 100%; /* 占满父容器高度 */
  margin: 0; /* 去除默认的外边距 */
}

/* 登录容器 */
.login-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100%; /* 占满父容器高度 */
}

/* 登录部分样式 */
.login {
  width: 100%; /* 占满父容器宽度 */
  max-width: 1100px; /* 最大宽度限制 */
  padding: 2rem; /* 内边距 */
  background-color: rgba(255, 255, 255, 0.1); /* 表单背景色，带透明度 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

/* 登录部分标题样式 */
.login-title {
  font-family: 'Pacifico', cursive; /* 使用 Pacifico 字体 */
  font-size: 2.25rem;; /* 字体大小 */
  color: black; /* 字体颜色 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 文字阴影 */
  display: block; /* 块级元素 */
}

/* 登录部分表单样式 */
.login-form {
  display: flex; /* 使用 flex 布局 */
  width: 100%; /* 占满父容器宽度 */
  max-width: 320px; /* 表单最大宽度 */
  margin: 0 auto; /* 水平居中 */
  padding: 1.25rem;; /* 内边距 */
  background-color: #fff; /* 表单背景色 */
  background-color: rgba(255, 255, 255, 0.5); /* 表单背景色，带透明度 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

/* 登录表单项样式 */
.login-form-item {
  margin: 0 auto;
}

/* 登录表单输入框样式 */
.login-form-item .el-input {
  margin: 0 auto;
}


/* 验证码图片样式 */
.login-captcha {
  margin-left: -1.3rem; /* 左边距 */
  margin-top: -0.2rem; /* 上边距 */
}


/*设置验证码图片样式*/
.login-captcha img {
  width: 100%;
  height: 40px;
  cursor: pointer;
}

/* 按钮容器样式 */
.login-button {
  margin: 0 auto; /* 去除默认的 margin */
}

/* 按钮样式 */
.el-button {
  width: 15rem; /* 按钮宽度 */
}

/* 表单验证错误信息样式 */
.login-form-item .el-form-item__error{
  text-align: left; /* 错误信息居中 */
  width: 80%; /* 确保宽度足够 */
  left: 10%; /* 左边距 */
  font-size: 0.9rem; /* 调整字体大小 */
}

/* 验证码错误信息样式 */
.captcha-row .el-form-item__error{
  left: 15%; /* 左边距 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .login-form {
    max-width: 90%; /* 在小屏幕上缩小表单宽度 */
  }

  .login-title {
    font-size: 1.5rem; /* 小屏幕上字体缩小 */
  }

  .login-button {
    max-width: 100%; /* 小屏幕上按钮占满宽度 */
  }
}
</style>
