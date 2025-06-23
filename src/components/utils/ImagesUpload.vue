<!--
 @Author: leon--ZGJ
 @Create: 2025/2/7 15:37
 @Version: 1.0
 Description:
-->
<template>
  <div class="images-upload">
    <el-upload
        ref="uploadRef"
        v-model:file-list="images"
        action="http://localhost:9090/snack_platform/image/upload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :limit="limit"
        :on-exceed="handleExceed"
        :auto-upload="false"
        :on-progress="handleProgress"
        accept=".jpg,.jpeg,.png,.gif"
        name="file"
    >
      <el-icon>
        <Plus/>
      </el-icon>
      <template #tip>
        <div class="images-upload-tip">
          支持 jpg/png/gif 格式，单个文件不超过 {{ maxSize }}MB
        </div>
      </template>
    </el-upload>

    <!-- 上传按钮 -->
    <div class="images-upload-button" v-if="images.length > 0">
      <el-button
          type="primary"
          @click="submitUpload"
          :loading="uploading"
      >
        {{ uploading ? '上传中...' : '开始上传' }}
      </el-button>
      <el-button @click="clearFiles">
        清空列表
      </el-button>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="images-upload-progress">
      <el-progress
          :percentage="uploadProgress"
          :format="progressFormat"
          status="success"
      />
    </div>

    <el-dialog v-model="dialogVisible" :before-close="handleClose">
      <img w-full :src="dialogImageUrl" alt="Preview Image"/>
    </el-dialog>
  </div>
</template>

<script>

import {Plus} from "@element-plus/icons-vue";
import { v4 as uuidv4 } from 'uuid';

export default {
  name: "ImagesUpload",
  components: {Plus},
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      uploading: false,  // 是否正在上传
      uploadProgress: 0, // 上传进度
      images: [],    // 上传的图片列表
      dialogVisible: false,  // 图片预览弹窗是否显示
      dialogImageUrl: '',  // 图片预览弹窗的图片地址
      limit: 10, // 最大上传数量
      maxSize: 10, // 最大文件大小(MB)
      imagesType: ['image/jpeg', 'image/png', 'image/gif']  // 允许上传的图片类型
    }
  },
  watch: {
    // 简化watch逻辑，避免循环更新
    modelValue: {
      immediate: true, // 确保组件创建时执行一次
      handler(newVal) {
        if (!this.uploading) { // 只在非上传状态时更新
          const newImages = newVal.map(file => ({
            ...file
          }));

          // 比较新旧值，避免无意义的更新
          if (JSON.stringify(this.images) !== JSON.stringify(newImages)) {
            this.images = newImages;
          }
        }
      }
    }
  },
  methods: {
    // 处理图片预览
    handlePictureCardPreview(uploadFile) {
      // 将图片地址赋值给弹窗
      this.dialogImageUrl = uploadFile.url
      // 显示弹窗
      this.dialogVisible = true
    },
    // 处理删除图片
    handleRemove(file, fileList) {

      // 直接使用fileList，避免额外处理
      this.$emit('update:modelValue', fileList.map(f => ({
        ...f
      })));

      // 触发删除事件
      this.$emit('remove', {
        ...file
      });

      // 提示删除成功
      this.$message({
        type: 'success',
        message: '删除成功!'
      });


    },
    // 处理上传图片前
    beforeUpload(file) {

      // 获取文件类型
      const isImageTypes = this.imagesType.includes(file.type)

      // 验证文件类型是否正确
      if (!isImageTypes) {
        this.$message({
          type: 'error',
          message: '只能上传 JPG/PNG/GIF 格式的图片!'
        })
        return false
      }

      // 验证文件大小是否超出限制
      const isImageSize = file.size / 1024 / 1024 < this.maxSize

      // 验证文件大小是否超出限制
      if (!isImageSize) {
        this.$message({
          type: 'error',
          message: `单个文件不超过 ${this.maxSize}MB!`
        })
        return false
      }
      return true
    },
    // 处理上传成功
    handleSuccess(response, uploadFile) {

      // 生成唯一的UID
      // 确保上传成功的文件也有实例ID前缀
      uploadFile.uid = `${Date.now()}_${uuidv4()}`;

      // 更新图片url
      uploadFile.url = response.data.url


      // 直接更新父组件的值
      const newFiles = this.images.map(file =>
          file.uid === uploadFile.uid ? uploadFile : file
      );

      // 触发父组件更新
      this.$emit('update:modelValue', newFiles.map(file => ({
        ...file
      })));

      // 触发上传成功事件
      this.$emit('upload-success', response)

      // 检查是否所有文件都上传完成
      const allUploaded = this.images.every(file => file.status === 'success')
      // 所有文件上传完成
      if (allUploaded) {

        // 重置上传状态
        this.uploading = false
        this.uploadProgress = 0

        this.$message({
          type: 'success',
          message: `所有文件上传完成!,${this.images.length}`
        })

      }
    },
    // 处理上传失败
    handleError(error) {
      this.$emit('upload-error', error)
      this.$message({
        type: 'error',
        message: '上传失败!'
      })
    },
    // 处理文件数量超出限制
    handleExceed() {
      this.$message({
        type: 'warning',
        message: `最多只能上传 ${this.limit} 张图片!`
      })
    },
    // 关闭预览对话框
    handleClose() {
      this.dialogVisible = false
      this.dialogImageUrl = ''
    },
    // 处理上传进度
    handleProgress(event, file, fileList) {
      if (event.percent) {
        this.uploadProgress = Math.round(event.percent)
      }
    },
    // 格式化进度显示
    progressFormat(percentage) {
      const successCount = this.images.filter(file => file.status === 'success').length
      return `${successCount}/${this.images.length} (${percentage}%)`
    },
    // 提交上传
    submitUpload() {

      // 验证是否有图片上传
      if (this.getRealImagesLength() === 0) {
        this.$message({
          type: 'warning',
          message: '请选择图片!'
        })
        return false
      }
      this.uploading = true
      this.uploadProgress = 0
      this.$refs.uploadRef.submit()
    },
    // 获取当前图片列表
    getImages() {
      return this.images
    },

    // 重置组件
    resetFile() {
      this.images = []
      this.dialogVisible = false
      this.dialogImageUrl = ''
    },
    // 清空图片列表
    clearFiles() {
      this.images = []
      this.uploadProgress = 0
      this.uploading = false
      this.dialogVisible = false
      this.dialogImageUrl = ''
      this.$refs.uploadRef.clearFiles()
    },
    // 获取未上传成功的图片数量
    getRealImagesLength() {
      return this.images.filter(file => file.status !== 'success').length
    },
  },
}
</script>

<style scoped>
.images-upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style>