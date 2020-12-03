Component({
  options: {
    styleIsolation: 'isolated'
  },
  properties: {
    stock_list: {
      type: Object,
      value: []
    },
    coupon_img: {
      type: String,
      value: 'https://oss-crs.vchangyi.com/standard/empty_page_coupon.png'
    }
  },
  data: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击单张券
    _moreCouponDetail(e) {
      const id = e.currentTarget.dataset.id;
      this.triggerEvent('_moreCouponDetail', id);
    }
  }
})
