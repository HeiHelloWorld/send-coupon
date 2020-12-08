# send-coupon-cy

畅移 - 好物集 发券组件。使用前需申请微信发券插件使用权限。

#### 使用前准备
##### 一. 申请发券插件使用权限
  1. 小程序账号登录[微信公众平台][01]
  2. 设置 —> 第三方服务 —> 添加插件 进入添加插件操作页面
  3. 搜索插件名 `微信支付券` 并添加, 提交审核待通过
##### 二. 在小程序app.json 文件中加入配置
```
// app.json
{
  "plugins": {
    "sendCoupon": {
      "version": "1.1.5",
      "provider": "wxf3f436ba9bd4be7b"
    }
  }
} 
```
##### 三. 添加request合法域名
  1. 小程序账号登录[微信公众平台][01]
  2. 开发 —> 开发管理 —> 开发设置 —> 服务器域名
  3. 在request合法域名中增加如下配置
  ```
  https://hwj-apicb-test-k8s.vchangyi.com
  ```

#### 使用方法
##### 一. npm安装, 参考 [小程序npm支持][npm支持]
```
npm install send-coupon-cy
```
##### 二. 构建
1. 小程序开发者工具 -> 详情(工具右上角) -> 本地设置 -> 使用npm模块
2. 小程序开发者工具 -> 工具 -> 构建 npm
3. 构建成功后小程序代码包中将产出 "miniprogram_npm" 文件夹
##### 三. 使用
+ 在需要使用该组件的页面json文件中声明(需配置自定义导航栏)
```
// index.json
{
  "navigationStyle": "custom",
  "usingComponents": {
    "send-coupon-cy": "send-coupon-cy"
  }
}
```
+ 在需要使用该组件的页面wxml文件中引入
```
// index.wxml
<send-coupon-cy 
  token="{{token}}" 
  openid="{{openid}}" 
  stock_max="{{stock_max}}" 
  loc_name="{{loc_name}}" 
  tag_id="{{tag_id}}" 
  plug_sign="{{plug_sign}}" 
  open_params="{{open_params}}" 
  bind:_getPlugSign="getPlugSign" 
  bind:_getOpenParams="getOpenParams" 
/>
```
+ 属性说明
|  变量    |  类型  | 必填? | 说明 |
|:----|:----:|:----:|:----|
| token | String | 是 | 用户token |
| openid | String | 是 | 用户openid |
| stock_max | Number | 是 | 最大批次数量, 不小于1, 不超过5 |
| loc_name | String | 是 | 流量位标识 |
| tag_id | String | 是 | 广告请求人群标签, 用于定向匹配 |
| plug_sign | String | 否 | 插件签名(第三方签名时必须) |
| open_params | Object | 否 | 打开券详情参数(第三方签名时必须) |
| getPlugSign | Function | 否 | 获取插件签名时所需参数(第三方签名时必须) |
| getOpenParams | Function | 否 | 获取券详情时所需参数(第三方签名时必须) |

##### 四. 第三方签名相关说明(非第三方签名请忽略该部分)
+ 在需要使用该组件的页面js文件中
```
Page({
  data: {
    plug_sign: '',  // 发券插件所需签名
    open_params: [],  // 打开券详情所需参数
  },
  onLoad: function(options) {
    /** 
    * YOUR CODE···
    */
  },

  ······

  /**
   *  获取插件所需签名
   * @param {e} 发券组件传递的券信息 
   */
  getPlugSign(e) {

    <!-- 
      e.detail.stock_list 为所展示的券信息, 可用于获取插件所需签名 
      stock_list 详见下表
    -->

    const stock_list = e.detail.stock_list;
    wx.request({
      url: 'YOUR_PATH',
      data: { stock_list },
      method: 'YOUR_METHOD',
      success: res => {
        /** 
          * 成功获取签名后, 进行赋值
          */
        this.setData({
          plug_sign: 'YOUR_SIGN'
        })
      },
      fail: err => {}
    })
  },

  /**
   *  获取打开券详情所需参数
   * @param {e} 需打开的券信息
   */
  getOpenParams(e) {

    <!-- 
      e.detail 为需要打开的券信息, 用于获取打开券详情参数
      cardParams 详见下表
    -->

    const cardParams = e.detail;
    wx.request({
      url: 'YOUR_PATH',
      data: cardParams,
      method: 'YOUR_METHOD',
      success: res => {
        /** 
         * 成功获取数据后, 进行处理并赋值
         * open_params 所需数据格式见下表
         */
        this.setData({
          open_params: [
            {
              cardId: 'CARD_ID',
              openCardParams: 'OPEN_CARD_PARAMS'
            }
          ]
        })
      },
      fail: err => {}
    })
  }
})
```
+ stock_list 属性说明
|  变量    |  类型  | 说明 |
|:----|:----:|:----|
| name | String | 券名称 |
| logo | String | 券logo |
| stock_id | String | 券批次号 |
| send_type | Number | 券的领取状态 |
| coupon_code | String | 券code |
| out_request_no | String | 发券凭证 |
| coupon_value | Number | 券面额 |
| transaction_minimum | Number | 券门槛金额 |
| available_begin_time | Number | 券的有效期起始 |
| available_end_time | Number | 券的有效期结束 |

+ cardParams 属性说明
|  变量    |  类型  | 说明 |
|:----|:----:|:----|
| loc_name | String | 流量位标识 |
| openid | String | 用户openid |
| token | String | 用户token |
| stock_list | Object | 包含如下两个数据 |
| stock_id | String | 券批次号 |
| coupon_code | String | 券code |

+ open_params 所需数据说明
|  变量    |  类型  | 说明 |
|:----|:----:|:----|
| cardId | String | 券的批次号 |
| openCardParams | String | 打开参数 |

-------
-------

##### Tips
  1. ......


-------

[01]: 'https://mp.weixin.qq.com/'
[npm支持]: 'https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html'
