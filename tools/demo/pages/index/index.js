import api from '../../request';

let _this = null;

Page({
  data: {
    token: '',
    openid: '',
    stock_max: 0,
    loc_name: '',
    tag_id: '',
  },

  setPlugData(e) {
    const params = e.detail;
    if (params.type === 'SENDCOUPON') {
      console.log('获取插件签名: ', params);
      const stock_list = params.data;
      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/mock_send_sign',
        method: 'POST',
        data: { stock_list },
        success: res => {
          console.log('签名结果', res.data.sign)
          if (res.data.sign) {
            params.setPlugParams(res.data.sign);
          }
        },
        fail: err => {}
      })
    }
    if (params.type === 'SHOWDETAIL') {
      console.log('获取打开券详情参数: ', params);
      const data = params.data;
      api.doRequestCheckSessionSendCoupon({
        path: 'pay_ad/ad_open_card',
        method: 'POST',
        data,
        success: res => {
          if (res.data.card_list) {
            res.data.card_list.forEach((v, i) => {
              v.cardId = v.card_id
              v.openCardParams = v.open_params
              delete v.card_id
              delete v.open_params
            })
            params.setPlugParams(res.data.card_list);
          } else {
            TIP.toast(`打开券详情失败 !`);
          }
        },
        fail: err => {}
      })
    }
  },

  /**
   * 获取openid
   * @param {*} options 
   */
  getUserOpenid() {
    wx.login({
      success: res => {
        const APPID = 'wxb84551db1f6f04a0', SECRET = '43f8e64d72d9533de9ab4f673c0c0ecc', JSCODE = res.code;
        wx.request({
          url: `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${JSCODE}&grant_type=authorization_code`,
          method: 'GET',
          success: res => {
            if (res.data.openid) {
              _this.setData({ openid: res.data.openid })
            }
          },
          fail: err => { },
          complete: res => {},
        })
      },
      fail: err => {
        setTimeout(_this.getUserOpenid(), 100)
      },
      complete() { }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    this.getUserOpenid()
    this.setData({
      token: 'BhGDQJ368Ft8iShb6usAH4Xli8w4BerE',
      stock_max: 3,
      loc_name: 'fb_ad_loc'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

})
