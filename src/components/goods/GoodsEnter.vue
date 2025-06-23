<template>
  <div class="ge-container">
    <!-- 步骤导航 - 显示当前在哪个步骤 -->
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <div class="ge-header">
          <div class="ge-header-steps">
            <el-steps style="max-width:100%;" :active="active" finish-status="success" simple>
              <el-step title="产品信息" :icon="Goods"/>
              <el-step title="基本属性/规格参数" :icon="Handbag"/>
              <el-step title="销售属性" :icon="ShoppingBag"/>
              <el-step title="商品信息" :icon="GoodsFilled"/>
              <el-step title="录入完成" :icon="CircleCheck"/>
            </el-steps>
          </div>
        </div>
      </el-col>

      <!-- 主体内容区域 - 根据当前步骤显示不同内容 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <div class="ge-body">
          <!-- 第一步：SPU信息 - 基本产品信息录入 -->
          <div class="ge-body-form" v-show="active === 1">
            <div class="ge-form-container">
              <el-form
                  ref="spuBaseFormRef"
                  :model="spuInfo"
                  :rules="spuBaseInfoRules"
                  status-icon
                  class="ge-form-item"
                  label-width="auto"
                  label-position="left">

                <div class="ge-form-items-container">
                  <!-- 商品名称输入框 -->
                  <el-form-item label="商品名称" prop="spuName" class="ge-form-item-horizontal">
                    <el-input
                        v-model="spuInfo.spuName"
                        type="text"
                        placeholder="请输入商品名称"
                        class="ge-input-name"/>
                  </el-form-item>

                  <!-- 商户用户名输入框 - 新增 -->
                  <el-form-item label="商户账号" prop="merchantUsername" class="ge-form-item-horizontal">
                    <el-input
                        v-model="spuInfo.merchantUsername"
                        type="text"
                        placeholder="请输入商户账号"
                        class="ge-input-name" disabled/>
                  </el-form-item>

                  <!-- 商品描述输入框 -->
                  <el-form-item label="商品描述" prop="spuDescription" class="ge-form-item-horizontal">
                    <el-input
                        v-model="spuInfo.spuDescription"
                        type="text"
                        placeholder="请输入商品描述"
                        class="ge-input-desc"/>
                  </el-form-item>

                  <!-- 商品分类级联选择器 -->
                  <el-form-item label="商品分类" prop="catalogId" class="ge-form-item-horizontal">
                    <el-cascader
                        filterable
                        v-model="categoryIds"
                        :options="categories"
                        :props="categoryProps"
                        @change="handleCategoryChange"
                        placeholder="请选择商品分类"
                        class="ge-input-category"/>
                  </el-form-item>

                  <!-- 商品品牌选择器 -->
                  <el-form-item label="商品品牌" prop="brandId" class="ge-form-item-horizontal">
                    <el-select
                        v-model="brandId"
                        clearable
                        filterable
                        placeholder="请选择商品品牌"
                        class="ge-input-brand">
                      <el-option
                          v-for="item in brands"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                      />
                    </el-select>
                  </el-form-item>

                  <!-- 商品介绍图片上传 -->
                  <el-form-item label="商品介绍" prop="decript" class="ge-form-item-horizontal">
                    <ImagesUpload v-model="spuInfo.decript"></ImagesUpload>
                  </el-form-item>

                  <!-- 商品图集上传 -->
                  <el-form-item label="商品图集" prop="images" class="ge-form-item-horizontal">
                    <ImagesUpload v-model="spuInfo.images"></ImagesUpload>
                  </el-form-item>
                </div>

                <!-- 下一步按钮 - 居中显示 -->
                <el-form-item>
                  <div class="ge-button-center">
                    <el-button type="primary" @click="goToNextStep">下一步：设置基本属性</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 第二步：基本属性/规格参数 - 展示属性组和对应属性 -->
          <div class="ge-body-form" v-show="active === 2">
            <el-card class="ge-card ge-card-smaller">
              <div class="ge-attr-layout">
                <!-- 左侧属性组标签页 -->
                <div class="ge-left-tabs">
                  <!--                  <el-tabs tab-position="left" style="height: 100%" ref="attrTabsRef">-->
                  <!--                    <el-tab-pane-->
                  <!--                        v-for="(group, gidx) in dataResp.attrGroups"-->
                  <!--                        :key="group.id"-->
                  <!--                        :label="'分类' + ' | ' + getCategoryName(group.catId)"-->
                  <!--                        :name="gidx.toString()"-->
                  <!--                    >-->
                  <!--                      &lt;!&ndash; 分类名称显示在标签页标题 &ndash;&gt;-->
                  <!--                    </el-tab-pane>-->
                  <!--                  </el-tabs>-->
                </div>

                <!-- 右侧属性表单 -->
                <div class="ge-right-form">
                  <div v-for="(group, gidx) in dataResp.attrGroups" :key="group.id"
                       v-show="currentGroupIndex === gidx" class="ge-attr-group-form">
                    <h3 class="ge-attr-group-title">{{ '分类' }} | {{ getCategoryName(group.catId) }}</h3>

                    <el-form ref="baseAttrFormRef" :model="spuInfo" class="ge-attr-form" label-position="left" label-width="100px">
                      <el-form-item
                          v-for="(attr, aidx) in group.attrs"
                          :key="attr.attrId"
                          :label="attr.attrName"
                          class="ge-attr-form-item"
                      >
                        <div class="ge-attr-input-container">
                          <!-- 隐藏的属性ID字段 -->
                          <el-input
                              v-model="dataResp.baseAttrs[gidx][aidx].attrId"
                              type="hidden"
                              v-show="false"
                          ></el-input>

                          <!-- 隐藏的属性名称字段 -->
                          <el-input
                              v-model="dataResp.baseAttrs[gidx][aidx].attrName"
                              type="hidden"
                              v-show="false"
                          ></el-input>

                          <!-- 根据是否有选择值来决定使用选择框还是输入框 -->
                          <el-select
                              v-if="attr.valueSelect && attr.valueSelect.split(',').length > 0"
                              v-model="dataResp.baseAttrs[gidx][aidx].attrValue"
                              :multiple="attr.valueType == 1"
                              filterable
                              allow-create
                              default-first-option
                              class="ge-attr-input"
                              placeholder="请选择或输入值">
                            <el-option
                                v-for="(val, vidx) in attr.valueSelect.split(',')"
                                :key="vidx"
                                :label="val"
                                :value="val"
                            ></el-option>
                          </el-select>
                          <el-input
                              v-else
                              v-model="dataResp.baseAttrs[gidx][aidx].attrValue"
                              placeholder="请输入属性值"
                              class="ge-attr-input"
                          ></el-input>

                          <!-- 快速展示选项 -->
                          <el-checkbox
                              v-model="dataResp.baseAttrs[gidx][aidx].showDesc"
                              :true-label="1"
                              :false-label="0"
                              class="ge-attr-checkbox"
                          >快速展示
                          </el-checkbox>
                        </div>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 - 上一步和下一步 -->
              <div class="ge-button-container">
                <div class="ge-button">
                  <el-button type="primary" @click="previousStep">上一步：设置产品信息</el-button>
                  <el-button type="primary" @click="goToSaleAttrs">下一步：设置销售属性</el-button>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 第三步：销售属性 - 选择商品的销售属性和值 -->
          <div class="ge-body-form" v-show="active === 3">
            <el-card class="ge-card ge-card-smaller">
              <div slot="header" class="clearfix">
                <span>选择销售属性</span>
              </div>
              <div class="ge-sale-attr-center">
                <el-form ref="saleAttrFormRef" :model="spuInfo" class="ge-sale-attr-form">
                  <el-form-item
                      v-for="(attr, aidx) in dataResp.saleAttrs"
                      :key="attr.id"
                      class="ge-sale-attr-item"
                  >
                    <div class="ge-sale-attr-header">
                      <span class="ge-sale-attr-name">{{ attr.name }}</span>
                    </div>

                    <div class="ge-sale-attr-content">
                      <!-- 隐藏的属性ID字段 -->
                      <el-input
                          v-model="dataResp.tempSaleAttrs[aidx].attrId"
                          type="hidden"
                          v-show="false"
                      ></el-input>

                      <!-- 隐藏的属性名称字段 -->
                      <el-input
                          v-model="dataResp.tempSaleAttrs[aidx].attrName"
                          type="hidden"
                          v-show="false"
                      ></el-input>

                      <!-- 销售属性值多选框组 -->
                      <el-checkbox-group v-model="dataResp.tempSaleAttrs[aidx].attrValues" class="ge-sale-attr-checkbox-group">
                        <el-checkbox
                            v-if="attr.valueSelect"
                            :label="val"
                            v-for="val in attr.valueSelect.split(',')"
                            :key="val"
                        ></el-checkbox>

                        <!-- 自定义销售属性值按钮和输入框 -->
                        <div class="ge-custom-attr">
                          <el-button
                              v-show="!inputVisible[aidx].view"
                              class="button-new-tag"
                              size="mini"
                              @click="showInput(aidx)"
                          >+自定义
                          </el-button>
                          <el-input
                              v-show="inputVisible[aidx].view"
                              v-model="inputValue[aidx].val"
                              :ref="`saveTagInput${aidx}`"
                              size="mini"
                              style="width: 9.375rem"
                              @keyup.enter.native="handleInputConfirm(aidx)"
                              @blur="handleInputConfirm(aidx)"
                          ></el-input>
                        </div>
                      </el-checkbox-group>
                    </div>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 操作按钮 -->
              <div class="ge-button-container">
                <div class="ge-button">
                  <el-button type="primary" @click="previousStep">上一步：设置基本属性</el-button>
                  <el-button type="primary" @click="goToSkuInfo">下一步：设置商品信息</el-button>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 第四步：SKU信息 - 设置具体的SKU详情 -->
          <div class="ge-body-form" v-show="active === 4">
            <el-card class="ge-card ge-sku-card">
              <div class="ge-sku-table-container">
                <el-table
                    :data="spuInfo.skus"
                    style="width: 100%"
                    :default-expand-all="false"
                    row-key="tempId">
                  <!-- 属性组合列 - 展示SKU的销售属性组合 -->
                  <el-table-column label="属性组合">
                    <el-table-column
                        :label="item.attrName"
                        width="200"
                        v-for="(item, index) in dataResp.tableAttrColumn"
                        :key="item.attrId"
                    >
                      <template #default="scope">
                        <span style="margin-left: 0.625rem">{{ scope.row && scope.row.attr && scope.row.attr[index] ? scope.row.attr[index].attrValue : '' }}</span>
                      </template>
                    </el-table-column>
                  </el-table-column>

                  <!-- 商品名称列 -->
                  <el-table-column label="商品名称" prop="skuName">
                    <template #default="scope">
                      <el-input v-model="scope.row.skuName"></el-input>
                    </template>
                  </el-table-column>

                  <!-- 标题列 -->
                  <el-table-column  label="标题" prop="skuTitle">
                    <template #default="scope">
                      <el-input v-model="scope.row.skuTitle"></el-input>
                    </template>
                  </el-table-column>

                  <!-- 副标题列 -->
                  <el-table-column  label="副标题" prop="skuSubtitle">
                    <template #default="scope">
                      <el-input v-model="scope.row.skuSubtitle"></el-input>
                    </template>
                  </el-table-column>

                  <!-- 价格列 -->
                  <el-table-column label="价格" prop="price" width="120">
                    <template #default="scope">
                      <el-input v-model="scope.row.price"></el-input>
                    </template>
                  </el-table-column>

                  <!-- 库存列 - 新增 -->
                  <el-table-column label="库存数量" prop="stock" width="200">
                    <template #default="scope">
                      <el-input-number
                          v-model="scope.row.stock"
                          :min="0"
                          :precision="0"
                          controls-position="right">
                      </el-input-number>
                    </template>
                  </el-table-column>

                  <!-- 展开更多信息 - 图片选择和价格设置 -->
                  <el-table-column type="expand">
                    <template #default="scope">
                      <el-row>
                        <!-- 图集选择 -->
                        <el-col :span="24">
                          <label style="display: block; float: left">选择图集 或</label>
                          <ImagesUpload
                              style="float: left; margin-left: 0.625rem;"
                              v-model="uploadImages"
                          ></ImagesUpload>
                        </el-col>
                        <el-col :span="24">
                          <el-divider></el-divider>
                        </el-col>

                        <!-- 修改后的图片展示与选择 -->
                        <el-col :span="24">
                          <el-card
                              style="width: 10.625rem; float: left; margin-left: 0.9375rem; margin-top: 0.9375rem;"
                              :body-style="{ padding: '0px' }"
                              v-for="(img, index) in spuInfo.images"
                              :key="index"
                          >
                            <img
                                :src="getImageUrl(img)"
                                style="width: 10rem; height: 7.5rem"
                            />
                            <div style="padding: 0.875rem;">
                              <el-row>
                                <el-col :span="12">
                                  <!-- 修改后的图片选择复选框 -->
                                  <el-checkbox
                                      v-model="scope.row.images[index].imgUrl"
                                      :true-label="getImageUrl(img)"
                                      false-label
                                  ></el-checkbox>
                                </el-col>
                                <el-col :span="12">
                                  <!-- 修改后的设置默认图片单选按钮 -->
                                  <el-tag v-if="scope.row.images[index].defaultImg == 1">
                                    <input
                                        type="radio"
                                        checked
                                        :name="scope.row.skuName"
                                        @change="checkDefaultImg(scope.row, index, getImageUrl(img))"
                                    />设为默认
                                  </el-tag>
                                  <el-tag v-else>
                                    <input
                                        type="radio"
                                        :name="scope.row.skuName"
                                        @change="checkDefaultImg(scope.row, index, getImageUrl(img))"
                                    />设为默认
                                  </el-tag>
                                </el-col>
                              </el-row>
                            </div>
                          </el-card>
                        </el-col>
                      </el-row>

                      <!-- 价格和折扣设置 -->
                      <el-form :model="scope.row" class="ge-price-discount-form">
                        <el-row>
                          <!-- 库存高级设置 - 新增 -->
                          <el-col :span="24">
                            <el-form-item label="库存设置" class="ge-stock-row">
                              <div class="ge-stock-container">
                                <el-form-item label="预警库存">
                                  <el-input-number
                                      v-model="scope.row.lowStock"
                                      :min="0"
                                      :precision="0"
                                      controls-position="right"
                                      placeholder="当库存小于该值时预警">
                                  </el-input-number>
                                </el-form-item>
                                <el-checkbox
                                    v-model="scope.row.stockLocked"
                                    :true-label="1"
                                    :false-label="0">
                                  商品锁定
                                </el-checkbox>
                              </div>
                            </el-form-item>
                          </el-col>

                          <!-- 折扣设置 -->
                          <el-col :span="24">
                            <el-form-item label="设置折扣" class="ge-discount-row">
                              <div class="ge-discount-container">
                                <label>满</label>
                                <el-input-number
                                    style="width: 10rem"
                                    :min="0"
                                    controls-position="right"
                                    v-model="scope.row.fullCount"
                                ></el-input-number>
                                <label>件</label>

                                <label style="margin-left: 0.9375rem;">打</label>
                                <el-input-number
                                    style="width: 10rem"
                                    v-model="scope.row.discount"
                                    :precision="2"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    controls-position="right"
                                ></el-input-number>
                                <label>折</label>
                                <el-checkbox
                                    v-model="scope.row.countStatus"
                                    :true-label="1"
                                    :false-label="0"
                                >可叠加优惠
                                </el-checkbox>
                              </div>
                            </el-form-item>
                          </el-col>

                          <!-- 满减设置 -->
                          <el-col :span="24">
                            <el-form-item label="设置满减" class="ge-price-reduction-row">
                              <div class="ge-price-reduction-container">
                                <label>满</label>
                                <el-input-number
                                    style="width: 10rem"
                                    v-model="scope.row.fullPrice"
                                    :step="100"
                                    :min="0"
                                    controls-position="right"
                                ></el-input-number>
                                <label>元</label>
                                <label style="margin-left: 0.9375rem;">减</label>
                                <el-input-number
                                    style="width: 10rem"
                                    v-model="scope.row.reducePrice"
                                    :step="10"
                                    :min="0"
                                    controls-position="right"
                                ></el-input-number>
                                <label>元</label>
                                <el-checkbox
                                    v-model="scope.row.priceStatus"
                                    :true-label="1"
                                    :false-label="0"
                                >可叠加优惠
                                </el-checkbox>
                              </div>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </el-form>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 操作按钮 -->
              <div class="ge-button-container">
                <div class="ge-button">
                  <el-button type="primary" @click="previousStep">上一步：设置销售属性</el-button>
                  <el-button type="primary" @click="submitSkus">下一步：保存商品信息</el-button>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 第五步：完成 - 展示成功信息 -->
          <div class="ge-body-form" v-show="active === 5">
            <el-card class="ge-card">
              <div class="ge-success">
                <el-result
                    icon="success"
                    title="商品录入成功"
                    sub-title="您的商品已经成功录入系统"
                >
                  <template #extra>
                    <div class="ge-button-container">
                      <div class="ge-button">
                        <el-button type="primary" @click="addAgain">继续添加</el-button>
                        <el-button @click="returnToList">返回列表</el-button>
                      </div>
                    </div>
                  </template>
                </el-result>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// 导入图片上传组件
