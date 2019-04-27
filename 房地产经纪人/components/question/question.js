// components/question/question.js
let animate = require('../../common/animate.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num_color: {
      type: String,
      value: ""
    },
    px: {
      type: Number,
      value: 1
    },
    isModelReal: {
      type: Boolean,
      value: false
    },

    shiti: {
      type: Object,
      value: null
    },

    tx: {
      type: String,
      value: "",
      observer: function (tx) {
        let style_block = "";
        let style_question = "";
        let style_question_scroll = "";
        if (tx == "材料题") {
          style_block: "display:block;margin-bottom:30rpx;height:400rpx;";
          style_question = "position:fixed;z-index:10000";
          style_question_scroll = "height:400rpx;";
        } else {
          style_block = "display:none;"; //占位框
          style_question = "position:block";
        }
        this.setData({
          style_block: style_block,
          style_question: style_question,
          style_question_scroll: style_question_scroll
        });
      }
    },
    question: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isFold: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toogleShow: function (e) {
      let self = this;
      if (this.data.tx == '材料题') {//有材料题才有动画
        if (this.data.isFold) {
          animate.blockSpreadAnimation(90, 400, this);
          this.setData({
            isFold: false
          })
        } else {
          animate.blockFoldAnimation(400, 90, this);
          this.setData({
            isFold: true
          })
        }
      }
    }
  }
});