<template>
  <!-- 商品分类管理页面主容器 -->
  <div class="cm-category-manager-container">
    <el-row :gutter="16" class="cm-full-height">
      <!-- 左侧分类树部分 -->
      <el-col :xs="24" :sm="8" :md="6" :lg="5" :xl="4" class="cm-category-tree-col">
        <!-- 搜索框 -->
        <div class="cm-tree-search-container">
          <el-input
              v-model="treeSearchKey"
              placeholder="搜索分类名称"
              clearable
              prefix-icon="el-icon-search"
              @input="filterCategoryTree"
          ></el-input>
        </div>

        <!-- 分类树组件 -->
        <div class="cm-category-tree-wrapper">
          <el-tree
              class="cm-category-tree-container"
              :data="filteredCategories"
              :props="categoriesProps"
              show-checkbox
              node-key="id"
              :default-expanded-keys="expandedKeys"
              :default-checked-keys="checkedKeys"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              ref="categoryTree"
              @check="handleTreeCheck"
          >
            <template #default="{ node, data }">
              <!-- 自定义节点标签 -->
              <span class="cm-category-tree-node">
                <span class="cm-node-label">{{ node.label }}</span>
                <!-- 按钮组 -->
                <span class="cm-category-tree-button-group">
                  <el-button
                      v-if="node.level <= 2"
                      class="cm-category-tree-button-group-add"
                      type="text"
                      size="mini"
                      @click.stop="handleAdd(data, node)"
                  >添加</el-button>
                  <el-button
                      v-if="(node.childNodes.length === 0 || !data.childrenCategories || data.childrenCategories.length === 0) && data.id != 1314"
                      type="text"
                      size="mini"
                      @click.stop="handleDelete(data)"
                  >删除</el-button>
                  <el-button
                      type="text"
                      size="mini"
                      @click.stop="handleEdit(data)"
                  >编辑</el-button>
                </span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-col>

      <!-- 右侧分类详情列表部分 -->
      <el-col :xs="24" :sm="16" :md="18" :lg="19" :xl="20" class="cm-category-list-col">
        <!-- 分类列表组件 -->
        <div class="cm-category-list-wrapper">
          <!-- 搜索表单区域 -->
          <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="cm-search-form">
            <!-- 分类名称搜索输入框 -->
            <el-form-item>
              <el-input
                  v-model="dataForm.name"
                  placeholder="请输入分类名称"
                  clearable
                  class="cm-search-input cm-centered-input"
              ></el-input>
            </el-form-item>

            <!-- 是否显示筛选 -->
            <el-form-item>
              <el-select
                  v-model="dataForm.isShow"
                  placeholder="是否显示"
                  clearable
                  class="cm-search-input cm-centered-input"
              >
                <el-option label="显示" :value="1"></el-option>
                <el-option label="不显示" :value="0"></el-option>
              </el-select>
            </el-form-item>

            <!-- 操作按钮组 -->
            <el-form-item>
              <el-button class="cm-action-button" type="primary" @click="getDataList()">查询</el-button>
              <el-button class="cm-action-button" type="warning" @click="resetSearchForm()">重置</el-button>
              <el-button class="cm-action-button" type="success" @click="handleAddRootCategory()">添加一级分类</el-button>
              <el-button class="cm-action-button" type="danger" @click="handleBatchDelete()" :disabled="dataListSelections.length === 0">批量删除</el-button>
            </el-form-item>
          </el-form>

          <!-- 表格容器 -->
          <div class="cm-table-container">
            <!-- 分类数据表格 -->
            <el-table
                ref="dataTable"
                :data="dataList"
                border
                v-loading="dataListLoading"
                @selection-change="selectionChangeHandle"
                class="cm-data-table"
            >
              <el-table-column
                  type="selection"
                  header-align="center"
                  align="center"
                  width="50">
              </el-table-column>
              <el-table-column
                  prop="id"
                  header-align="center"
                  align="center"
                  width="80"
                  label="分类ID">
              </el-table-column>
              <el-table-column
                  prop="name"
                  header-align="center"
                  align="center"
                  width="150"
                  label="分类名称">
              </el-table-column>
              <el-table-column
                  prop="parentId"
                  header-align="center"
                  align="center"
                  width="100"
                  label="父分类ID">
              </el-table-column>
              <el-table-column
                  prop="categoryLevel"
                  header-align="center"
                  align="center"
                  width="100"
                  label="分类层级">
              </el-table-column>
              <el-table-column
                  prop="isShow"
                  header-align="center"
                  align="center"
                  width="160"
                  label="是否显示">
                <template #default="scope">
                  <el-switch
                      v-model="scope.row.isShow"
                      :disabled="!canToggleShow(scope.row)"
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                      @change="isShowStatusChange(scope.row)"
                      :active-value="1"
                      :inactive-value="0">
                  </el-switch>
                </template>
              </el-table-column>
              <el-table-column
                  prop="sort"
                  header-align="center"
                  align="center"
                  width="80"
                  label="排序">
              </el-table-column>
              <el-table-column
                  prop="icon"
                  header-align="center"
                  align="center"
                  width="120"
                  label="图标">
              </el-table-column>
              <el-table-column
                  prop="productUnit"
                  header-align="center"
                  align="center"
                  width="100"
                  label="统计单位">
              </el-table-column>
              <el-table-column
                  prop="productCount"
                  header-align="center"
                  align="center"
                  width="100"
                  label="商品数量">
              </el-table-column>
              <el-table-column
                  prop="createTime"
                  header-align="center"
                  align="center"
                  width="300"
                  label="创建时间">
              </el-table-column>
              <el-table-column
                  prop="modifyTime"
                  header-align="center"
                  align="center"
                  width="300"
                  label="修改时间">
              </el-table-column>
              <el-table-column
                  fixed="right"
                  header-align="center"
                  align="center"
                  width="200"
                  label="操作">
                <template #default="scope">
                  <div class="cm-table-button-container">
                    <el-button class="cm-table-button" type="primary" size="small" @click="handleEdit(scope.row)">修改
                    </el-button>
                    <el-button class="cm-table-button" v-if="canDeleteCategory(scope.row)" type="danger" size="small"
                               @click="handleDelete(scope.row)">删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页控件 -->
          <div class="cm-pagination-container">
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
        </div>
      </el-col>
    </el-row>
  </div>


  <!-- 弹窗, 添加分类 -->
  <CategoryAdd v-if="categoryAddVisible" ref="CategoryAdd" @refreshDataList="refreshData"></CategoryAdd>

  <!-- 弹窗, 修改分类 -->
  <CategoryUpdate v-if="categoryUpdateVisible" ref="CategoryUpdate" @refreshDataList="refreshData"></CategoryUpdate>