import ImagesUpload from "@/components/utils/ImagesUpload.vue";
// 导入Element Plus图标
import {
  CircleCheck,
  Goods,
  GoodsFilled,
  Handbag,
  ShoppingBag
} from "@element-plus/icons-vue";

export default {
  name: "GoodsEntry",
  components: {
    ImagesUpload // 注册图片上传组件
  },
  // 计算属性用于图标和当前选中的属性组
  computed: {
    // 提供图标组件的访问器
    CircleCheck() {
      return CircleCheck;
    },
    Handbag() {
      return Handbag;
    },
    GoodsFilled() {
      return GoodsFilled;
    },
    ShoppingBag() {
      return ShoppingBag;
    },
    Goods() {
      return Goods;
    },
    // 获取当前选中的属性组索引
    currentGroupIndex() {
      // 获取当前激活的标签页索引
      if (this.$refs.attrTabsRef) {
        return parseInt(this.$refs.attrTabsRef.currentName) || 0;
      }
      return 0;
    }
  },
  data() {
    return {
      // 当前步骤索引 (1-5)
      active: 1,

      // 商品信息对象 - 核心数据结构 - 已添加merchantUsername字段
      spuInfo: {
        spuName: "", // 商品名称
        spuDescription: "", // 商品描述
        catalogId: 0, // 商品分类ID
        brandId: "", // 品牌ID
        publishStatus: 0, // 发布状态 0-未发布 1-已发布
        merchantUsername: "", // 商户用户名 - 新增
        decript: [], // 商品详情图片URL数组
        images: [], // 商品图集URL数组 - 需要添加imgName和imgUrl
        baseAttrs: [], // 基本属性值数组 - 需要添加attrName
        skus: [] // SKU信息列表 - 需要修改attr和images数组中的对象
      },

      // 品牌ID - 用于双向绑定选择器
      brandId: '',

      // 分类ID路径 - 用于级联选择器
      categoryIds: [],

      // 上传图片临时存储
      uploadImages: [],

      // 品牌列表数据
      brands: [],

      // 分类列表数据
      categories: [],

      // 分类级联选择器配置
      categoryProps: {
        value: 'id', // 值字段名
        label: 'name', // 显示字段名
        children: 'childrenCategories' // 子分类字段名
      },

      // SPU基本信息验证规则 - 添加merchantUsername验证
      spuBaseInfoRules: {
        spuName: [
          {required: true, message: "请输入商品名称", trigger: "blur"}
        ],
        merchantUsername: [
          {required: true, message: "请输入商户账号", trigger: "blur"}
        ],
        spuDescription: [
          {required: true, message: "请输入商品描述", trigger: "blur"}
        ],
        catalogId: [
          {required: true, message: "请选择商品分类", trigger: "blur"}
        ],
        brandId: [
          {required: true, message: "请选择商品品牌", trigger: "blur"}
        ],
        decript: [
          {required: true, message: "请上传商品详情图片", trigger: "blur"}
        ],
        images: [
          {required: true, message: "请上传商品图片", trigger: "blur"}
        ]
      },

      // 后台返回的各种数据 - 预初始化所有属性
      dataResp: {
        attrGroups: [], // 属性组
        baseAttrs: [], // 基本属性
        saleAttrs: [], // 销售属性
        tempSaleAttrs: [], // 临时销售属性(用于UI展示和选择)
        tableAttrColumn: [], // 表格属性列(用于SKU表格)
        steped: [false, false, false, false, false] // 步骤完成状态
      },

      // 分类名称映射表 - 用于快速查找分类名称
      categoryNameMap: {},

      // 自定义销售属性相关数据 - 预初始化
      inputVisible: [], // 输入框可见状态数组
      inputValue: [] // 输入框值数组
    };
  },
  watch: {
    // 监控分类ID变化，获取对应的品牌
    categoryId(path) {
      if (path && path.length) {
        // 获取最后一级分类ID
        const categoryId = path[path.length - 1];
        this.spuInfo.catalogId = categoryId;
      }
    },

    // 监控品牌ID变化
    brandId(val) {
      // 更新spuInfo中的brandId
      this.spuInfo.brandId = val;
    },

    // 修改后的上传图片监听方法 - 将imgeName改为imgName
    uploadImages(val) {
      // 处理上传的图片数据，确保格式一致
      const processedImages = val.map(img => {
        // 基本图片对象 - 改为使用imgName
        let imgObj = {
          imgName: this.getImageName(img), // 修改：imgeName -> imgName
          imgUrl: this.getImageUrl(img)     // 确保有图片URL
        };

        // 如果已经是字符串，转换为对象
        if (typeof img === 'string') {
          return imgObj;
        }

        // 如果是对象且有url属性，合并对象
        if (img && img.url) {
          return {...img, ...imgObj};
        }

        // 其他情况，返回处理后的对象
        return imgObj;
      });

      // 合并图片并去重（基于URL的唯一性）
      let imgArr = this.spuInfo.images.slice(); // 复制原数组

      // 添加新图片，避免重复
      processedImages.forEach(newImg => {
        const newImgUrl = newImg.imgUrl;
        // 检查是否已存在相同URL的图片
        const exists = imgArr.some(existingImg => existingImg.imgUrl === newImgUrl);
        if (!exists) {
          imgArr.push(newImg);
        }
      });

      // 更新每个SKU的图片选项
      this.spuInfo.skus.forEach((item, index) => {
        // 确保SKU有images数组
        if (!item.images) {
          this.spuInfo.skus[index].images = [];
        }

        let len = imgArr.length - this.spuInfo.skus[index].images.length; // 计算新增图片数量
        if (len > 0) {
          // 为新增图片创建图片对象数组，包含imgName属性 - 改为使用imgName
          let imgs = new Array(len);
          imgs = imgs.fill().map((_, i) => {
            const imgIdx = this.spuInfo.skus[index].images.length + i;
            return {
              imgUrl: "",
              defaultImg: 0,
              imgName: imgArr[imgIdx] ? imgArr[imgIdx].imgName : ""  // 修改：imgeName -> imgName
            };
          });
          this.spuInfo.skus[index].images = item.images.concat(imgs);
        }
      });

      // 更新SPU的图片数组
      this.spuInfo.images = imgArr;
    }
  },
  created() {
    // 获取商家账号
    this.getManagerUsername();
    // 初始化所有需要的数据结构，避免动态生成
    this.initializeDataStructures();

    // 组件创建时获取所有分类数据
    this.getCategories();
    // 获取品牌
    this.getCategoryBrands();
  },
  mounted() {
    // 组件挂载后处理ResizeObserver错误
    this.handleResizeObserverError();
  },
  methods: {
    /**
     * 获取商家账号
     */
    getManagerUsername(){
      // console.log("==================",this.$store.getters.getManager.username)
      this.spuInfo.merchantUsername = "管理员";
    },
    // 新增方法：初始化所有数据结构，避免动态生成
    initializeDataStructures() {
      // 确保dataResp中的所有属性都已初始化
      this.dataResp = {
        attrGroups: [], // 属性组
        baseAttrs: [],  // 基本属性
        saleAttrs: [],  // 销售属性
        tempSaleAttrs: [], // 临时销售属性
        tableAttrColumn: [], // 表格属性列
        steped: [false, false, false, false, false] // 步骤完成状态
      };

      // 初始化输入相关数据
      this.inputVisible = [];
      this.inputValue = [];
    },

    // 修改：获取图片名称方法 - 将imgeName改为imgName
    getImageName(img) {
      // 如果img是对象且有imgName属性（兼容新的命名）
      if (img && img.imgName) {
        return img.imgName;
      }

      // 兼容旧的imgeName属性
      if (img && img.imgeName) {
        return img.imgeName;
      }

      // 如果img是字符串，尝试从URL提取文件名
      if (typeof img === 'string') {
        const parts = img.split('/');
        return parts[parts.length - 1] || "未命名图片";
      }

      // 如果img是对象且有name属性
      if (img && img.name) {
        return img.name;
      }

      // 如果img有fileName属性
      if (img && img.fileName) {
        return img.fileName;
      }

      // 如果img有response属性且有文件名信息
      if (img && img.response && img.response.data && img.response.data.fileName) {
        return img.response.data.fileName;
      }

      // 无法识别的格式，生成一个时间戳文件名
      return "image_" + new Date().getTime();
    },

    // 修改后的获取图片URL方法 - 兼容新旧字段名
    getImageUrl(img) {
      // 如果img是对象且有imgUrl属性（新的图片格式）
      if (img && img.imgUrl) {
        return img.imgUrl;
      }

      // 如果img是字符串（直接是URL），直接返回
      if (typeof img === 'string') {
        return img;
      }

      // 如果img是对象且有url属性（上传组件返回的格式）
      if (img && img.url) {
        return img.url;
      }

      // 如果img有response属性（上传组件返回的格式）
      if (img && img.response && img.response.data && img.response.data.url) {
        return img.response.data.url;
      }

      // 如果img是File对象，生成临时URL
      if (img instanceof File) {
        return URL.createObjectURL(img);
      }

      // 无法识别的格式，返回空图片
      console.warn('无法识别的图片格式:', img);
      return '';
    },

    // 处理ResizeObserver错误 - 防止控制台报错
    handleResizeObserverError() {
      // 创建全局错误处理函数
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('ResizeObserver')) {
          // 阻止错误继续传播
          event.stopPropagation();
          event.preventDefault();
          return true;
        }
      }, true);

      // 替换控制台错误函数
      const originalError = console.error;
      console.error = function(...args) {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
          // 忽略ResizeObserver相关错误
          return;
        }
        originalError.apply(console, args);
      };
    },

    // 根据分类ID获取分类名称
    getCategoryName(categoryId) {
      if (this.categoryNameMap[categoryId]) {
        return this.categoryNameMap[categoryId];
      }
      return '未知分类';
    },

    // 构建分类名称映射表 - 递归处理多级分类
    buildCategoryNameMap(categories) {
      if (!categories) return;

      categories.forEach(cat => {
        // 添加分类ID到名称的映射
        this.categoryNameMap[cat.id] = cat.name;

        // 递归处理子分类
        if (cat.childrenCategories && cat.childrenCategories.length > 0) {
          this.buildCategoryNameMap(cat.childrenCategories);
        }
      });
    },

    // 获取分类列表
    getCategories() {
      // 发送请求获取分类树数据
      this.$http.get('/data/snack_platform/category/tree')
          .then(data => {
            if (data && data.code === 200) {
              // 更新分类数据
              this.categories = data.data;
              // 构建分类名称映射
              this.buildCategoryNameMap(data.data);
            } else {
              this.$message({
                type: "error",
                message: "没有查询到分类数据！"
              });
            }
          }).catch(error => {
        console.error('获取分类树数据失败:', error);
        this.$message.error('获取分类树数据失败');
      });
    },

    // 获取品牌
    getCategoryBrands() {
      // 发送请求获取品牌列表
      this.$http.get("/data/snack_platform/brand/list").then((data) => {
        // 更新品牌数据
        this.brands = data.data.page.list;
      }).catch(error => {
        this.$message.error("获取品牌数据失败：" + error.message);
      });
    },

    // 处理分类选择变化
    handleCategoryChange(value) {
      // 更新分类ID - 选择最后一级分类ID
      if (value && value.length > 0) {
        this.spuInfo.catalogId = value[value.length - 1];
      }
    },

    // 下一步：进入基本属性设置
    goToNextStep() {
      // 表单验证
      this.$refs.spuBaseFormRef.validate(valid => {
        if (valid) {
          // 验证通过，进入下一步
          this.active = 2;
          // 获取基本属性数据
          this.getBaseAttrs();
        } else {
          // 验证失败，提示用户
          this.$message.error("请完善SPU基本信息！");
          return false;
        }
      });
    },

    // 获取基本属性
    getBaseAttrs() {
      // 检查是否已加载属性组数据
      if (!this.dataResp.steped[0]) {
        // 获取基本属性列表(type=0表示基本属性)
        this.$http.get(`/data/snack_platform/attribute/list/merchant/attr`, {
          params: {
            'type': 0,
            'categoryId': this.spuInfo.catalogId
          }}).then((data) => {
          if (data && data.code === 200) {
            // 清空现有数据
            this.dataResp.baseAttrs = [];
            this.dataResp.attrGroups = [];

            // 获取属性组数据
            this.getAttributeGroups().then(groups => {
              // 设置属性组数据
              this.dataResp.attrGroups = groups;

              // 按照分类ID分组属性
              const attrGroups = {};
              let groupsMap = {};

              // 创建组ID映射
              groups.forEach(group => {
                groupsMap[group.categoryId] = group;
              });

              // 处理属性数据
              data.data.forEach(attr => {
                if (!attr) return;

                // 如果分类对应的组存在，将属性添加到该组
                if (groupsMap[attr.categoryId]) {
                  const groupId = attr.categoryId;

                  // 如果该分类的组不存在，创建一个新组
                  if (!attrGroups[groupId]) {
                    attrGroups[groupId] = {
                      id: groupsMap[groupId].id,
                      name: groupsMap[groupId].name,
                      description: groupsMap[groupId].description,
                      attrs: [],
                      catId: attr.categoryId
                    };
                  }

                  // 将属性添加到对应的分组中
                  attrGroups[groupId].attrs.push({
                    attrId: attr.id,
                    attrName: attr.name,
                    valueType: attr.isSearch, // 0-单选，1-多选
                    valueSelect: attr.valueSelect, // 可选值列表(逗号分隔)
                    showDesc: attr.showIntro // 快速展示
                  });
                }
              });

              // 转换为数组并更新到dataResp
              const groupArray = Object.values(attrGroups);
              this.dataResp.attrGroups = groupArray;

              // 为每个属性组初始化表单数据结构 - 修改attrValues为attrValue
              groupArray.forEach(group => {
                const attrArray = [];

                group.attrs.forEach(attr => {
                  attrArray.push({
                    attrId: attr.attrId,
                    attrName: attr.attrName,
                    attrValue: "", // 修改：使用attrValue代替attrValues作为属性名
                    showDesc: attr.showDesc // 继承属性的展示设置
                  });
                });

                // 只添加非空的属性数组
                if (attrArray.length > 0) {
                  this.dataResp.baseAttrs.push(attrArray);
                }
              });

              // 标记基本属性已加载
              this.dataResp.steped[0] = true;
            });
          } else {
            this.$message.error("获取属性组数据失败");
          }
        }).catch(error => {
          this.$message.error("获取属性组数据失败：" + error.message);
        });
      }
    },

    // 获取属性组数据
    getAttributeGroups() {
      // 发送请求获取属性组列表
      return this.$http.get("/data/snack_platform/attributegroup/list")
          .then(data => {
            if (data && data.code === 200) {
              return data.data.page.list;
            } else {
              this.$message.error("获取属性组数据失败");
              return [];
            }
          }).catch(error => {
            this.$message.error("获取属性组数据失败：" + error.message);
            return [];
          });
    },

    // 下一步：进入销售属性设置
    goToSaleAttrs() {
      // 收集基本属性数据
      this.collectBaseAttrs();

      // 进入销售属性步骤
      this.active = 3;

      // 获取销售属性数据
      this.getSaleAttrs();
    },

    // 收集基本属性数据 - 修改attrValues为attrValue
    collectBaseAttrs() {
      // 清空现有数据
      this.spuInfo.baseAttrs = [];

      // 遍历所有基本属性，收集有值的属性
      if (this.dataResp.baseAttrs && this.dataResp.baseAttrs.length) {
        this.dataResp.baseAttrs.forEach(item => {
          if (item && item.length) {
            item.forEach(attr => {
              if (attr) {
                let {attrId, attrName, attrValue, showDesc} = attr;

                // 跳过没有录入值的属性
                if (attrValue) {
                  // 处理多选值 - 转换为分号分隔的字符串
                  if (attrValue instanceof Array) {
                    attrValue = attrValue.join(";");
                  }

                  // 添加到SPU的基本属性中，使用attrValue
                  this.spuInfo.baseAttrs.push({
                    attrId,
                    attrName,
                    attrValue, // 修改：使用attrValue代替attrValues
                    showDesc
                  });
                }
              }
            });
          }
        });
      }
    },

    // 获取销售属性 - 不需要修改，因为销售属性使用的是attrValues
    getSaleAttrs() {
      // 检查是否已加载销售属性数据
      if (!this.dataResp.steped[1]) {
        // 获取销售属性列表(type=1表示销售属性)
        this.$http.get(`/data/snack_platform/attribute/list/merchant/attr`, {
          params: {
            'type': 1,
            'categoryId': this.spuInfo.catalogId
          }
        }).then((data) => {
          // 存储销售属性数据
          this.dataResp.saleAttrs = data.data || [];

          // 清空临时销售属性和相关UI控制数据
          this.dataResp.tempSaleAttrs = [];
          this.inputVisible = [];
          this.inputValue = [];

          // 初始化临时销售属性和相关UI控制数据
          if (data.data && data.data.length) {
            data.data.forEach(item => {
              // 为每个销售属性创建临时数据对象，包含attrName
              this.dataResp.tempSaleAttrs.push({
                attrId: item.id,
                attrName: item.name, // 确保包含属性名称
                attrValues: [] // 初始为空数组 - 销售属性仍使用attrValues
              });

              // 初始化输入框状态
              this.inputVisible.push({view: false});
              this.inputValue.push({val: ""});
            });
          }

          // 标记销售属性已加载
          this.dataResp.steped[1] = true;
        }).catch(error => {
          this.$message.error("获取销售属性失败：" + error.message);

          // 确保即使发生错误也有初始化的数组结构
          this.dataResp.saleAttrs = [];
          this.dataResp.tempSaleAttrs = [];
          this.inputVisible = [];
          this.inputValue = [];

          // 标记销售属性已加载（即使失败）
          this.dataResp.steped[1] = true;
        });
      }
    },

    // 显示自定义销售属性输入框
    showInput(idx) {
      // 检查并确保inputVisible数组已初始化
      if (!this.inputVisible[idx]) {
        // 如果该索引位置未初始化，则动态创建
        this.$set(this.inputVisible, idx, {view: true});
      } else {
        // 显示输入框
        this.inputVisible[idx].view = true;
      }

      // 使用nextTick确保DOM更新后获取焦点
      this.$nextTick(() => {
        // 使用模板字符串创建ref名称，并确保正确访问input元素
        const refName = `saveTagInput${idx}`;
        if (this.$refs[refName] && this.$refs[refName][0]) {
          this.$refs[refName][0].focus();
        }
      });
    },

    // 处理自定义销售属性输入确认
    handleInputConfirm(idx) {
      // 确保inputValue数组已初始化
      if (!this.inputValue[idx]) {
        this.$set(this.inputValue, idx, {val: ""});
        return;
      }

      let inputValue = this.inputValue[idx].val;

      if (inputValue && this.dataResp.saleAttrs[idx]) {
        // 更新销售属性的可选值
        if (!this.dataResp.saleAttrs[idx].valueSelect) {
          // 如果原来没有值，直接设置
          this.dataResp.saleAttrs[idx].valueSelect = inputValue;
        } else {
          // 如果原来有值，追加新值
          this.dataResp.saleAttrs[idx].valueSelect += "," + inputValue;
        }
      }

      // 重置输入状态
      this.inputVisible[idx].view = false;
      this.inputValue[idx].val = "";
    },

    // 修改后的设置SKU默认图片方法 - 将imgeName改为imgName
    checkDefaultImg(row, index, imgUrl) {
      // 确保row和images数组存在
      if (!row || !row.images || !row.images[index]) {
        console.error('设置默认图片失败：SKU或图片数据不完整');
        return;
      }

      // 获取图片名称 - 改为使用imgName
      let imgName = "";
      for (let img of this.spuInfo.images) {
        if (this.getImageUrl(img) === imgUrl) {
          imgName = img.imgName || this.getImageName(img);
          break;
        }
      }

      // 设置当前图片为选中状态，包含imgName
      row.images[index].imgUrl = imgUrl;
      row.images[index].imgName = imgName; // 设置图片名称
      row.images[index].defaultImg = 1;

      // 同时设置SKU默认图片路径
      row.skuDefaultImg = imgUrl;

      // 将其他图片设为非默认
      row.images.forEach((item, idx) => {
        if (idx !== index) {
          row.images[idx].defaultImg = 0;
        }
      });
    },

    // 下一步：进入SKU信息设置
    goToSkuInfo() {
      // 验证销售属性选择
      let hasSelected = false;

      if (this.dataResp.tempSaleAttrs && this.dataResp.tempSaleAttrs.length) {
        hasSelected = this.dataResp.tempSaleAttrs.some(attr => attr && attr.attrValues && attr.attrValues.length > 0);
      }

      if (!hasSelected) {
        this.$message.warning("请至少选择一个销售属性值！");
        return;
      }

      // 生成SKU
      this.generateSkus();

      // 进入SKU信息步骤
      this.active = 4;
    },

    // 修改后的生成SKU组合方法 - 添加merchantUsername字段，确保从SPU继承
    generateSkus() {
      // 准备销售属性列
      this.dataResp.tableAttrColumn = [];

      // 收集选中的销售属性值
      let selectValues = [];

      if (this.dataResp.tempSaleAttrs && this.dataResp.tempSaleAttrs.length) {
        this.dataResp.tempSaleAttrs.forEach(item => {
          if (item && item.attrValues && item.attrValues.length > 0) {
            // 收集有值的销售属性
            selectValues.push(item.attrValues);
            this.dataResp.tableAttrColumn.push(item);
          }
        });
      }

      // 如果没有选择销售属性值，则返回
      if (selectValues.length === 0) {
        this.$message.warning("请选择销售属性值！");
        return;
      }

      // 计算笛卡尔积获取所有SKU组合
      let descartes = this.descartes(selectValues);

      // 生成SKU列表
      let skus = [];

      descartes.forEach((descar, descarIdx) => {
        // 构建SKU的销售属性数组，包含attrName
        let attrArray = [];

        descar.forEach((de, index) => {
          // 确保tableAttrColumn数据存在
          if (this.dataResp.tableAttrColumn[index]) {
            // 构造销售属性信息，确保包含attrName
            let saleAttrItem = {
              attrId: this.dataResp.tableAttrColumn[index].attrId,
              attrName: this.dataResp.tableAttrColumn[index].attrName,
              attrValue: de
            };

            attrArray.push(saleAttrItem);
          }
        });

        // 初始化SKU图片数组 - 处理imgName
        let imgs = [];
        if (this.spuInfo.images && this.spuInfo.images.length) {
          this.spuInfo.images.forEach(img => {
            imgs.push({
              imgUrl: "",
              defaultImg: 0,
              imgName: img.imgName || this.getImageName(img) // 修改：imgeName -> imgName
            });
          });
        }

        // 检查是否已存在相同组合的SKU
        let existingSku = this.hasAndReturnSku(this.spuInfo.skus, descar);

        if (existingSku === null) {
          // 创建新的SKU，添加唯一ID用于表格展开状态保持
          skus.push({
            tempId: 'sku_' + Date.now() + '_' + descarIdx, // 添加唯一ID用于表格展开状态保持
            attr: attrArray, // 销售属性数组，包含attrName
            skuName: this.spuInfo.spuName + " " + descar.join(" "), // 自动生成SKU名称
            price: 0, // 初始价格为0
            stock: 0, // 初始库存为0
            lowStock: 5, // 默认库存预警值为5
            stockLocked: 0, // 默认库存未锁定
            skuTitle: this.spuInfo.spuName + " " + descar.join(" "), // 自动生成标题
            skuSubtitle: "", // 副标题初始为空
            images: imgs, // 图片数组，包含imgName
            descar: descar, // 保存原始组合用于比较
            fullCount: 0, // 折扣满件数
            discount: 0, // 折扣力度
            countStatus: 0, // 折扣可叠加状态
            fullPrice: 0.0, // 满减满额
            reducePrice: 0.0, // 满减金额
            priceStatus: 0, // 满减可叠加状态
            categoryId: this.spuInfo.catalogId, // 添加分类ID
            brandId: this.spuInfo.brandId, // 添加品牌ID
            skuDefaultImg: "", // 添加默认图片路径
            merchantUsername: this.spuInfo.merchantUsername // 新增：从SPU继承商户用户名
          });
        } else {
          // 使用现有SKU，确保它有唯一ID
          if (!existingSku.tempId) {
            existingSku.tempId = 'sku_' + Date.now() + '_' + descarIdx;
          }

          // 确保现有SKU有库存相关字段
          if (existingSku.stock === undefined) {
            existingSku.stock = 0;
          }
          if (existingSku.lowStock === undefined) {
            existingSku.lowStock = 5;
          }
          if (existingSku.stockLocked === undefined) {
            existingSku.stockLocked = 0;
          }

          // 确保attr数组中的每个对象都有attrName
          if (existingSku.attr) {
            existingSku.attr.forEach((attr, idx) => {
              if (!attr.attrName && this.dataResp.tableAttrColumn[idx]) {
                attr.attrName = this.dataResp.tableAttrColumn[idx].attrName;
              }
            });
          } else {
            // 如果attr数组不存在，创建一个新的
            existingSku.attr = attrArray;
          }

          // 确保images数组中的每个对象都有imgName - 改为使用imgName
          if (existingSku.images) {
            existingSku.images.forEach((img, idx) => {
              if (!img.imgName && this.spuInfo.images[idx]) {
                img.imgName = this.spuInfo.images[idx].imgName || this.getImageName(this.spuInfo.images[idx]);
              }
            });
          } else {
            // 如果images数组不存在，创建一个新的
            existingSku.images = imgs;
          }

          // 确保有新增的字段
          if (existingSku.categoryId === undefined) {
            existingSku.categoryId = this.spuInfo.catalogId;
          }
          if (existingSku.brandId === undefined) {
            existingSku.brandId = this.spuInfo.brandId;
          }
          if (existingSku.skuDefaultImg === undefined) {
            existingSku.skuDefaultImg = "";

            // 如果已经有默认图片，设置skuDefaultImg
            if (existingSku.images) {
              for (let img of existingSku.images) {
                if (img.defaultImg === 1 && img.imgUrl) {
                  existingSku.skuDefaultImg = img.imgUrl;
                  break;
                }
              }
            }
          }

          // 新增：确保有merchantUsername字段
          if (existingSku.merchantUsername === undefined) {
            existingSku.merchantUsername = this.spuInfo.merchantUsername;
          }

          skus.push(existingSku);
        }
      });

      // 更新SPU的SKU列表
      this.spuInfo.skus = skus;
    },

    // 检查SKU是否已存在
    hasAndReturnSku(skus, descar) {
      if (!skus || skus.length === 0) return null;

      // 查找具有相同属性组合的SKU
      for (let i = 0; i < skus.length; i++) {
        if (skus[i].descar && skus[i].descar.join(" ") === descar.join(" ")) {
          return skus[i];
        }
      }

      return null;
    },

    // 返回上一步
    previousStep() {
      if (this.active > 1) {
        this.active--;
      }
    },

    // 提交SKU信息，保存商品 - 确保每个SKU都添加merchantUsername
    submitSkus() {
      // 验证SKU数据
      let valid = true;

      // 检查是否有SKU
      if (!this.spuInfo.skus || this.spuInfo.skus.length === 0) {
        this.$message.error("请生成SKU信息！");
        return;
      }

      // 检查SKU价格和库存
      for (let sku of this.spuInfo.skus) {
        if (!sku.price) {
          this.$message.error("请设置所有SKU的价格！");
          valid = false;
          break;
        }

        if (sku.stock === undefined || sku.stock < 0) {
          this.$message.error("请设置所有SKU的库存数量，且不能小于0！");
          valid = false;
          break;
        }

        // 确保每个SKU都有merchantUsername
        sku.merchantUsername = this.spuInfo.merchantUsername;

        // 确保每个SKU都有categoryId、brandId和skuDefaultImg
        sku.categoryId = this.spuInfo.catalogId;
        sku.brandId = this.spuInfo.brandId;

        // 如果没有设置默认图片，检查是否有被标记为默认的图片
        if (!sku.skuDefaultImg && sku.images) {
          for (let img of sku.images) {
            if (img.defaultImg === 1 && img.imgUrl) {
              sku.skuDefaultImg = img.imgUrl;
              break;
            }
          }
        }

        // 如果仍然没有默认图片，但有选中的图片，使用第一个选中的图片
        if (!sku.skuDefaultImg && sku.images) {
          for (let img of sku.images) {
            if (img.imgUrl) {
              sku.skuDefaultImg = img.imgUrl;
              break;
            }
          }
        }
      }

      if (!valid) return;

      // 确认提交
      this.$confirm("将要提交商品数据，需要一小段时间，是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        // 处理提交的数据 - 确保所有需要的字段都正确包含
        const submitData = JSON.parse(JSON.stringify(this.spuInfo));

        // 处理图片数组 - 确保包含imgName和imgUrl - 改为使用imgName
        if (submitData.images && submitData.images.length) {
          submitData.images = submitData.images.map(img => {
            return {
              imgName: img.imgName || this.getImageName(img), // 修改：imgeName -> imgName
              imgUrl: this.getImageUrl(img)
            };
          });
        }

        // 处理商品详情图片
        if (submitData.decript && submitData.decript.length) {
          submitData.decript = submitData.decript.map(img => this.getImageUrl(img));
        }

        // 处理baseAttrs - 确保每一项都有attrName和使用attrValue而非attrValues
        if (submitData.baseAttrs && submitData.baseAttrs.length) {
          submitData.baseAttrs.forEach(attr => {
            if (!attr.attrName) {
              // 尝试从attrGroups中找到对应的属性名
              for (let group of this.dataResp.attrGroups) {
                if (group && group.attrs) {
                  for (let groupAttr of group.attrs) {
                    if (groupAttr.attrId === attr.attrId) {
                      attr.attrName = groupAttr.attrName;
                      break;
                    }
                  }
                }
                if (attr.attrName) break;
              }
            }
          });
        }

        // 处理SKU - 确保每个SKU都有所需字段
        if (submitData.skus && submitData.skus.length) {
          submitData.skus.forEach(sku => {
            // 确保每个SKU都有商户用户名
            sku.merchantUsername = submitData.merchantUsername;

            // 确保每个SKU都有分类ID、品牌ID和默认图片路径
            sku.categoryId = submitData.catalogId;
            sku.brandId = submitData.brandId;

            // 处理销售属性
            if (sku.attr && sku.attr.length) {
              sku.attr.forEach(attr => {
                if (!attr.attrName) {
                  // 尝试从tableAttrColumn中找到对应的属性名
                  for (let column of this.dataResp.tableAttrColumn) {
                    if (column && column.attrId === attr.attrId) {
                      attr.attrName = column.attrName;
                      break;
                    }
                  }
                }
              });
            }

            // 处理图片 - 改为使用imgName
            if (sku.images && sku.images.length) {
              // 过滤掉没有选中的图片
              sku.images = sku.images.filter(img => img.imgUrl);

              sku.images.forEach((img, idx) => {
                // 确保图片有imgName和正确的imgUrl
                if (img.imgUrl) {
                  if (!img.imgName) {
                    // 尝试从SPU图片中获取名称
                    if (submitData.images[idx]) {
                      img.imgName = submitData.images[idx].imgName;
                    } else {
                      // 生成一个基于URL的名称
                      const urlParts = img.imgUrl.split('/');
                      img.imgName = urlParts[urlParts.length - 1] || "image_" + idx;
                    }
                  }

                  // 如果该图片是默认图片，设置skuDefaultImg
                  if (img.defaultImg === 1) {
                    sku.skuDefaultImg = img.imgUrl;
                  }
                }
              });

              // 如果没有设置默认图片但有图片，使用第一张图片作为默认
              if (!sku.skuDefaultImg && sku.images.length > 0 && sku.images[0].imgUrl) {
                sku.skuDefaultImg = sku.images[0].imgUrl;
                sku.images[0].defaultImg = 1;
              }
            }
          });
        }

        console.log("======================最后的结果",JSON.stringify(submitData))

        // 发送保存请求
        this.$http.post("/data/snack_platform/spuinfo/save/spu", submitData)
            .then((data) => {
              if (data.code === 200) {
                this.$message({
                  type: "success",
                  message: "商品保存成功!"
                });

                // 进入完成步骤
                this.active = 5;
              } else {
                this.$message({
                  type: "error",
                  message: "保存失败，原因：" + data.msg
                });
              }
            }).catch(error => {
          this.$message.error("保存失败：" + error.message);
        });
      }).catch(() => {
        this.$message({
          type: "info",
          message: "已取消提交"
        });
      });
    },

    // 添加新商品 - 修复后的方法
    addAgain() {
      // 重置步骤
      this.active = 1;

      // 重置数据 - 完全重置所有数据结构
      this.resetData();

      // 重新初始化所有数据结构，避免访问undefined属性
      this.initializeDataStructures();
    },

    // 返回商品列表
    returnToList() {
      // 导航到商品列表页面
      // this.$router.push('/commodity/list');
    },

    // 重置数据 - 更新为包含新字段
    resetData() {
      // 重置SPU信息
      this.spuInfo = {
        spuName: "",
        spuDescription: "",
        catalogId: 0,
        brandId: "",
        publishStatus: 0,
        // merchantUsername: "", // 保留商户用户名字段
        decript: [],
        images: [],
        baseAttrs: [],
        skus: []
      };

      // 重置其他数据
      this.brandId = "";
      this.categoryIds = [];
      this.uploadImages = [];

      // 重置响应数据
      this.dataResp = {
        attrGroups: [], // 属性组
        baseAttrs: [],  // 基本属性
        saleAttrs: [],  // 销售属性
        tempSaleAttrs: [], // 临时销售属性
        tableAttrColumn: [], // 表格属性列
        steped: [false, false, false, false, false] // 步骤完成状态
      };

      // 重置输入相关数据
      this.inputVisible = [];
      this.inputValue = [];
    },

    // 笛卡尔积计算（用于生成所有可能的SKU组合）
    descartes(list) {
      // 检查输入列表的有效性
      if (!list || list.length === 0) return [];

      // 单维度数据直接返回转换为二维数组
      if (list.length === 1) return list[0].map(item => [item]);

      // 创建结果数组
      let result = [];

      // 获取第一个数组
      let first = list[0];

      // 递归计算剩余数组的笛卡尔积
      let remaining = this.descartes(list.slice(1));

      // 组合第一个数组的每个元素与剩余数组的笛卡尔积
      for (let i = 0; i < first.length; i++) {
        for (let j = 0; j < remaining.length; j++) {
          result.push([first[i]].concat(remaining[j]));
        }
      }

      return result;
    }
  }
};
</script>

