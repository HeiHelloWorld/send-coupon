/*
 * @Author: LiTianfu
 * @Date: 2020-11-30 15:24:18
 * @LastEditTime: 2020-11-30 15:32:45
 * @LastEditors: LiTianfu
 * @Description: 提示与加载工具类
 * @FilePath: 
 */

export default class Tips {
  constructor() {
    this.isLoading = false;
  }
  
  static confirm(text, payload = {},{showCancel,cancelColor,confirmColor, title = "",confirmText = "确定"}) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: title,
        content: text,
        showCancel: showCancel || false,
        cancelColor: cancelColor || '#333333',
        confirmColor:confirmColor || '#dd1d21',
        confirmText:confirmText||'确定',
        success:(res)=>{
          if (res.confirm) {
            resolve(payload);
          } else if (res.cancel) {
            reject(payload);
          }
        },
        fail:()=>{
          reject(payload);
        }
      })
    });
  }

  static toast(title, onHide, icon = "none") {
    setTimeout(() => {
      wx.showToast({
        title, icon,
        mask: true,
        duration: 2000
      });
    }, 300);

    // 隐藏结束回调
    if (onHide) {
      setTimeout(() => {
        onHide();
      }, 2000);
    }
  }

  static loading(title = "加载中") {
    if (Tips.isLoading) {
      return;
    }
    Tips.isLoading = true;
    wx.showLoading({
      title,
      mask: true
    });
  }

  static loaded() {
    if (Tips.isLoading) {
      Tips.isLoading = false;
      wx.hideLoading();
    }
  }
}
  
/**
 * 静态变量，是否加载中
 */
Tips.isLoading = false;
