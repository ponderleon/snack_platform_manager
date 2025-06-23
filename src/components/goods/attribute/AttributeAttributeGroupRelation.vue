<template>
  <div>
    <el-dialog
        title="属性分组关联管理"
        :close-on-click-modal="false"
        v-model="visible"
        @closed="dialogClose"
        width="30%"
        class="rel-dialog">
      <el-dialog
          width="50%"
          title="选择属性"
          v-model="innerVisible"
          append-to-body
          class="rel-inner-dialog">
        <div class="rel-inner-dialog-content">
          <!-- 搜索表单 - 居中显示 -->
          <div class="rel-search-form-container">
            <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="rel-compact-form">
              <el-form-item>
                <el-input v-model="dataForm.name" placeholder="属性名称" clearable class="rel-small-input"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="getDataList()" type="primary" class="rel-query-button">查询</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 可选择关联的属性表格 - 居中显示 -->
          <div class="rel-inner-table-container-wrapper">
            <div class="rel-inner-table-container">
              <el-table
                  :data="dataList"
                  border
                  v-loading="dataListLoading"
                  @selection-change="innerSelectionChangeHandle"
                  size="small">
                <el-table-column type="selection" header-align="center" align="center" width="40"></el-table-column>
                <el-table-column prop="id" header-align="center" align="center" width="70" label="属性ID"></el-table-column>
                <el-table-column prop="name" header-align="center" align="center" width="200" label="属性名称"></el-table-column>
                <el-table-column prop="categoryId" header-align="center" align="center" width="100" label="分类ID"></el-table-column>
                <el-table-column prop="createTime" header-align="center" align="center" width="300" label="创建时间"></el-table-column>
                <el-table-column prop="modifyTime" header-align="center" align="center" width="300" label="修改时间"></el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 分页控件 - 居中显示 -->
          <div class="rel-pagination-container">
            <el-pagination
                @size-change="sizeChangeHandle"
                @current-change="currentChangeHandle"
                :current-page="pageIndex"
                :page-sizes="[2, 4, 5, 10]"
                :page-size="pageSize"
                :total="totalPage"
                layout="total, sizes, prev, pager, next, jumper"
                class="rel-compact-pagination">
            </el-pagination>
          </div>
        </div>

        <!-- 弹窗底部按钮 -->
        <template #footer>
          <div class="rel-dialog-footer">
            <el-button @click="innerVisible = false" class="rel-standard-button">取消</el-button>
            <el-button type="primary" @click="submitAddRelation" class="rel-standard-button">确认关联</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 主对话框内容 -->
      <el-row>
        <el-col :span="24">
          <!-- 操作按钮 - 居中显示 -->
          <div class="rel-operation-buttons">
            <el-button type="primary" @click="addRelation" class="rel-standard-button">新建关联</el-button>
            <el-button
                type="danger"
                @click="batchDeleteRelation"
                :disabled="dataListSelections.length <= 0"
                class="rel-standard-button">批量删除
            </el-button>
          </div>

          <!-- 已关联的属性表格 - 居中显示 -->
          <div class="rel-table-container-wrapper">
            <div class="rel-table-container">
              <el-table
                  :data="relationAttributes"
                  border
                  v-loading="relationLoading"
                  @selection-change="selectionChangeHandle"
                  size="small">
                <el-table-column type="selection" header-align="center" align="center" width="40"></el-table-column>
                <el-table-column prop="id" label="属性ID" width="100" header-align="center"
                                 align="center"></el-table-column>
                <el-table-column prop="name" label="属性名称" width="200" header-align="center"
                                 align="center"></el-table-column>
                <el-table-column prop="categoryId" label="分类ID" width="100" header-align="center"
                                 align="center"></el-table-column>
                <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                  <template #default="scope">
                    <el-button type="danger" size="small" @click="relationRemove(scope.row.id)" class="rel-relation-button">
                      解除关联
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      attributeGroupId: 0, // 当前属性分组ID
      visible: false, // 主对话框显示状态
      innerVisible: false, // 内部对话框显示状态
      relationAttributes: [], // 已关联的属性列表
      relationLoading: false, // 关联数据加载状态
      dataListSelections: [], // 主表格选中的数据
      dataForm: {
        name: "" // 搜索关键字
      },
      dataList: [], // 可关联的属性列表
      pageIndex: 1, // 当前页码
      pageSize: 2, // 每页记录数
      totalPage: 0, // 总记录数
      dataListLoading: false, // 数据加载状态
      innerDataListSelections: [] // 内部表格选中的数据
    };
  },
  computed: {},
  watch: {},
  methods: {
    // 主表格选择变更处理
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },

    // 内部表格选择变更处理
    innerSelectionChangeHandle(val) {
      this.innerDataListSelections = val;
    },

    // 打开新建关联对话框
    addRelation() {
      this.getDataList();
      this.innerVisible = true;
    },

    // 批量删除关联
    batchDeleteRelation() {
      if (this.dataListSelections.length <= 0) {
        this.$message({
          message: '请选择要删除的关联',
          type: 'warning'
        });
        return;
      }

      let attributeNames = this.dataListSelections.map(item => item.name).join('、');

      this.$confirm(`确定要解除与 "${attributeNames}" 的关联吗?`, '解除关联确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'rel-custom-confirm-dialog'
      }).then(() => {
        // 组装批量删除的数据
        let datas = [];
        this.dataListSelections.forEach(item => {
          datas.push({
            'attributeId': item.id,
            'attributeGroupId': this.attributeGroupId
          });
        });

        this.$http.delete('/data/snack_platform/attributeattributegrouprelation/relation/delete/list', {data: datas})
            .then(data => {

              if (data && data.code === 200) {
                // 后续会实现具体请求方法
                this.$message({
                  type: 'success',
                  message: '解除关联成功'
                });

                // 刷新关联列表
                this.init(this.attributeGroupId);
              } else {
                // 失败提示
                this.$message({
                  type: 'error',
                  message: '解除关联失败'
                });
              }

            })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消解除关联操作'
        });
      });
    },

    // 移除单个关联
    relationRemove(attributeId) {
      this.$confirm(`确定要解除此关联吗?`, '解除关联确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'rel-custom-confirm-dialog'
      }).then(() => {

        this.$http.delete('/data/snack_platform/attributeattributegrouprelation/relation/delete', {
          data: {
            'attributeId': attributeId,
            'attributeGroupId': this.attributeGroupId
          }
        }).then(data => {

          if (data && data.code === 200) {
            // 成功提示
            this.$message({
              type: 'success',
              message: '解除关联成功'
            });

            // 刷新关联列表
            this.init(this.attributeGroupId);

          } else {
            // 失败提示
            this.$message({
              type: 'error',
              message: '解除关联失败'
            });
          }

        })


      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消解除关联操作'
        });
      });
    },

    // 提交添加关联
    submitAddRelation() {
      this.innerVisible = false;

      if (this.innerDataListSelections.length > 0) {
        // 组装添加关联的数据
        let datas = [];
        this.innerDataListSelections.forEach(item => {
          datas.push({
            'attributeId': item.id,
            'attributeGroupId': this.attributeGroupId
          });
        });

        this.$http.post('/data/snack_platform/attributeattributegrouprelation/save/list',datas).then((data) => {

          if(data && data.code === 200){
            // 后续会实现具体请求方法
            this.$message({
              type: 'success',
              message: '添加关联成功'
            });

            // 通知父组件刷新数据
            this.$emit('refreshData');

            // 刷新关联列表
            this.init(this.attributeGroupId);
          }else {
            // 失败
            this.$message({
              type: 'error',
              message: '添加关联失败'
            });
          }
        }).catch(error => {
          console.log("异常为：",error)
        })

      } else {
        this.$message({
          type: 'warning',
          message: '请选择要关联的属性'
        });
      }
    },

    // 初始化关联对话框
    init(id) {
      this.attributeGroupId = id || 0;
      this.visible = true;

      // 获取已关联的属性列表
      this.loadRelationAttributes();
    },

    // 加载已关联的属性
    loadRelationAttributes() {
      this.relationLoading = true;

      // 使用提供的接口获取关联属性列表
      this.$http.get(`/data/snack_platform/attributegroup/relation/list/${this.attributeGroupId}`).then((data) => {
        if (data && data.code === 200) {
          this.relationAttributes = data.data;
        } else {
          this.relationAttributes = [];
          this.$message.error(data?.msg || '获取关联属性失败');
        }
        this.relationLoading = false;
      }).catch(() => {
        this.relationAttributes = [];
        this.relationLoading = false;
        this.$message.error('获取关联属性失败');
      });
    },

    // 对话框关闭处理
    dialogClose() {
      // 重置表单和选择状态
      this.dataForm.key = '';
      this.dataListSelections = [];
      this.innerDataListSelections = [];
      this.pageIndex = 1;
    },

    // 获取可关联的属性列表
    getDataList() {
      this.dataListLoading = true;

      this.$http.get(`/data/snack_platform/attributegroup/not/relation/list/${this.attributeGroupId}`, {
        params: {
          'page': this.pageIndex,
          'limit': this.pageSize,
          'name': this.dataForm.name
        }
      }).then(data => {
        //  判断是否有数据
        if (data && data.code === 200) {
          this.dataList = data.data.page.list;
          this.totalPage = data.data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      }).catch(error => {
        console.log("异常为：", error)
      })
    },

    // 每页数量变化处理
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },

    // 当前页变化处理
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    }
  }
};
</script>