<style scoped>
/* 通用样式设置 - 使用scoped确保只在当前组件生效 */
.ge-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* 头部和步骤条 */
.ge-header {
  margin-bottom: 1rem;
  padding: 1rem 0;
}

.ge-header-steps {
  width: 100%;
  margin: 0 auto;
}

/* 主体内容区域 */
.ge-body {
  width: 100%;
  margin-top: 1rem;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  overflow-y: auto;
}

/* 表单区域 */
.ge-body-form {
  width: 100%;
  max-height: calc(100vh - 10rem);
  padding: 1rem;
  overflow-y: auto;
}

/* 表单容器 - 确保居中显示 */
.ge-form-container {
  display: flex;
  justify-content: center;
  align-content: center;
  width: 100%;
}

/* 第一步：表单项样式 */
.ge-form-item {
  width: 50%;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 0 auto;
}

/* 表单项内部容器，实现项目居中排列 */
.ge-form-items-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 水平布局表单项 - 修改为label和输入框在同一行 */
.ge-form-item-horizontal {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  width: 100%;
}

.ge-form-item-horizontal :deep(.el-form-item__label) {
  text-align: right;
  padding-right: 1rem;
  min-width: 5rem;
}

.ge-form-item-horizontal :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  margin-left: 0 !important;
}

