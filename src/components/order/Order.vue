<template>
  <div class="order-container-center">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" class="order-search-form">
      <el-form-item>
        <el-input v-model="dataForm.skuName" placeholder="请输入商品名称" class="order-centered-input"
                  clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="order-action-button" type="primary" @click="getDataList()">查询</el-button>
      </el-form-item>
<!--      &lt;!&ndash; 状态过滤按钮组 &ndash;&gt;-->
<!--      <el-form-item>-->
<!--        <el-button-group>-->
<!--          <el-button-->
<!--              :type="dataForm.status === '' ? 'primary' : 'default'"-->
<!--              @click="changeOrderStatus('')">全部</el-button>-->
<!--          <el-button-->
<!--              :type="dataForm.status === '0' ? 'primary' : 'default'"-->
<!--              @click="changeOrderStatus('0')">未完成</el-button>-->
<!--          <el-button-->
<!--              :type="dataForm.status === '1' ? 'primary' : 'default'"-->
<!--              @click="changeOrderStatus('1')">进行中</el-button>-->
<!--          <el-button-->
<!--              :type="dataForm.status === '2' ? 'primary' : 'default'"-->
<!--              @click="changeOrderStatus('2')">已完成</el-button>-->
<!--        </el-button-group>-->
<!--      </el-form-item>-->
    </el-form>

    <!-- 表格容器 -->
    <div class="order-table-container">
      <!-- 订单数据表格 -->
      <el-table
          :data="orders"
          border
          v-loading="loading"
          class="order-data-table"
          empty-text="没有找到订单，请尝试其他搜索关键词。">

        <!-- 订单详情卡片列 -->
        <el-table-column
            label="订单详情"
            min-width="80%"
            align="center">
          <template #default="scope">
            <el-card class="order-detail-card" shadow="hover">
              <div class="order-detail-grid">
                <div class="order-detail-item">
                  <span class="detail-label">商品名称:</span>
                  <span class="detail-value">{{ scope.row.skuName }}</span>
                </div>
                <div class="order-detail-item">
                  <span class="detail-label">商家名称:</span>
                  <span class="detail-value">{{ scope.row.merchantName }}</span>
                </div>
                <div class="order-detail-item">
                  <span class="detail-label">数量:</span>
                  <span class="detail-value">{{ scope.row.count }}</span>
                </div>
                <div class="order-detail-item">
                  <span class="detail-label">价格:</span>
                  <span class="detail-value">¥{{ formatPrice(scope.row.price) }}</span>
                </div>
                <div class="order-detail-item">
                  <span class="detail-label">总价格:</span>
                  <span class="detail-value">¥{{ formatPrice(scope.row.totalPrice) }}</span>
                </div>
                <div class="order-detail-item">
                  <span class="detail-label">状态:</span>
                  <span class="detail-value">
                    <el-tag v-if="scope.row.status === 0" :type="'warning'">
                      {{ '未完成' }}
                    </el-tag>
                    <el-tag v-if="scope.row.status === 1" :type="'primary'">
                      {{ '进行中' }}
                    </el-tag>
                    <el-tag v-if="scope.row.status === 2" :type="'success'">
                      {{ '完成' }}
                    </el-tag>
                  </span>
                </div>
                <div class="order-detail-item">
                  <span class="detail-label">订单号:</span>
                  <span class="detail-value">{{ scope.row.orderNumber }}</span>
                </div>
                <div class="order-detail-item">
                  <span class="detail-label">创建时间:</span>
                  <span class="detail-value">{{ formatDate(scope.row.createTime) }}</span>
                </div>
                <!--                <div class="order-detail-item">-->
                <!--                  <span class="detail-label">用户账号:</span>-->
                <!--                  <span class="detail-value">{{ scope.row.userAccount }}</span>-->
                <!--                </div>-->
              </div>
            </el-card>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column
            label="操作"
            width="120px"
            align="center"
            fixed="right">
          <template #default="scope">
            <el-button
                v-if="scope.row.status === 0 || scope.row.status === 1"
                type="danger"
                size="mini"
                @click="deleteOrder(scope.row.id)">取消
            </el-button>
            <el-button
                v-if="scope.row.status === 2"
                type="danger"
                size="mini"
                @click="deleteOrder(scope.row.id)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="order-pagination-container" v-if="total > 0">
        <el-pagination
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
            :current-page="currentPage"
            :page-sizes="[6, 12, 20, 50]"
            :page-size="pageSize"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'OrderComponent',
  data() {
    return {
      dataForm: {
        skuName: '', // 商品名称搜索关键字
        status: '' // 订单状态
      },
      orders: [],
      currentPage: 1,
      pageSize: 6,  // 默认每页显示6条数据
      total: 0,
      loading: false,
    };
  },
  created() {
    // 在组件创建时从路由查询参数中获取status值
    this.getStatusFromRoute();
  },
  mounted() {
    this.getDataList();
  },
  // 监听路由变化
  watch: {
    '$route'(to, from) {
      // 路由发生变化时重新获取状态并刷新数据
      this.getStatusFromRoute();
      this.currentPage = 1; // 重置为第一页
      this.getDataList();
    }
  },
  methods: {
    // 从路由中获取status参数
    getStatusFromRoute() {
      const status = this.$route.query.status;
      if (status !== undefined) {
        this.dataForm.status = status.toString();
      } else {
        this.dataForm.status = '';
      }
    },

    // 改变订单状态过滤
    changeOrderStatus(status) {
      // 使用路由导航实现状态变更，这样可以保留在历史记录中
      this.$router.push({
        name: 'Order',
        query: {
          ...(status ? { status } : {})
        }
      });
    },

    getDataList() {
      this.loading = true;

      // 使用真实API
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          'skuName': this.dataForm.skuName.trim(),
        };

        // 只有当status有值时才添加到查询参数中
        if (this.dataForm.status !== '') {
          params.status = this.dataForm.status;
        }

        // 调用后端接口获取订单列表
        this.$http.get('/data/snack_platform/order/list', {params})
            .then(result => {
              if (result && result.code === 200) {
                const pageData = result.data.page;
                this.orders = pageData.list || [];
                this.total = pageData.totalCount || 0;
              } else {
                console.error('获取订单失败:', result.msg);
                this.$message.error(result.msg || '获取订单失败');
                this.orders = [];
                this.total = 0;
              }
              this.loading = false;
            })
            .catch(error => {
              console.error('获取订单出错:', error);
              this.$message.error('网络异常，请稍后重试');
              this.orders = [];
              this.total = 0;
              this.loading = false;
            });
      } catch (error) {
        console.error('获取订单异常:', error);
        this.$message.error('获取订单数据异常');
        this.orders = [];
        this.total = 0;
        this.loading = false;
      }
    },

    // 当前页改变时的处理函数
    currentChangeHandle(page) {
      this.currentPage = page;
      this.getDataList();
    },

    // 每页条数改变时的处理函数
    sizeChangeHandle(size) {
      this.pageSize = size;
      this.currentPage = 1; // 切换每页显示数量时，重置为第一页
      this.getDataList();
    },

    deleteOrder(id) {
      this.$confirm('确定要删除这个订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
            // 使用真实API删除
            this.$http.post('/data/snack_platform/order/delete', [id])
                .then(response => {
                  if (response.data.code === 0) {
                    this.$message({
                      type: 'success',
                      message: '删除成功!'
                    });
                    // 删除成功后刷新当前页
                    this.getDataList();
                  } else {
                    this.$message.error(response.data.msg || '删除订单失败');
                  }
                })
                .catch(error => {
                  console.error('删除订单出错:', error);
                  this.$message.error('网络异常，请稍后重试');
                });
          }
      ).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    formatPrice(price) {
      if (price === null || price === undefined) return '0.00';
      return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
    }
  }
};
</script>

