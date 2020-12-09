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
3. 在 `request合法域名` 中增加如下配置
```
https://api-prod.haowuji123.com
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
  bind:_setPlugData="setPlugData" 
/>
```
+ 参数说明
|  变量    |  类型  | 必填? | 说明 |
|:----|:----:|:----:|:----|
| token | String | 是 | 用户token |
| openid | String | 是 | 用户openid |
| stock_max | Number | 是 | 最大批次数量, 不小于1, 不超过5 |
| loc_name | String | 是 | 流量位标识 |
| tag_id | String | 是 | 广告请求人群标签, 用于定向匹配 |
| setPlugData | Function | 否 | 获取券详情时所需参数(第三方签名时必须) |

##### 四. 第三方签名相关说明(非第三方签名请忽略该部分)
+ 在需要使用该组件的页面js文件中
```
Page({
  data: {
    ······
  },
  onLoad: function(options) {
    /** 
    * YOUR CODE···
    */
  },

  ······

  /**
   * 设置组件所需数据
   * @param {e} 发券组件传递的券信息 
   */
  setPlugData(e) {
    const plugParams = e.detail;  // 参数说明见附表一
    if (plugParams.type === 'SENDCOUPON') {
      // 获取发券插件所需签名
      wx.request({
        url: 'YOUR_PATH',
        data: {
          stock_list: plugParams.stock_list // 参数说明见附表二
        },
        method: 'YOUR_METHOD',
        success: res => {
          /** 
          * 成功获取签名后, 调用方法进行赋值
          */
          plugParams.setPlugParams('YOUR_SIGN')
        },
        fail: err => {}
      })
    }
    if (plugParams.type === 'SHOWDETAIL') {
      // 获取打开券详情所需签名
      const data = params.data;
      wx.request({
        url: 'YOUR_PATH',
        data,  // 参数说明见附表三
        method: 'YOUR_METHOD',
        success: res => {
          /** 
          * 成功获取数据后, 进行处理并赋值
          * open_params 所需数据说明见附表四
          */
          const open_params = [
            {
              cardId: 'STOCK_ID',
              openCardParams: 'OPEN_CARD_PARAMS'
            }
          ]
          plugParams.setPlugParams(open_params)
        },
        fail: err => {}
      })
    }
  }
})
```
+ 附表一 plugParams 属性说明
|  变量    |  类型  | 说明 |
|:----|:----:|:----|
| type | String | 所需值类型, 值为'SENDCOUPON'或'SHOWDETAIL' |
| data | String | 接收到的参数, stock_list(详见附表二) 或 cardParams(详见附表三) |
| setPlugParams | Function | 将请求结果传递给发券组件 |

+ 附表二 stock_list 属性说明
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

+ 附表三 cardParams 属性说明
|  变量    |  类型  | 说明 |
|:----|:----:|:----|
| loc_name | String | 流量位标识 |
| openid | String | 用户openid |
| token | String | 用户token |
| stock_list | Object | 包含如下两个数据 |
| stock_id | String | 券批次号 |
| coupon_code | String | 券code |

+ 附表四 open_params 所需数据说明
|  变量    |  类型  | 必填? |  说明 |
|:----|:----:|:----:|:----|
| cardId | String | 是 | 券的批次号 |
| openCardParams | String | 是 | 打开参数, 格式为 `mch_id=商户号&sign=生成的签名` |

-------
-------

##### Tips
  1. ......


-------

[01]: 'https://mp.weixin.qq.com/'
[npm支持]: 'https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html'