/* 第一步：下一步按钮居中 */
.ge-button-center {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* 卡片样式 */
.ge-card {
  width: 70%;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

/* 调整卡片宽度 */
.ge-card-smaller {
  width: 60%;
}

/* 第一步：输入框宽度 */
.ge-input-name,
.ge-input-desc {
  width: 25rem !important;
}

.ge-input-category,
.ge-input-brand {
  width: 15rem !important;
}

/* 第二步：属性组布局 */
.ge-attr-layout {
  display: flex;
  width: 100%;
  min-height: 25rem;
}

.ge-left-tabs {
  width: 30%;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
  height: 100%;
}

.ge-right-form {
  width: 50%;
  padding: 0 1rem;
  overflow-y: auto;
  height: 100%;
  max-height: 60vh;
}

.ge-attr-group-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  color: #303133;
  padding-bottom: 0.5rem;
}

.ge-attr-group-form {
  padding: 0.5rem;
}

.ge-attr-form {
  width: 100%;
}

.ge-attr-form-item {
  margin-bottom: 1.25rem;
}

/* 左对齐属性输入 */
.ge-attr-input-container {
  display: flex;
  align-items: center;
}

.ge-attr-input {
  flex: 1;
  min-width: 20rem;
  text-align: left;
}

.ge-attr-checkbox {
  margin-left: 1rem;
  white-space: nowrap;
}

/* 第三步：销售属性样式 */
.ge-sale-attr-center {
  display: flex;
  justify-content: center;
  width: 100%;
}

.ge-sale-attr-form {
  width: 35%;
  max-height: 60vh;
  overflow-y: auto;
}

.ge-sale-attr-item {
  margin-bottom: 1.5rem;
  border-bottom: 1px dashed #ebeef5;
  padding-bottom: 1rem;
}

.ge-sale-attr-header {
  margin-bottom: 0.75rem;
}

.ge-sale-attr-name {
  font-weight: bold;
  font-size: 1rem;
  color: #303133;
}

.ge-sale-attr-content {
  padding-left: 1.25rem;
}

.ge-sale-attr-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.ge-custom-attr {
  margin-top: 0.5rem;
}

/* 第四步：SKU信息容器 */
.ge-sku-card {
  overflow: visible;
  width: 85%;
}

.ge-sku-table-container {
  width: 100%;
  overflow-x: auto;
  max-height: 60vh;
  overflow-y: auto;
}

/* 价格和折扣设置 */
.ge-price-discount-form {
  margin-top: 1.5rem;
  width: 100%;
}

/* 新增库存设置样式 */
.ge-stock-row {
  margin-bottom: 1rem;
  border-bottom: 1px dashed #ebeef5;
  padding-bottom: 1rem;
}

.ge-stock-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.ge-discount-row,
.ge-price-reduction-row {
  margin-bottom: 1rem;
}

.ge-discount-container,
.ge-price-reduction-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* 按钮容器 */
.ge-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 2rem;
}

