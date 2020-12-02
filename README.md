# send-coupon-cy

畅移 - 好物集 发券组件。使用前需申请微信发券插件使用权限。

#### 使用前准备
1. 申请发券插件使用权限
    1) 小程序账号登录[微信公众平台][微信公众平台]
    2) 设置 —> 第三方服务 —> 添加插件 进入添加插件操作页面
    3) 搜索插件名 `微信支付券` 并添加, 提交审核待通过
2. 在小程序app.json 文件中加入配置
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
+ 在需要使用该组件的页面json文件中声明
```
// index.json
{
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


[微信公众平台]: 'https://mp.weixin.qq.com/'
[npm支持]: 'https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html'