</template>

<script>
import CategoryAdd from './CategoryAdd.vue'
import CategoryUpdate from './CategoryUpdate.vue'

export default {
  name: 'CategoryManager',
  components: {
    CategoryAdd,
    CategoryUpdate
  },
  data() {
    return {
      // 树形搜索关键词
      treeSearchKey: '',
      // 默认展开的列表
      expandedKeys:[],
      // 默认选中的节点
      checkedKeys:[],
      // 上次操作的节点
      lastOperatedNodeId: null,

      // 分类树属性配置
      categoriesProps: {
        label: 'name',
        children: 'childrenCategories'
      },

      // 原始分类树数据
      categories: [],

      // 过滤后的分类树数据
      filteredCategories: [],

      // 表格数据
      dataForm: {
        name: '', // 搜索关键字
        isShow: null // 是否显示筛选
      },
      dataList: [],
      dataListSelections: [],
      dataListLoading: false,

      // 分页参数
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,

      // 控制弹窗显示
      categoryAddVisible: false,
      categoryUpdateVisible: false,

      // 防抖定时器
      resizeTimer: null,

      // 存储节点与子节点关系的映射
      categoryChildrenMap: {}
    }
  },
  created() {
    // 初始加载分类树数据
    this.getCategoriesTreeData()

    // 初始加载表格数据
    this.getDataList()
  },
  mounted() {
    // 监听窗口大小变化，优化表格布局
    this.handleResize = this.debounce(() => {
      if (this.$refs.dataTable) {
        this.$refs.dataTable.doLayout()
      }
    }, 200)

    window.addEventListener('resize', this.handleResize)

    // 组件加载后调整表格布局
    this.$nextTick(() => {
      if (this.$refs.dataTable) {
        this.$refs.dataTable.doLayout()
      }
    })
  },
  beforeUnmount() {
    // 组件销毁前移除事件监听
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    /**
     * 获取分类树数据
     */
    getCategoriesTreeData() {
      this.dataListLoading = true
      this.$http.get('/data/snack_platform/category/tree')
          .then(data => {
            console.log("====================result", data)
            if (data && data.code === 200) {
              // 将查询到的分类数据赋值给categories
              this.categories = data.data
              this.filteredCategories = [...this.categories] // 初始时过滤后的数据与原始数据相同

              // 构建分类与子分类的映射关系
              this.buildCategoryChildrenMap(this.categories)

              // 如果有上次操作的节点，将其设为展开状态
              if (this.lastOperatedNodeId) {
                this.expandedKeys = [this.lastOperatedNodeId]
              }
            } else {
              this.$message({
                type: "error",
                message: "没有查询到分类数据！"
              })
            }
            this.dataListLoading = false
          })
          .catch(error => {
            console.error('获取分类树数据失败:', error)
            this.$message.error('获取分类树数据失败')
            this.dataListLoading = false
          })
    },

    /**
     * 构建分类与子分类的映射关系
     * @param {Array} categories - 分类数据
     * @param {Object} map - 映射对象
     */
    buildCategoryChildrenMap(categories, map = {}) {
      if (!categories || categories.length === 0) return map

      categories.forEach(category => {
        map[category.id] = category.childrenCategories && category.childrenCategories.length > 0 ?
            category.childrenCategories.map(child => child.id) : []

        if (category.childrenCategories && category.childrenCategories.length > 0) {
          this.buildCategoryChildrenMap(category.childrenCategories, map)
        }
      })

      this.categoryChildrenMap = map
      return map
    },

    /**
     * 判断分类是否可以删除
     * @param {Object} category - 分类数据
     * @returns {Boolean} - 是否可以删除
     */
    canDeleteCategory(category) {
      // 检查是否有子分类
      const hasChildren = this.categoryChildrenMap[category.id] &&
          this.categoryChildrenMap[category.id].length > 0

      // 无子分类的一级和二级分类可以删除，三级分类都可以删除
      return !hasChildren || category.categoryLevel === 3
    },

    /**
     * 判断分类是否可以切换显示状态
     * @param {Object} category - 分类数据
     * @returns {Boolean} - 是否可以切换显示状态
     */
    canToggleShow(category) {
      // 检查是否有子分类
      const hasChildren = this.categoryChildrenMap[category.id] &&
          this.categoryChildrenMap[category.id].length > 0

      // 无子分类的一级和二级分类可以切换状态，三级分类都可以切换
      return !hasChildren || category.categoryLevel === 3
    },

    /**
     * 处理树节点选中状态变更
     * @param {Object} data - 当前节点数据
     * @param {Object} treeStatus - 树状态信息
     */
    handleTreeCheck(data, treeStatus) {
      // 如果节点有子节点，不允许选中
      if (this.categoryChildrenMap[data.id] && this.categoryChildrenMap[data.id].length > 0) {
        // 获取当前勾选的节点
        const checkedKeys = treeStatus.checkedKeys
        // 找出当前节点在勾选列表中的索引
        const index = checkedKeys.indexOf(data.id)
        if (index > -1) {
          // 如果节点被勾选了，则取消勾选
          checkedKeys.splice(index, 1)
          this.$refs.categoryTree.setCheckedKeys(checkedKeys)
          this.$message.warning('有子分类的节点不可勾选')
        }
      }
    },

    /**
     * 获取分类表格数据列表
     */
    getDataList() {
      this.dataListLoading = true
      this.$http.get('/data/snack_platform/category/list', {
        params: {
          'page': this.pageIndex,
          'limit': this.pageSize,
          'name': this.dataForm.name,
          'isShow': this.dataForm.isShow
        }
      }).then((data) => {

        console.log("==========================", data)
        if (data && data.code === 200) {
          this.dataList = data.data.page.list
          this.totalPage = data.data.page.totalCount

          // 数据加载完成后重新计算表格布局
          this.$nextTick(() => {
            if (this.$refs.dataTable) {
              this.$refs.dataTable.doLayout()
            }
          })
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      }).catch(error => {
        console.error('获取分类列表数据失败:', error)
        this.$message.error('获取分类列表数据失败')
        this.dataListLoading = false
      })
    },

    /**
     * 重置搜索表单
     */
    resetSearchForm() {
      this.dataForm.name = ''
      this.dataForm.isShow = null
      this.pageIndex = 1
      this.getDataList()
    },

    /**
     * 过滤分类树节点
     * @param {String} value - 搜索关键词
     * @param {Object} data - 节点数据
     */
    filterNode(value, data) {
      if (!value) return true
      return data.name.toLowerCase().includes(value.toLowerCase())
    },

    /**
     * 过滤分类树数据
     */
    filterCategoryTree() {
      if (this.$refs.categoryTree) {
        this.$refs.categoryTree.filter(this.treeSearchKey)
      }
    },

    /**
     * 防抖函数
     * @param {Function} fn - 要执行的函数
     * @param {Number} delay - 延迟时间(ms)
     */
    debounce(fn, delay) {
      return (...args) => {
        if (this.resizeTimer) clearTimeout(this.resizeTimer)
        this.resizeTimer = setTimeout(() => {
          fn.apply(this, args)
        }, delay)
      }
    },

    /**
     * 处理添加分类
     * @param {Object} data - 当前节点数据
     * @param {Object} node - 当前节点
     */
    handleAdd(data, node) {
      console.log("=============================node",node)

      // 记录当前操作的节点ID，用于刷新后展开
      this.lastOperatedNodeId = data.id

      this.categoryAddVisible = true
      this.$nextTick(() => {
        // 如果是从树节点添加，传入父分类信息
        this.$refs.CategoryAdd.init(data.id, node.level)
      })
    },

    /**
     * 处理添加一级分类
     */
    handleAddRootCategory() {
      this.categoryAddVisible = true
      this.$nextTick(() => {
        // 传入0作为父ID，表示添加一级分类
        this.$refs.CategoryAdd.init(0, 0)
      })
    },

    /**
     * 处理编辑分类
     * @param {Object} data - 分类数据
     */
    handleEdit(data) {
      // 记录当前操作的节点ID，用于刷新后展开
      this.lastOperatedNodeId = data.id

      this.categoryUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.CategoryUpdate.init(data.id)
      })
    },

    /**
     * 处理删除分类
     * @param {Object} data - 分类数据
     */
    handleDelete(data) {
      // 检查是否可以删除（无子分类或为三级分类）
      if (!this.canDeleteCategory(data)) {
        this.$message.warning('该分类有子分类，不能删除')
        return
      }

      this.$confirm(`确定要删除分类 "${data.name}" 吗?`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'cm-custom-confirm-dialog'
      }).then(() => {
        // 记录当前操作的父节点ID，用于刷新后展开
        this.lastOperatedNodeId = data.parentId

        // 发送删除请求
        this.$http.delete(`/data/snack_platform/category/delete/${data.id}`).then((data) => {
          console.log("================================delete",data)

          if (data && data.code === 200) {
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.refreshData()
              }
            })
          } else {
            this.$message.error(data.msg || '删除失败')
          }
        }).catch(error => {
          console.error('删除分类失败:', error)
          this.$message.error('删除分类失败')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    /**
     * 处理批量删除分类
     */
    handleBatchDelete() {
      if (this.dataListSelections.length === 0) {
        this.$message.warning('请至少选择一个分类')
        return
      }

      // 检查所选分类是否都可以删除
      const nonDeletableCategories = this.dataListSelections.filter(item => !this.canDeleteCategory(item))
      if (nonDeletableCategories.length > 0) {
        const names = nonDeletableCategories.map(item => item.name).join(', ')
        this.$message.warning(`以下分类有子分类，不能删除: ${names}`)
        return
      }

      const ids = this.dataListSelections.map(item => item.id)
      const categoryNames = this.dataListSelections.map(item => item.name).join(', ')

      this.$confirm(`确定要删除以下分类吗？${categoryNames}`, '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'cm-custom-confirm-dialog'
      }).then(() => {
        // 发送批量删除请求
        this.$http.delete('/data/snack_platform/category/delete', {data:ids}).then((data) => {
          if (data && data.code === 200) {
            this.$message({
              message: '批量删除成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.refreshData()
              }
            })
          } else {
            this.$message.error(data.msg || '批量删除失败')
          }
        }).catch(error => {
          console.error('批量删除分类失败:', error)
          this.$message.error('批量删除分类失败')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消批量删除'
        })
      })
    },

    /**
     * 刷新所有数据
     * 同时刷新树形结构和表格数据
     */
    refreshData() {
      // 刷新分类树
      this.getCategoriesTreeData()

      // 刷新表格数据
      this.getDataList()
    },

    /**
     * 修改分类显示状态
     * @param {Object} row - 当前行数据
     */
    isShowStatusChange(row) {
      // 检查是否可以切换显示状态
      if (!this.canToggleShow(row)) {
        row.isShow = row.isShow === 1 ? 1 : 0 // 还原状态
        this.$message.warning('有子分类的分类不允许修改显示状态')
        return
      }

      // 显示确认对话框
      this.$confirm(`确定要${row.isShow === 1 ? '显示' : '隐藏'}分类 "${row.name}" 吗?`, '状态修改', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'cm-custom-confirm-dialog'
      }).then(() => {
        // 发送状态更新请求
        this.$http.put('/data/snack_platform/category/update', {
          'id': row.id,
          'isShow': row.isShow
        }).then((data) => {
          if (data && data.code === 200) {
            // 更新成功
            this.$message({
              message: `分类 "${row.name}" 已${row.isShow === 1 ? '设为显示' : '设为隐藏'}`,
              type: 'success',
              duration: 1500
            })
          } else {
            // 更新失败，还原状态
            this.$message.error(data.msg || '状态更新失败')
            row.isShow = row.isShow === 1 ? 0 : 1
          }
        }).catch(error => {
          // 发生异常时还原状态并显示错误
          console.error("状态更新异常:", error)
          row.isShow = row.isShow === 1 ? 0 : 1
          this.$message.error('操作失败，发生异常')
        })
      }).catch(() => {
        // 用户取消操作，还原状态
        row.isShow = row.isShow === 1 ? 0 : 1
        this.$message({
          type: 'info',
          message: '已取消状态修改'
        })
      })
    },

    /**
     * 每页数量变化处理
     * @param {Number} val - 新的每页数量
     */
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },

    /**
     * 当前页变化处理
     * @param {Number} val - 新的页码
     */
    currentChangeHandle(val) {
      this.pageIndex = val
      this.getDataList()
    },

    /**
     * 表格多选变化处理
     * @param {Array} val - 选中行数据数组
     */
    selectionChangeHandle(val) {
      this.dataListSelections = val
    }
  }
}
</script>
<style scoped>
/* 主容器样式 - 使用cm-前缀 */
.cm-category-manager-container {
  width: 100%;
  height: calc(100vh - 10rem); /* 减去头部和其他元素高度 */
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden; /* 防止内容溢出 */
}