.ge-button {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.ge-button .el-button {
  min-width: 12rem;
}

/* 成功页面 */
.ge-success {
  padding: 2rem;
  text-align: center;
}

/* 美化滚动条 */
.ge-body-form::-webkit-scrollbar,
.ge-right-form::-webkit-scrollbar,
.ge-sale-attr-form::-webkit-scrollbar,
.ge-sku-table-container::-webkit-scrollbar {
  width: 0.5rem;
  height: 0.5rem;
}

.ge-body-form::-webkit-scrollbar-track,
.ge-right-form::-webkit-scrollbar-track,
.ge-sale-attr-form::-webkit-scrollbar-track,
.ge-sku-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0.25rem;
}

.ge-body-form::-webkit-scrollbar-thumb,
.ge-right-form::-webkit-scrollbar-thumb,
.ge-sale-attr-form::-webkit-scrollbar-thumb,
.ge-sku-table-container::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 0.25rem;
}

.ge-body-form::-webkit-scrollbar-thumb:hover,
.ge-right-form::-webkit-scrollbar-thumb:hover,
.ge-sale-attr-form::-webkit-scrollbar-thumb:hover,
.ge-sku-table-container::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

/* 响应式调整 */
@media screen and (max-width: 64rem) {
  .ge-form-item {
    width: 85%;
  }

  .ge-card {
    width: 85%;
  }

  .ge-card-smaller {
    width: 75%;
  }

  .ge-attr-layout {
    flex-direction: column;
  }

  .ge-left-tabs {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 1rem;
  }

  .ge-right-form {
    width: 100%;
    padding: 1rem 0;
  }

  .ge-input-name,
  .ge-input-desc {
    width: 100% !important;
    max-width: 25rem;
  }

  .ge-input-category,
  .ge-input-brand {
    width: 100% !important;
    max-width: 15rem;
  }

  .ge-sale-attr-form {
    width: 90%;
  }

  .ge-stock-container {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media screen and (max-width: 48rem) {
  .ge-form-item {
    width: 95%;
  }

  .ge-card {
    width: 95%;
  }

  .ge-sku-card {
    width: 95%;
  }

  .ge-card-smaller {
    width: 90%;
  }

  .ge-button .el-button {
    min-width: 9rem;
  }

  .ge-discount-container,
  .ge-price-reduction-container {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media screen and (max-width: 30rem) {
  .ge-button {
    flex-direction: column;
    align-items: center;
  }

  .ge-button .el-button {
    width: 100%;
    margin: 0.5rem 0;
  }
}
</style>