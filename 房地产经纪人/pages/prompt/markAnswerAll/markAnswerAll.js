// pages/jieAnswerAll/jieAnswerAll.js
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
    swan.setNavigationBarTitle({ title: "我的收藏" }); //设置标题
  },

  // onUnload:function(){
  //   wx.navigateBack({
  //     delta: 1
  //   })
  // },
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {},

  restart: function (options) {
    let pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      restart: true
    });
    swan.navigateBack();
  }
});