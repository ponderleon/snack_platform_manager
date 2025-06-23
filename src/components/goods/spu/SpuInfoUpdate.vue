<template>
  <!-- 商品信息修改对话框 -->
  <el-dialog
      title="修改商品信息"
      :close-on-click-modal="false"
      v-model="visible"
      :width="dialogWidth"
      custom-class="compact-dialog">

    <!-- 外层容器用于确保整体居中 -->
    <div class="dialog-center-container">
      <!-- 对话框内容容器 - 用于居中表单 -->
      <div class="dialog-content-wrapper">
        <!-- 商品信息表单 -->
        <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter.native="dataFormSubmit()"
                 :label-width="formLabelWidth" class="compact-form">
          <!-- 商品名称 -->
          <el-form-item label="商品名称" prop="spuName">
            <el-input v-model="dataForm.spuName" placeholder="请输入商品名称"></el-input>
          </el-form-item>

          <!-- 商家账号 -->
          <el-form-item label="商家账号" prop="merchantUsername">
            <el-input v-model="dataForm.merchantUsername" placeholder="请输入商家账号"></el-input>
          </el-form-item>

          <!-- 所属分类 -->
          <el-form-item label="所属分类" prop="categoryId">
            <el-cascader
                v-model="cascadedCategoryId"
                :options="categories"
                :props="categoryProps"
                @change="handleCategoryChange"
                filterable
                placeholder="请选择分类"
            ></el-cascader>
          </el-form-item>

          <!-- 所属品牌 -->
          <el-form-item label="所属品牌" prop="brandId">
            <el-select
                v-model="dataForm.brandId"
                placeholder="请选择品牌"
                filterable
                clearable
            >
              <el-option
                  v-for="item in brands"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 上架状态 -->
          <el-form-item label="上架状态" prop="publicStatus">
            <el-select v-model="dataForm.publicStatus" placeholder="请选择上架状态">
              <el-option label="新建" :value="0"></el-option>
              <el-option label="已上架" :value="1"></el-option>
              <el-option label="已下架" :value="2"></el-option>
            </el-select>
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
    return {
      // 控制对话框显示/隐藏
      visible: false,

      // 级联选择器选中的路径
      cascadedCategoryId: [],

      // 分类树数据
      categories: [],

      // 品牌数据
      brands: [],

      // 级联选择器配置
      categoryProps: {
        value: 'id',
        label: 'name',
        children: 'childrenCategories'
      },

      // 添加窗口宽度跟踪
      windowWidth: window.innerWidth,

      // 商品数据表单对象
      dataForm: {
        id: 0,               // 商品ID
        spuName: '',         // 商品名称
        merchantUsername: '', // 商家账号
        categoryId: 0,       // 分类ID
        brandId: 0,          // 品牌ID
        publicStatus: 0,     // 上架状态
      },

      // 表单验证规则
      dataRule: {
        spuName: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        merchantUsername: [
          { required: true, message: '商家账号不能为空', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '分类不能为空', trigger: 'change' },
          { type: 'number', message: '分类ID必须为数字', trigger: 'blur' }
        ],
        brandId: [
          { required: true, message: '品牌不能为空', trigger: 'change' },
          { type: 'number', message: '品牌ID必须为数字', trigger: 'blur' }
        ],
        publicStatus: [
          { required: true, message: '上架状态不能为空', trigger: 'change' }
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

    // 级联选择器选择变更处理
    handleCategoryChange(value) {
      // 如果选择了分类，从级联数组的最后一个元素获取分类ID
      if (value && value.length > 0) {
        this.dataForm.categoryId = value[value.length - 1];
      } else {
        this.dataForm.categoryId = 0;
      }
    },

    /**
     * 初始化修改对话框
     * @param {Number} id - 要修改的商品ID
     * @param {Array} categoryPath - 分类路径(可选)
     */
    init(id, categoryPath = []) {
      if (!id) {
        this.$message.error('未指定要修改的商品ID');
        return;
      }

      // 设置商品ID并显示对话框
      this.dataForm.id = id;
      this.visible = true;

      // 使用nextTick等待DOM更新后再加载数据
      this.$nextTick(() => {
        // 重置表单数据
        this.resetForm();

        // 如果提供了分类路径，先保存起来
        this.providedCategoryPath = categoryPath;

        // 获取分类树形数据
        this.getCascaderCategoryTree().then(() => {
          // 加载商品详细信息
          this.loadSpuInfo(id);
        });

        // 获取品牌数据
        this.getBrands();
      });
    },

    /**
     * 加载商品详细信息
     * @param {Number} id - 商品ID
     */
    loadSpuInfo(id) {
      this.$http.get(`/data/snack_platform/spuinfo/info/${id}`).then((data) => {
        if (data && data.code === 200) {
          // 填充表单数据
          this.dataForm = data.data;

          // 设置级联选择器的值
          if (this.providedCategoryPath && this.providedCategoryPath.length > 0) {
            // 如果父组件提供了分类路径，优先使用
            this.cascadedCategoryId = this.providedCategoryPath;
          } else if (data.data.cascadedCategoryId && Array.isArray(data.data.cascadedCategoryId)) {
            // 如果后端返回了分类路径，使用后端返回的
            this.cascadedCategoryId = data.data.cascadedCategoryId;
          } else if (this.dataForm.categoryId) {
            // 如果只有分类ID，尝试查找对应的路径
            this.findCategoryPath(this.dataForm.categoryId);
          }

        } else {
          this.$message.error(data?.msg || '获取商品信息失败');
        }
      }).catch(error => {
        console.error('获取商品信息失败:', error);
        this.$message.error('获取商品信息失败');
      });
    },

    /**
     * 查找分类路径
     * @param {Number} categoryId - 分类ID
     */
    findCategoryPath(categoryId) {
      if (!categoryId) return;

      // 通过递归查找分类路径
      const path = this.searchCategoryPath(this.categories, categoryId);
      if (path) {
        this.cascadedCategoryId = path;
      } else {
        // 如果找不到路径，至少设置当前分类ID
        this.cascadedCategoryId = [categoryId];
      }
    },

    /**
     * 递归搜索分类路径
     * @param {Array} categories - 分类树
     * @param {Number} targetId - 目标分类ID
     * @param {Array} currentPath - 当前路径
     * @returns {Array|null} - 找到的路径或null
     */
    searchCategoryPath(categories, targetId, currentPath = []) {
      if (!categories || categories.length === 0) return null;

      for (const category of categories) {
        // 构建当前路径
        const newPath = [...currentPath, category.id];

        // 如果找到目标ID，返回完整路径
        if (category.id === targetId) {
          return newPath;
        }

        // 如果有子分类，递归搜索
        if (category.childrenCategories && category.childrenCategories.length > 0) {
          const result = this.searchCategoryPath(category.childrenCategories, targetId, newPath);
          if (result) return result;
        }
      }

      return null;
    },

    /**
     * 获取分类树形数据
     */
    async getCascaderCategoryTree() {
      try {
        const data = await this.$http.get('/data/snack_platform/category/tree');
        if (data && data.code === 200) {
          this.categories = data.data;
          return true;
        } else {
          this.$message.error(data?.msg || '获取分类数据失败');
          return false;
        }
      } catch (error) {
        console.error('获取分类树失败:', error);
        this.$message.error('获取分类树失败');
        return false;
      }
    },

    /**
     * 获取品牌数据
     */
    async getBrands() {
      try {
        const data = await this.$http.get('/data/snack_platform/brand/list');

        if (data && data.code === 200) {
          this.brands = data.data.page.list;
          return true;
        } else {
          this.$message.error(data?.msg || '获取品牌数据失败');
          return false;
        }
      } catch (error) {
        console.error('获取品牌数据失败:', error);
        this.$message.error('获取品牌数据失败');
        return false;
      }
    },

    /**
     * 重置表单数据为默认值
     */
    resetForm() {
      // 记住原来的ID
      const originalId = this.dataForm.id;

      // 重置表单数据，保留ID
      this.dataForm = {
        id: originalId,
        spuName: '',
        merchantUsername: '',
        categoryId: 0,
        brandId: 0,
        publicStatus: 0
      };

      // 清空级联选择器
      this.cascadedCategoryId = [];
      this.providedCategoryPath = [];

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
      const formRef = this.$refs.dataFormRef;
      if (!formRef) {
        console.error('表单引用不存在');
        return;
      }

      // 验证表单
      formRef.validate((valid) => {
        if (valid) {
          // 检查是否选择了分类和品牌
          if (!this.dataForm.categoryId) {
            this.$message.error('请选择分类');
            return;
          }

          if (!this.dataForm.brandId) {
            this.$message.error('请选择品牌');
            return;
          }

          // 准备提交的数据
          const submitData = {
            ...this.dataForm,
            cascadedCategoryId: this.cascadedCategoryId // 同时提交分类路径
          };

          // 发送更新请求
          this.$http.put('/data/snack_platform/spuinfo/update', submitData).then((data) => {
            if (data && data.code === 200) {
              // 操作成功提示
              this.$message({
                message: '修改成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  // 关闭对话框并通知父组件刷新列表
                  this.visible = false;
                  this.$emit('refreshDataList');
                }
              });
            } else {
              // 操作失败提示
              this.$message.error(data?.msg || '修改失败');
            }
          }).catch(error => {
            console.error('修改失败:', error);
            this.$message.error('修改失败');
          });
        }
      });
    }
  }
};
</script>

<style scoped>
/* 紧凑型对话框样式 - 限制整体对话框大小 */
.compact-dialog {
  margin: 0 auto;       /* 水平居中对话框 */
}

/* 外层居中容器 - 确保内部元素可靠地居中 */
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
  width: 80%;           /* 将表单宽度设为80%，稍微宽一些以容纳更多内容 */
  margin: 0 auto;       /* 水平居中 */
}

/* 控制输入框和下拉框宽度 - 使所有输入控件保持一致宽度 */
.compact-form .el-input,
.compact-form .el-select,
.compact-form .el-cascader {
  width: 100% !important; /* 强制应用宽度100% */
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

/* 针对级联选择器的样式 */
:deep(.el-cascader) {
  width: 100% !important;
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
    width: 90%;         /* 在中小屏幕上稍微加宽表单 */
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