/* 整行高度设置 */
.cm-full-height {
  height: 100%;
}

/* 左侧分类树列样式 */
.cm-category-tree-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 0.25rem;
}

/* 分类树搜索框容器 */
.cm-tree-search-container {
  margin-bottom: 1rem;
  padding: 0.5rem;
}

/* 分类树包装容器 */
.cm-category-tree-wrapper {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  max-height: calc(100vh - 15rem);
  border: 0.0625rem solid #e6e6e6;
  border-radius: 0.25rem;
  background-color: #fff;
  padding: 0.5rem;
}

/* 分类树容器样式 */
.cm-category-tree-container {
  width: 100%;
  height: 100%;
  min-height: 100%; /* 确保树容器填满包装容器 */
}

/* 树形控件节点样式 */
.cm-category-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.1rem 0;
  width: 100%;
  position: relative;
}

/* 节点标签样式 */
.cm-node-label {
  font-size: 1rem; /* 采用CategoryTree.vue中的字体大小 */
  flex: 1;
  font-weight: 500;
}

/* 树节点按钮组 */
.cm-category-tree-button-group {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 按钮之间的间距，采用CategoryTree.vue中的设置 */
  margin-left: 0.9rem; /* 按钮组与节点标签的间距，采用CategoryTree.vue中的设置 */
}

