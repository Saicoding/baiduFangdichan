//app.js
App({
  /** 
   * 自定义post函数，返回Promise
   * +-------------------
   * author: 武当山道士<912900700@qq.com>
   * +-------------------
   * @param {String}      url 接口网址
   * @param {arrayObject} data 要传的数组对象 例如: {name: '武当山道士', age: 32}
   * +-------------------
   * @return {Promise}    promise 返回promise供后续操作
   */
  post: function (url, data, ifShow, ifCanCancel, title, pageUrl, ifGoPage, self) {

    if (ifShow) {
      swan.showLoading({
        title: title,
        mask: !ifCanCancel
      });
    }

    var promise = new Promise((resolve, reject) => {
      //init
      var that = this;
      var postData = data;
      /*
      //自动添加签名字段到postData，makeSign(obj)是一个自定义的生成签名字符串的函数
      postData.signature = that.makeSign(postData);
      */
      //网络请求

      postData = postData.split('&')
      let obj = {};
      for (let i = 0; i < postData.length; i++) {
        let m = postData[i];
        m = m.split('=');
        obj[m[0]] = m[1]
      }
      postData = obj

      swan.request({
        url: url,
        data: postData,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res)
          //服务器返回数据
          if (ifShow) {
            //隐藏载入
            swan.hideLoading();
          }
          let status = res.data.status * 1;
          let message = res.data.message;
          if (status == 1) {
            //请求成功
            resolve(res);
          } else if (status == -2) {
            //没有权限
            let product = res.data.taocan;

            swan.navigateTo({
              url: '/pages/pay/pay?product=' + product
            });
          } else if (status == -5) {
            //重复登录
            console.log('重复登录');
            if (self) {
              //如果传了这个参数
              self.setData({
                isReLoad: true
              });
            }
            swan.navigateTo({
              url: '/pages/login1/login1?url=' + pageUrl + '&ifGoPage=' + ifGoPage
            });
          } else if (status == -101) {
            //没有试题
            console.log('没有试题');
            self.setData({
              isHasShiti: false,
              isLoaded: true,
              message: message
            });
          } else {
            swan.showToast({
              title: message,
              icon: 'none',
              duration: 3000
            });
          }
        },
        error: function (e) {
          reject('网络出错');
        }
      });
    });
    return promise;
  },

  setPageInfo: function () {
    swan.setPageInfo && swan.setPageInfo({
      title: '房地产经纪人考试通',
      keywords: '房地产经纪人考试、房地产经纪人试题、房地产、房地产经纪人视频教程、房地产经纪人刷题、房地产经纪人动态、房地产经纪人做题、房地产经纪人直播、房地产经纪人考点、真题、房地产经纪人协理、房地产经纪人题库',
      description: '专注房地产经纪人、房地产经纪人协理考试；题库，直播，考点，真题，录播应有尽有！',
      articleTitle: '专注房地产经纪人、房地产经纪人协理考试；题库，直播，考点，真题，录播应有尽有！',
      releaseDate: '2019-04-27 12:01:30',
      image: [

      ],
      video: [{
        url: '',
        duration: '100',
        image: ''
      }],
      visit: {
        pv: '1000',
        uv: '100',
        sessionDuration: '130'
      },
      likes: '75',
      comments: '13',
      collects: '23',
      shares: '8',
      followers: '35',
      success: function () {

      }
    })
  },

  onLaunch: function () {
    // 展示本地存储能力
    var logs = swan.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    // wx.clearStorage();
    // wx.clearStorage("user")
    // 获取用户信息
    swan.setEnableDebug({
      enableDebug: true
    })
    swan.getSetting({
      success: res => {
        // if (res.authSetting['scope.userInfo']) {
        //   // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        //   wx.getUserInfo({
        //     success: res => {
        //       // 可以将 res 发送给后台解码出 unionId
        //       this.globalData.userInfo = res.userInfo

        //       // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        //       // 所以此处加入 callback 以防止这种情况
        //       if (this.userInfoReadyCallback) {
        //         this.userInfoReadyCallback(res)
        //       }
        //     }
        //   })
        // }
      }
    });
  },
  globalData: {
    userInfo: null,
    isLogin: false
  }
});