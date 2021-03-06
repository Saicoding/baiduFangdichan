// pages/pay/kanjia/kanjia.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let time = require('../../../common/time.js');
let appId = "wxf90a298a65cfaca8";
let secret = "4bb3fe58d349718b6832c04bf462d832";
let leftTime = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    first: false,
    jiasuUsers: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setPageInfo();
    let self = this;
    let me = options.me; //是不是本人进的页面
    let taocan = options.taocan;
    if (taocan == undefined || taocan == 'undefined') {
      taocan = "";
    }

    let mykan_id = options.mykan_id; //被分享者获得的砍单号
    if (mykan_id == 'undefined' || mykan_id == undefined) {
      mykan_id = "";
    }

    me = me == "1" ? 1 : 0;

    let user = swan.getStorageSync('user');

    swan.getSwanId({//获得设备唯一码
      success: function (res) {
        let swanid = res.data.swanid;
        if (me == 0) {
          //没有用户
          app.post(API_URL, "action=KanjiaInfo&kan_id=" + mykan_id, false, false, "").then(res => {
            let result = res.data.data[0];
            let endtime = result.endtime; //砍价截止时间
            let title = result.title; //抢购产品
            let money_now = result.money_now; //现在的价格

            console.log('ok')
            let money_zong = result.money_zong; //总价格

            let nowLength = self.getPostionOjb(money_now, money_zong);

            let kan_list = result.kan_list;

            //开始计时
            leftTime = time.leftTime2(endtime); //剩余时间(秒数)

            let interval = setInterval(res => {
              leftTime--;
              let timeObj = time.getTimeObj(leftTime);
              self.setData({
                timeObj: timeObj
              });
            }, 1000);

            let iskaned = self.getIskaned(swanid, kan_list); //是否已经砍过

            self.setData({
              endtime: endtime,
              swanid: swanid,
              nowLength: nowLength,
              interval: interval,
              title: title,
              money_now: money_now,
              money_zong: money_zong,
              first: false,
              kan_list: kan_list,
              iskaned: iskaned,
              loaded: true
            });
          });
        }
      }
    });

    self.setData({
      me: me,
      taocan: taocan,
      first: true,
      mykan_id: mykan_id
    });
  },
  /**
   * 生命周期函数
   */
  onReady: function () {
    this.kanjiaModel = this.selectComponent("#kanjiaModel");
  },

  /**
   * 得到现在价格的位置定位
   */
  getPostionOjb: function (money_now, money_zong) {
    let postionObj = {};
    let length = 300; //最多可以砍的距离
    let sub = money_zong - money_now;

    // 可以砍到的最低价格
    let lowestPrice = money_zong * 30 / 100;

    // 现在砍的进度
    let rate = sub / lowestPrice;

    // 现在砍的距离
    let nowLength = Math.ceil(length * rate);
    return nowLength;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    let taocan = self.data.taocan;
    let me = self.data.me;
    let interval = self.data.interval;

    let user = swan.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;

    let isReLoad = self.data.isReLoad; //是否是重复登录
    let first = self.data.first; //是否是第一次渲染页面

    if ((isReLoad || first) && user != "" && me == 1) {
      //如果user = "" 
      app.post(API_URL, "action=KanjiaCreate&loginrandom=" + loginrandom + "&zcode=" + zcode + "&taocan=" + taocan, false, false, "").then(res1 => {
        let kan_id = res1.data.data[0].kan_id;

        app.post(API_URL, "action=KanjiaInfo&kan_id=" + kan_id, false, false, "").then(res => {
          let result = res.data.data[0];
          let endtime = result.endtime; //砍价截止时间
          let title = result.title; //抢购产品
          let money_now = result.money_now; //现在的价格
          let money_zong = result.money_zong; //总价格
          let nowLength = self.getPostionOjb(money_now, money_zong);

          let kan_list = result.kan_list;

          //开始计时
          leftTime = time.leftTime2(endtime); //剩余时间(秒数)

          let interval = setInterval(res => {
            leftTime--;
            if (leftTime < 0) {
              //如果时间小于0，就显示活动已经结束
              leftTime = 0;
              self.setData({
                over: true
              });
            }
            let timeObj = time.getTimeObj(leftTime);
            self.setData({
              timeObj: timeObj
            });
          }, 1000);
          console.log(money_now)
          self.setData({
            endtime: endtime,
            nowLength: nowLength,
            interval: interval,
            taocan: taocan,
            title: title,
            money_now: money_now,
            money_zong: money_zong,
            first: false,
            kan_id: kan_id,
            kan_list: kan_list
          });
        });
      });
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let interval = this.data.interval;
    clearInterval(interval);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (result) {
    let me = this.data.me;
    let kan_id = "";
    if (me == 1) {
      //如果是自己
      kan_id = this.data.kan_id;
    } else {
      //如果是被分享的人
      kan_id = this.data.mykan_id;
    }

    this.kanjiaModel.hideDialog();
    return {
      title: '我正在抢购课程 求砍价!',
      path: '/pages/pay/kanjia/kanjia?mykan_id=' + kan_id,
      imageUrl: 'https://xcx2.chinaplat.com/images/shair_kan.png',
      success: res => {
        swan.navigateTo({
          // url: '/pages/pay/kanjia/kanjia?me=1&kan_id=' + kan_id,
        });
      },
      fail: res => {
        console.log('失败');
      }
    };
  },

  /**
   * 帮朋友砍价
   */
  kanjia: function (e) {
    let self = this;
    let loaded = self.data.loaded;
    let swanid = self.data.swanid;
    if (!loaded) {
      swan.showToast({
        title: '还没有载入完成,请等待2秒',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    //判断有没有登录
    let isLogin = swan.isLoginSync();
    if (isLogin.isLogin) {
      swan.getUserInfo({
        success: function (res) {
          let nickname = res.userInfo.nickName; //昵称
          let headurl = res.userInfo.avatarUrl; //头像
          //限制连续点击
          let kan_id = self.data.mykan_id;
          app.post(API_URL, "action=KanjiaRecords&kan_id=" + kan_id + "&unionid=" + swanid + "&headurl=" + headurl + "&nickname=" + nickname, false, false, "").then(res => {
            let money = res.data.data[0].money;
            let money_now = self.data.money_now - money; //现在的价格
            let money_zong = self.data.money_zong; //总价格             
            let nowLength = self.getPostionOjb(money_now, money_zong); //更新进度条
            self.kanjiaModel.showDialog();
            self.setData({
              isKaned: true, //是否已经砍了
              money: money,
              nowLength: nowLength,
              iskaned: iskaned,
              nickname: nickname,
              headurl: headurl
            });
          });
        }
      });
    } else {//如果没有登录
      let nickname = swanid;
      let headurl = "/imgs/my_error.jpg";
      //限制连续点击
      let kan_id = self.data.mykan_id;
      app.post(API_URL, "action=KanjiaRecords&kan_id=" + kan_id + "&unionid=" + swanid + "&headurl=" + headurl + "&nickname=" + nickname, false, false, "").then(res => {
        let money = res.data.data[0].money;
        let money_now = self.data.money_now - money; //现在的价格
        let money_zong = self.data.money_zong; //总价格             
        let nowLength = self.getPostionOjb(money_now, money_zong); //更新进度条
        self.kanjiaModel.showDialog();
        self.setData({
          isKaned: true, //是否已经砍了
          money: money,
          nowLength: nowLength,
          iskaned: iskaned,
          nickname: nickname,
          headurl: headurl
        });
      });
    }
  },

  /**
   * 去登录页面
   */
  _GOxuexi: function () {
    let url = encodeURIComponent('/pages/index/index');
    swan.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 判断是否帮他砍过
   */
  getIskaned: function (unionId, list) {
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      if (unionId == item.unionid) {
        return true;
      }
    }
    return false;
  },

  /**
   * 关闭砍价成功模块时，添加信息
   */
  _addKanjia: function () {
    let self = this;
    let kan_list = self.data.kan_list;
    let obj = {};

    obj.headurl = self.data.headurl;
    obj.nickname = self.data.nickname;
    obj.money = self.data.money;
    obj.addtime = "刚刚";

    kan_list.unshift(obj); //在第一的位置添加元素
    self.setData({
      kan_list: kan_list
    });
  }
});