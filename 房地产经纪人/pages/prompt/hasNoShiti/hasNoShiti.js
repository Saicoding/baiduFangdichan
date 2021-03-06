// pages/hasNoErrorShiti/hasNoErrorShiti.js
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setPageInfo();
    let delta = options.delta;
    swan.setNavigationBarTitle({
      title: options.title
    }); //设置标题
    this.setData({
      delta: delta,
      str: options.str //提示字符串
    });
  },

  goBack: function () {
    swan.navigateBack({
      delta: this.data.delta
    });
  },

  onUnload: function () {
    // wx.navigateBack({
    //   delta: this.data.delta
    // })
  },

  onShow: function () {},
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {}
});