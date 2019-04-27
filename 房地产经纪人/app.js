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
          } else if (status < 0) {
            console.log('异常', url + postData);
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
      title: '晒元宵节活动红包，爱奇艺60张年卡、600张季卡等你拿！-百度贴吧',
      keywords: '百度,百度贴吧,好运中国年,60,晒元,宵节',
      description: '晒元宵节活动红包，爱..昨天的百度APP元宵节活动中，共发出2亿现金红包、含151万个手气现金大奖和240辆红旗轿车，谁是好运锦鲤，快来分享！马上惊喜升级~摇中红包的锦鲤们即刻晒出红包金额截图，我们将会抽取660位好运锦鲤',
      articleTitle: '晒元宵节活动红包，爱奇艺60张年卡、600张季卡等你拿！',
      releaseDate: '2019-01-02 12:01:30',
      image: [
        'http://c.hiphotos.baidu.com/forum/w%3D480/sign=73c62dda83b1cb133e693d1bed5456da/f33725109313b07e8dee163d02d7912396dd8cfe.jpg',
        'https://hiphotos.baidu.com/fex/%70%69%63/item/43a7d933c895d143e7b745607ef082025baf07ab.jpg'
      ],
      video: [{
        url: 'https://www.baidu.com/mx/v12.mp4',
        duration: '100',
        image: 'https://smartprogram.baidu.com/docs/img/image-scaleToFill.png'
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