<style scoped>
.rel-dialog {
  margin-top: 5vh !important;
}

.rel-inner-dialog {
  margin-top: 8vh !important;
}

/* 内部对话框内容布局 */
.rel-inner-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 搜索表单容器 - 居中显示 */
.rel-search-form-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 0.9375rem;
}

/* 紧凑型表单 */
.rel-compact-form {
  margin-bottom: 0.625rem;
  display: flex;
  justify-content: center;
}

/* 小输入框 */
.rel-small-input {
  width: 11.25rem !important;
}

/* 内部表格容器包装 - 用于居中显示 */
.rel-inner-table-container-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
}

/* 内部表格容器设置为确切宽度 */
.rel-inner-table-container {
  width: 63.125rem; /* 40 + 70 + 200 + 100 + 300 + 300 = 1010px，表格列宽总和 */
}

/* 分页容器 - 居中显示 */
.rel-pagination-container {
  display: flex;
  justify-content: center;
  width: 63.125rem;
  margin-top: 0.9375rem;
}

/* 更紧凑的分页控件 */
.rel-compact-pagination {
  font-size: 0.75rem;
}

/* 操作按钮区域 - 居中显示 */
.rel-operation-buttons {
  margin-bottom: 0.625rem;
  display: flex;
  gap: 0.625rem;
  justify-content: center;
}