/* 树节点按钮样式 */
.cm-category-tree-button-group .el-button {
  padding: 0; /* 调整按钮内边距，采用CategoryTree.vue中的设置 */
  margin: 0; /* 去掉按钮默认的外边距，采用CategoryTree.vue中的设置 */
  font-size: 1rem; /* 调整按钮字体大小，采用CategoryTree.vue中的设置 */
  width: 2rem; /* 调整按钮宽度，采用CategoryTree.vue中的设置 */
  white-space: nowrap; /* 防止按钮文字换行，采用CategoryTree.vue中的设置 */
}

/* 右侧分类列表列样式 */
.cm-category-list-col {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 分类列表包装容器 */
.cm-category-list-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: #fff;
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.1);
  overflow: hidden; /* 防止内容溢出 */
  max-height: 100%; /* 限制最大高度为父容器高度 */
}

/* 搜索表单样式 */
.cm-search-form {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
  flex-wrap: wrap;
  gap: 0.625rem;
}

/* 统一搜索输入框和下拉框的样式 */
.cm-search-input {
  width: 15rem;
}

/* 输入框中的占位文本居中显示 */
.cm-centered-input input::placeholder {
  text-align: center;
}

/* 输入框中的实际输入文本居中显示 */
.cm-centered-input input,
.cm-centered-input .el-input__inner {
  text-align: center;
  width: 15rem;
  height: 2rem;
  line-height: 2rem;
}

