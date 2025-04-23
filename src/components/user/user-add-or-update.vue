<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="用户名称" prop="name">
      <el-input v-model="dataForm.name" placeholder="用户名称"></el-input>
    </el-form-item>
    <el-form-item label="用户账号" prop="username">
      <el-input v-model="dataForm.username" placeholder="用户账号"></el-input>
    </el-form-item>
    <el-form-item label="用户密码" prop="password">
      <el-input v-model="dataForm.password" placeholder="用户密码"></el-input>
    </el-form-item>
    <el-form-item label="用户电话" prop="phone">
      <el-input v-model="dataForm.phone" placeholder="用户电话"></el-input>
    </el-form-item>
    <el-form-item label="用户邮箱" prop="email">
      <el-input v-model="dataForm.email" placeholder="用户邮箱"></el-input>
    </el-form-item>
    <el-form-item label="是否是配送员 0-表示不是 1-表示是" prop="delivery">
      <el-input v-model="dataForm.delivery" placeholder="是否是配送员 0-表示不是 1-表示是"></el-input>
    </el-form-item>
    <el-form-item label="用户权限" prop="permission">
      <el-input v-model="dataForm.permission" placeholder="用户权限"></el-input>
    </el-form-item>
    <el-form-item label="用户是否能够使用该账号 0-表示不能使用 1-表示能使用" prop="isUse">
      <el-input v-model="dataForm.isUse" placeholder="用户是否能够使用该账号 0-表示不能使用 1-表示能使用"></el-input>
    </el-form-item>
    <el-form-item label="用户住址" prop="address">
      <el-input v-model="dataForm.address" placeholder="用户住址"></el-input>
    </el-form-item>
    <el-form-item label="用户注册时间" prop="registerTime">
      <el-input v-model="dataForm.registerTime" placeholder="用户注册时间"></el-input>
    </el-form-item>
    <el-form-item label="用户登录时间" prop="loginTime">
      <el-input v-model="dataForm.loginTime" placeholder="用户登录时间"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          name: '',
          username: '',
          password: '',
          phone: '',
          email: '',
          delivery: '',
          permission: '',
          isUse: '',
          address: '',
          registerTime: '',
          loginTime: ''
        },
        dataRule: {
          name: [
            { required: true, message: '用户名称不能为空', trigger: 'blur' }
          ],
          username: [
            { required: true, message: '用户账号不能为空', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '用户密码不能为空', trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '用户电话不能为空', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '用户邮箱不能为空', trigger: 'blur' }
          ],
          delivery: [
            { required: true, message: '是否是配送员 0-表示不是 1-表示是不能为空', trigger: 'blur' }
          ],
          permission: [
            { required: true, message: '用户权限不能为空', trigger: 'blur' }
          ],
          isUse: [
            { required: true, message: '用户是否能够使用该账号 0-表示不能使用 1-表示能使用不能为空', trigger: 'blur' }
          ],
          address: [
            { required: true, message: '用户住址不能为空', trigger: 'blur' }
          ],
          registerTime: [
            { required: true, message: '用户注册时间不能为空', trigger: 'blur' }
          ],
          loginTime: [
            { required: true, message: '用户登录时间不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/snack_platform/user/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.name = data.user.name
                this.dataForm.username = data.user.username
                this.dataForm.password = data.user.password
                this.dataForm.phone = data.user.phone
                this.dataForm.email = data.user.email
                this.dataForm.delivery = data.user.delivery
                this.dataForm.permission = data.user.permission
                this.dataForm.isUse = data.user.isUse
                this.dataForm.address = data.user.address
                this.dataForm.registerTime = data.user.registerTime
                this.dataForm.loginTime = data.user.loginTime
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/snack_platform/user/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'name': this.dataForm.name,
                'username': this.dataForm.username,
                'password': this.dataForm.password,
                'phone': this.dataForm.phone,
                'email': this.dataForm.email,
                'delivery': this.dataForm.delivery,
                'permission': this.dataForm.permission,
                'isUse': this.dataForm.isUse,
                'address': this.dataForm.address,
                'registerTime': this.dataForm.registerTime,
                'loginTime': this.dataForm.loginTime
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
  }
</script>