.rel-dialog-footer {
  display: flex;
  justify-content: center;
  padding: 0.625rem 0;
}

/* 表格容器包装 - 用于居中显示 */
.rel-table-container-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* 表格容器设置为确切宽度 */
.rel-table-container {
  width: 590px; /* 40 + 100 + 200 + 100 + 150 = 590px，表格列宽总和 */
}

/* 设置按钮尺寸为要求的大小 */
.rel-standard-button, .rel-relation-button {
  width: 8rem !important;
  height: 2rem !important;
}

.rel-query-button {
  width: 5rem !important;
  height: 2rem !important;
}

/* 表格单元格内容紧凑化 */
:deep(.el-table) {
  font-size: 0.8125rem;
}

:deep(.el-table td) {
  padding: 0.3125rem 0;
}

:deep(.el-table th) {
  padding: 0.4375rem 0;
}

/* 响应式调整 */
@media screen and (max-width: 48rem) {
  .rel-operation-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.3125rem;
  }

  .rel-table-container, .rel-inner-table-container {
    width: 100%;
    overflow-x: auto;
  }
}

/* 自定义确认对话框样式 */
:deep(.rel-custom-confirm-dialog .el-button) {
  width: 8rem !important;
  height: 2rem !important;
  margin: 0 0.625rem;
}

/* 确保对话框内容居中 */
:deep(.rel-custom-confirm-dialog .el-message-box__btns) {
  display: flex;
  justify-content: center;
}
</style>