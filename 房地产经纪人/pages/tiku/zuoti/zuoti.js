// pages/tiku/zuoti/index.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
let common = require('../../../common/shiti.js');
let animate = require('../../../common/animate.js');
let share = require('../../../common/share.js');
let isFold = true; //默认都是折叠的
let post = require('../../../common/post.js');

//把winHeight设为常量，不要放在data里（一般来说不用于渲染的数据都不能放在data里）
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //书的编号,默认为0
    rightNum: 0, //正确答案数
    wrongNum: 0, //错误答案数

    isLoaded: false, //是否已经载入完毕,用于控制过场动画
    cl_question_hidden: false, //材料题是否隐藏题目
    checked: false, //选项框是否被选择
    doneAnswerArray: [], //已做答案数组
    markAnswerItems: [], //设置一个空数组

    isModelReal: false, //是不是真题或者押题
    isSubmit: false, //是否已提交答卷
    circular: true, //默认slwiper可以循环滚动
    myFavorite: 0, //默认收藏按钮是0
    xtCurrent: 0 //当前材料题小题滑块位置
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setPageInfo();
    swan.setNavigationBarTitle({
      title: options.title
    }); //设置标题

    let self = this;

    let user = swan.getStorageSync('user');
    let username = user.username;
    let acode = user.acode;
    let circular = false;
    let myFavorite = 0;

    //根据章是否有字节来定制最后一次访问的key
    let last_view_key = 'last_view' + options.zhangjie_id + options.zhangIdx + (options.jieIdx != "undefined" ? options.jieIdx : "") + user.username;

    let last_view = swan.getStorageSync(last_view_key); //得到最后一次的题目
    let px = last_view.px; //最后一次浏览的题的编号
    if (px == undefined) {
      px = 1; //如果没有这个px说明这个章节首次访问
      circular: false;
    }

    app.post(API_URL, "action=SelectShiti&px=" + px + "&z_id=" + options.z_id + "&username=" + username + "&acode=" + acode, false, false, "").then(res => {
      post.zuotiOnload(options, px, circular, myFavorite, res, user, self); //对数据进行处理和初始化
      isFold = false;
    }).catch(errMsg => {
      swan.hideLoading();
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
    //获得dialog组件
    this.markAnswer = this.selectComponent("#markAnswer");
    this.errorRecovery = this.selectComponent("#errorRecovery");
    this.clJiexi = this.selectComponent("#clJiexi");
    swan.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) {
        //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = windowHeight * (750 / windowWidth);
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight
        });
      }
    });
  },

  /**
  * 切换问题的动画
  */
  _toogleAnimation: function (e) {
    let self = this;
    let quspx = e.detail.px;//问题组件的px

    let px = self.data.px; //当前px
    let str = "#q" + px; //当前问题组件id
    let question = self.selectComponent(str); //当前问题组件
    console.log(question)
    let shitiArray = self.data.shitiArray; //当前试题数组
    let shiti = shitiArray[px - 1]; //当前试题
    let height = self.data.height;

    if (!shiti.isAnswer && !shiti.confirm) return;

    if (isFold) {
      question.setData({
        style2: "positon: fixed; left: 20rpx;height:" + height + "rpx"
      });
      // animate.questionSpreadAnimation(90, height, question);
      animate.blockSpreadAnimation(90, height, question);
      isFold = false;
    } else {
      question.setData({
        style2: "positon: fixed; left: 20rpx;height:90rpx"
      });
      // animate.questionFoldAnimation(height, 90, question);
      animate.blockFoldAnimation(height, 90, question);
      isFold = true;
    }
  },

  /**
   * slider改变事件
   */
  sliderChange: function (e) {
    let self = this;
    let lastSliderIndex = self.data.lastSliderIndex;
    let current = e.detail.current;
    let source = e.detail.source;
    let myFavorite = 0;
    let buy = this.data.buy;
    let px = self.data.px;
    let cpx = px;
    if (source != "touch") return;

    let direction = "";
    let shitiArray = self.data.shitiArray;
    let circular = self.data.circular;

    isFold = false;

    //判断滑动方向
    if (lastSliderIndex == 0 && current == 1 || lastSliderIndex == 1 && current == 2 || lastSliderIndex == 2 && current == 0) {
      //左滑
      direction = "左滑";
    } else {
      direction = "右滑";
    }

    // question.setData({
    //   style1: "display:block;margin-bottom:30rpx;height:90rpx"
    // })
    if (px >= 9 && buy == 0 && direction == "左滑") {
      //如果滑动大于10，并且没有购买
      console.log(self.data.zhangjie_id);
      let product = "";
      let zhangjie_id = self.data.zhangjie_id;
      if (zhangjie_id != "263" && zhangjie_id != "262") {
        product = 'DB16';
      } else {
        product = 'DB16';
      }

      swan.showModal({
        title: '提示',
        content: '权限不足！开通权限后继续学习。',
        confirmColor: '#2983fe',
        success: function (res) {
          if (res.confirm) {

            swan.navigateTo({
              url: '/pages/pay/pay?product=' + product + "&goBack=haha"
            });
          }

          if (!res.confirm) {
            common.storeLastShiti(px - 1, self); //存储最后一题的状态
            swan.navigateBack({});
          }
        }
      });
    }

    if (direction == "左滑") {
      px++;
    } else {
      px--;
    }

    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题
    myFavorite = midShiti.favorite;

    //每次滑动结束后初始化前一题和后一题
    if (direction == "左滑") {
      if (px < shitiArray.length) {
        //如果还有下一题
        nextShiti = shitiArray[px];
        common.initShiti(nextShiti, self); //初始化试题对象

        //先处理是否是已经回答的题    
        common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
      }
      preShiti = shitiArray[px - 2]; //肯定会有上一题
    } else {
      //右滑
      if (px > 1) {
        //如果还有上一题
        preShiti = shitiArray[px - 2];
        common.initShiti(preShiti, self); //初始化试题对象
        common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      }
      nextShiti = shitiArray[px];
    }

    common.storeLastShiti(px, self); //存储最后一题的状态

    //滑动结束后,更新滑动试题数组
    let sliderShitiArray = [];

    if (px != 1 && px != shitiArray.length) {
      if (current == 1) {
        if (nextShiti != undefined) sliderShitiArray[2] = nextShiti;
        sliderShitiArray[1] = midShiti;
        if (preShiti != undefined) sliderShitiArray[0] = preShiti;
      } else if (current == 2) {
        if (nextShiti != undefined) sliderShitiArray[0] = nextShiti;
        sliderShitiArray[2] = midShiti;
        if (preShiti != undefined) sliderShitiArray[1] = preShiti;
      } else {
        if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
        sliderShitiArray[0] = midShiti;
        if (preShiti != undefined) sliderShitiArray[2] = preShiti;
      }
    } else if (px == 1) {
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
      current = 0;
      self.setData({
        myCurrent: 0
      });
    } else if (px == shitiArray.length) {
      sliderShitiArray[0] = preShiti;
      sliderShitiArray[1] = midShiti;
      current = 1;
      self.setData({
        myCurrent: 1
      });
    }

    circular = px == 1 || px == shitiArray.length ? false : true; //如果滑动后编号是1,或者最后一个就禁止循环滑动

    self.setData({ //每滑动一下,更新试题
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      circular: circular,
      lastSliderIndex: current,
      xiaotiCurrent: 0, //没滑动一道题都将材料题小题的滑动框index置为0
      myFavorite: myFavorite,
      px: px,
      checked: false
    });
  },

  /**
   * 材料题点击查看解析
   */
  viewJiexi: function (e) {
    let jiexi = e.currentTarget.dataset.jiexi;
    let answer = e.currentTarget.dataset.answer;

    this.setData({
      cl_jiexi: jiexi,
      cl_answer: answer
    });

    this.clJiexi.showDialog();
  },

  /**
   * 作答
   */
  _answerSelect: function (e) {
    let self = this;
    let px = self.data.px;
    let done_daan = "";
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex; //当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1]; //本试题对象
    done_daan = shiti.TX == 1 ? e.detail.done_daan : shiti.selectAnswer; //根据单选还是多选得到done_daan

    if (shiti.TX == 2 && (shiti.selectAnswer == undefined || shiti.selectAnswer.length == 0)) {
      swan.showToast({
        title: '还没有作答 !',
        icon: 'none',
        duration:3000
      });
      return;
    }
    if (shiti.isAnswer) return;

    common.changeSelectStatus(done_daan, shiti, false); //改变试题状态
    common.changeSelectStatus(done_daan, currentShiti, false); //改变试题状态

    this.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    });

    common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

    common.postAnswerToServer(self.data.acode, self.data.username, shiti.id, shiti.flag, shiti.done_daan, app, API_URL); //向服务器提交答题结
    common.storeAnswerStatus(shiti, self); //存储答题状态

    common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self); //更新答题板状态

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
  },

  scrollTop: function () {
    this.setData({
      top: 200
    });
  },

  /**
   * 多选题选一个选项
   */
  _checkVal: function (e) {
    let self = this;
    let done_daan = e.detail.done_daan.sort();
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex; //当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1];
    //初始化多选的checked值
    // common.initMultiSelectChecked(shiti);
    common.initMultiSelectChecked(currentShiti);
    //遍历这个答案，根据答案设置shiti的checked属性

    done_daan = common.changeShitiChecked(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, shiti);
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    });
  },
  /**
   * 材料题点击开始作答按钮
   */
  CLZuoti: function (e) {
    let self = this;

    let px = self.data.px;
    let lastSliderIndex = self.data.lastSliderIndex;
    let shitiArray = self.data.shitiArray;
    let sliderShitiArray = self.data.sliderShitiArray;
    let shiti = shitiArray[px - 1];

    let sliderShiti = sliderShitiArray[lastSliderIndex];
    shiti.confirm = true;
    sliderShiti.confirm = true;

    // share.ifOverHeight(self, sliderShiti.xiaoti[0], sliderShitiArray);

    self.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    });
  },
  /**
   * 材料题多选点击一个选项
   */
  _CLCheckVal: function (e) {
    let self = this;
    let px = e.currentTarget.dataset.px;
    let done_daan = e.detail.done_daan.sort();
    let shitiArray = self.data.shitiArray;
    let shitiPX = self.data.px;
    let shiti = shitiArray[shitiPX - 1]; //本试题对象

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex; //当前滑动编号
    let currentShiti = sliderShitiArray[current];
    let currentXiaoti = currentShiti.xiaoti;

    let xiaoti = shiti.xiaoti; //材料题下面的小题
    for (let i = 0; i < xiaoti.length; i++) {
      if (px - 1 == i) {
        //找到对应小题
        if (xiaoti[i].isAnswer) return;
        //初始化多选的checked值
        common.initMultiSelectChecked(currentXiaoti[i]);
        //遍历这个答案，根据答案设置shiti的checked属性
        done_daan = common.changeShitiChecked(done_daan, currentXiaoti[i]);

        common.changeMultiShiti(done_daan, xiaoti[i]);
        common.changeMultiShiti(done_daan, currentXiaoti[i]);
      }
    }
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    });
  },
  /**
   * 材料题作答
   */
  _CLAnswerSelect: function (e) {
    let self = this;
    let px = e.currentTarget.dataset.px;

    let shitiPX = self.data.px; //试题的px
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[shitiPX - 1]; //本试题对象
    let done_daan = "";
    let xiaoti = shiti.xiaoti;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex; //当前滑动编号
    let currentShiti = sliderShitiArray[current];
    let currentXiaoti = currentShiti.xiaoti;

    if (shiti.isAnswer) return;
    shiti.flag = 0;

    for (let i = 0; i < xiaoti.length; i++) {
      if (xiaoti[i].flag == 1) shiti.flag = 1;
      if (px - 1 == i) {
        //找到对应的小题
        if (xiaoti[i].isAnswer) return;
        done_daan = xiaoti[i].TX == 1 ? e.detail.done_daan : xiaoti[i].selectAnswer; //根据单选还是多选得到done_daan,多选需要排序
        if (xiaoti[i].TX == 2 && xiaoti[i].selectAnswer == undefined) {
          swan.showToast({
            title: '还没有作答 !',
            icon: 'none'
          });
          return;
        }
        common.changeSelectStatus(done_daan, xiaoti[i], self); //改变试题状态
        common.changeSelectStatus(done_daan, currentXiaoti[i], self); //改变试题状态
        if (xiaoti[i].flag == 1) shiti.flag = 1; //如果小题错一个,整个材料题就是错的
        shiti.doneAnswer.push({
          'px': px,
          'done_daan': done_daan
        }); //向本材料题的已答数组中添加已答题目px 和 答案信息

        if (shiti.doneAnswer.length == xiaoti.length) {
          //说明材料题已经全部作答
          shiti.done_daan = shiti.doneAnswer; //设置该试题已作答的答案数组
          shiti.isAnswer = true;

          common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

          common.postAnswerToServer(self.data.acode, self.data.username, shiti.id, shiti.flag, "测试", app, API_URL); //向服务器提交答题结果

          common.storeAnswerStatus(shiti, self); //存储答题状态

          common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self); //更新答题板状态

          common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
        }
      }
    }
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    });
  },

  /**
   * 刚载入时的动画
   */
  onShow: function (e) {
    let self = this;
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () { },

  /**
   * 重新开始练习
   */
  _restart: function () {
    let self = this;
    self._hideMarkAnswer();
    common.lianxiRestart(self); //重新开始作答
  },

  /**
   * 切换纠错面板
   */

  _toggleErrorRecovery: function (e) {
    this.markAnswer.hideDialog();
    this.errorRecovery.toogleDialog();
  },

  /**
   * 切换答题板
   */
  _toogleMarkAnswer: function () {
    this.errorRecovery.hideDialog();
    this.markAnswer.toogleDialog();
  },
  /**
   * 显示答题板
   */
  showMarkAnswer: function () {
    this.markAnswer.showDialog();
  },
  /**
   * 隐藏答题板
   */
  _hideMarkAnswer: function () {
    this.markAnswer.hideDialog();
  },
  /**
   * 切换是否收藏该试题
   */
  _toogleMark: function (e) {
    let self = this;
    let username = self.data.username;
    let acode = self.data.acode;
    let myFavorite = self.data.myFavorite;
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];

    shiti.favorite = shiti.favorite == 0 ? 1 : 0;

    this.setData({
      myFavorite: shiti.favorite,
      shitiArray: shitiArray
    });
    app.post(API_URL, "action=FavoriteShiti&tid=" + shiti.id + "&username=" + username + "&acode=" + acode, false).then(res => { });
  },
  /**
   * 答题板点击编号事件,设置当前题号为点击的题号
   */
  _tapEvent: function (e) {
    let self = this;

    self.setData({
      display: true
    });

    let nowPx = this.data.nowPx;

    let px = e.detail.px;

    if (px >= 9 && this.data.buy == 0) {
      //如果滑动大于10，并且没有购买
      console.log(self.data.zhangjie_id);
      let product = "";
      let zhangjie_id = self.data.zhangjie_id;
      if (zhangjie_id != "263" && zhangjie_id != "262") {
        product = 'DB16';
      } else {
        product = 'DB18';
      }

      swan.showModal({
        title: '提示',
        content: '您还没有购买课程,购买课程继续观看',
        confirmColor: '#2983fe',
        success: function (res) {
          if (res.confirm) {

            swan.navigateTo({
              url: '/pages/pay/pay?product=' + product + "&goBack=haha"
            });
          }

          if (!res.confirm) {
            common.storeLastShiti(nowPx, self); //存储最后一题的状态
            swan.navigateBack({});
          }
        }
      });
    }

    let zhangIdx = self.data.zhangIdx;
    let jieIdx = self.data.jieIdx;
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let current = self.data.lastSliderIndex; //当前swiper的index
    let circular = self.data.circular;
    let myFavorite = 0;
    isFold = false;

    //得到swiper数组
    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题
    myFavorite = midShiti.favorite;

    let sliderShitiArray = [];

    common.initShiti(midShiti, self); //初始化试题对象

    common.processDoneAnswer(midShiti.done_daan, midShiti, self);

    if (px != 1 && px != shitiArray.length) {
      //如果不是第一题也是不是最后一题
      preShiti = shitiArray[px - 2];
      common.initShiti(preShiti, self); //初始化试题对象
      common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti, self); //初始化试题对象
      common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
    } else if (px == 1) {
      //如果是第一题
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti, self); //初始化试题对象
      common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
    } else {
      preShiti = shitiArray[px - 2];
      common.initShiti(preShiti, self); //初始化试题对象
      common.processDoneAnswer(preShiti.done_daan, preShiti, self);
    }

    common.storeLastShiti(px, self); //存储最后一题的状态

    //点击结束后,更新滑动试题数组
    if (px != 1 && px != shitiArray.length) {
      if (current == 1) {
        if (nextShiti != undefined) sliderShitiArray[2] = nextShiti;
        sliderShitiArray[1] = midShiti;
        if (preShiti != undefined) sliderShitiArray[0] = preShiti;
      } else if (current == 2) {
        if (nextShiti != undefined) sliderShitiArray[0] = nextShiti;
        sliderShitiArray[2] = midShiti;
        if (preShiti != undefined) sliderShitiArray[1] = preShiti;
      } else {
        if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
        sliderShitiArray[0] = midShiti;
        if (preShiti != undefined) sliderShitiArray[2] = preShiti;
      }
    } else if (px == 1) {
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
      current = 0;
      self.setData({
        myCurrent: 0
      });
    } else if (px == shitiArray.length) {
      sliderShitiArray[0] = preShiti;
      sliderShitiArray[1] = midShiti;
      current = 1;
      self.setData({
        myCurrent: 1
      });
    }

    circular = px == 1 || px == shitiArray.length ? false : true; //如果滑动后编号是1,或者最后一个就禁止循环滑动

    self.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      px: px,
      circular: circular,
      myFavorite: myFavorite,
      xiaotiCurrent: 0,
      lastSliderIndex: current,
      checked: false
    });
    self._hideMarkAnswer();

    let foldData = undefined; //动画
  },
  /**
   * 小题滑块改动时
   */
  xtSliderChange: function (e) {
    if (e.detail.source != 'touch') return; //如果不是手动滑动就返回
    let self = this;
    let lastSliderIndex = self.data.lastSliderIndex;
    let sliderShitiArray = self.data.sliderShitiArray;
    let sliderShiti = sliderShitiArray[lastSliderIndex]; //当前材料题
    let xtCurrent = e.detail.current;
    let xt = sliderShiti.xiaoti[xtCurrent]; //当前小题
    console.log(xt.answer);

    share.ifOverHeight(self, xt, sliderShitiArray);

    this.setData({
      xtCurrent: xtCurrent
    });
  },

  /**
   * 纠错提交后
   */
  _submit: function (e) {
    let self = this;

    let user = swan.getStorageSync('user');
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let reason = e.detail.reason;
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];
    let stid = "";

    if (shiti.TX == 99 && shiti.confirm) {
      let xtCurrent = self.data.xtCurrent;
      stid = shiti.xiaoti[xtCurrent].id;
    } else {
      stid = shiti.id;
    }

    app.post(API_URL, "action=JiuCuo&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&stid=" + stid + "&reason=" + reason, true, false, "提交中").then(res => {
      self.errorRecovery.hideDialog();
      swan.showToast({
        icon: 'none',
        title: '提交成功,辛苦了!',
        duration: 3000
      });
    });
  }
});