<style>
/* 订单容器中心样式 */
.order-container-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1300px; /* 增加容器最大宽度 */
  margin: 0 auto;
  padding: 0 1rem;
  height: calc(100vh - 20rem);
  overflow: hidden;
}

/* 搜索表单样式 */
.order-search-form {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
  padding: 16px;
  flex-wrap: wrap; /* 允许表单项换行 */
  gap: 10px; /* 表单项之间的间距 */
}

/* 确保输入框文字居中 */
.order-centered-input input {
  text-align: center;
  width: 250px;
}

/* 表格容器样式 */
.order-table-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 订单数据表格样式 */
.order-data-table {
  flex: 1;
  overflow-y: auto;
  width: 100%; /* 确保表格占满容器宽度 */
}

/* 确保表格的操作列固定在右侧 */
.el-table__fixed-right {
  height: 100% !important;
}

/* 订单卡片样式 */
.order-detail-card {
  margin: 8px;
  border-radius: 4px;
  width: calc(100% - 16px); /* 减小卡片宽度，留出边距 */
}

.order-detail-card .el-card__body {
  padding: 10px;
}

/* 订单详情网格布局 */
.order-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px; /* 减小间距 */
}

/* 响应式网格布局 */
@media (max-width: 992px) {
  .order-detail-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .order-detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .order-detail-grid {
    grid-template-columns: 1fr;
  }
}

/* 订单详情项样式 */
.order-detail-item {
  display: flex;
  align-items: center;
  padding: 4px;
}

.detail-label {
  font-weight: bold;
  margin-right: 5px;
  color: #606266;
  flex-shrink: 0;
  width: 70px;
}

.detail-value {
  flex: 1;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分页容器样式 */
.order-pagination-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #EBEEF5;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.order-action-button {
  width: 100px !important;
  height: 32px !important;
}

/* 响应式样式 */
@media screen and (max-width: 1200px) {
  .order-container-center {
    max-width: 95%;
  }
}

@media screen and (max-width: 768px) {
  .order-container-center {
    max-width: 100%;
  }

  .order-centered-input input {
    width: 200px;
  }

  .order-search-form {
    justify-content: space-around;
  }
}

@media screen and (max-width: 576px) {
  .order-container-center {
    padding: 0 0.5rem;
  }

  .order-search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .order-search-form .el-form-item {
    margin: 0 0 0.5rem 0;
    width: 100%;
  }

  .order-centered-input input {
    width: 100%;
  }

  .order-action-button {
    width: 100% !important;
  }
}
</style>