/* 下拉选项居中显示 */
.el-select-dropdown__item {
  text-align: center;
}

/* 操作按钮样式 */
.cm-action-button {
  width: 7rem !important;
  height: 2rem !important;
  font-size: 0.875rem;
  margin: 0 0.3125rem;
}

/* 表格容器样式 */
.cm-table-container {
  flex: 1;
  width: 100%;
  overflow-y: auto; /* 添加垂直滚动 */
  overflow-x: auto; /* 保留水平滚动 */
  margin-bottom: 1rem;
  max-height: calc(100vh - 20rem); /* 限制最大高度 */
}

/* 数据表格样式 */
.cm-data-table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: auto;
  margin: 0 !important;
}

/* 表格内操作按钮容器 */
.cm-table-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
}

/* 表格内操作按钮样式 */
.cm-table-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  margin: 0 0.1875rem;
  max-width: 3.5rem; /* 限制最大宽度 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
  white-space: nowrap; /* 防止文字换行 */
  flex-shrink: 0; /* 防止按钮被压缩 */
}

/* 分页控件容器 */
.cm-pagination-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

/* 自定义确认对话框样式 */
.cm-custom-confirm-dialog .el-button {
  width: 8rem !important;
  height: 2rem !important;
  margin: 0 0.625rem;
}

/* 确保对话框内容居中 */
.cm-custom-confirm-dialog .el-message-box__btns {
  display: flex;
  justify-content: center;
}

/* 调整树节点高度与间距 */
.cm-category-tree-container .el-tree-node__content {
  height: 2rem; /* 控制节点高度 */
}

/* 增强鼠标悬停效果 */
.cm-category-tree-container .el-tree-node__content:hover {
  background-color: #f5f7fa;
}

.cm-category-tree-container .el-tree-node__content:hover .el-button {
  color: #409EFF; /* 鼠标悬停时突出显示按钮 */
}

/* 调整子节点缩进 */
.cm-category-tree-container .el-tree-node__children {
  padding-left: 1rem; /* 减少子节点缩进，使结构更紧凑 */
}

/* 响应式布局调整 */
@media screen and (max-width: 48rem) {
  /* 768px */
  .cm-category-manager-container {
    height: auto;
    padding: 0.5rem;
  }

  .cm-full-height {
    height: auto;
  }

  .cm-category-tree-col, .cm-category-list-col {
    height: auto;
    margin-bottom: 1rem;
    width: 100% !important; /* 在小屏幕下占满整行 */
  }

  .cm-category-tree-wrapper {
    height: 31.25rem; /* 500px */
  }

  .cm-table-container {
    overflow-x: auto;
    contain: content;
  }

  .cm-centered-input input,
  .cm-centered-input .el-input__inner {
    width: 12rem !important;
  }

  .cm-action-button {
    width: 5.5rem !important;
    margin: 0 0.15rem;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 36rem) {
  /* 576px */
  .cm-search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .cm-search-form .el-form-item {
    margin: 0 0 0.5rem 0;
    width: 100%;
  }

  .cm-centered-input input,
  .cm-centered-input .el-input__inner {
    width: 100% !important;
  }

  .cm-action-button {
    width: 100% !important;
    margin: 0.25rem 0;
  }
}
</style>