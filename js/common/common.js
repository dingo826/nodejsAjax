define(function (require, exports, module) {
    'use strict';
    var localDB = new (require('localDB'));

    $(function(){
        //日期
        Date.prototype.format = function(fmt) {
            var o = {
                "Y+": this.getFullYear(), //年
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
    });
    (function isLogin(){
        /*var personInfo = localDB.get('personInfo');
        if(personInfo == null){
            window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2039ed060d264454&redirect_uri=http%3A%2F%2Fblackdragon.tunnel.qydev.com%2Fwechat%2FgetOpenId&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect&url='
        }*/
    })();
   // var domain = 'http://172.16.20.103:7080';
    var domain = 'http://xiaoliang.tunnel.qydev.com'
    //方法加载中的等待图像
    function loading() {
        var dialog = '<div class="loading-page">' +
            '<div class="loading-img">' +
            '<div class="spinner">' +
            '<div class="rect1"></div>' +
            '<div class="rect2"></div>' +
            '<div class="rect3"></div>' +
            '<div class="rect4"></div>' +
            '<div class="rect5"></div>' +
            '</div>' +
            '</div>' +
            '</div>'
        var loading = $(dialog);
        loading.appendTo('body');
        return loading;
    }
    exports.loading = loading;
    //获得页面传来的参数如？id=123之类的
    exports.getParameter = function(pName) {
        var url = window.location.href,
            start = url.indexOf("?") + 1,
            paras = {};
        if (start !== 0) {
            var queryString = url.substring(start),
                paraNames = queryString.split("&"),
                arr = [],
                i = 0;
            for (; i < paraNames.length; i++) {
                arr = paraNames[i].split("=");
                if (i === paraNames.length - 1) {
                    var sIndex = arr[1].indexOf("#");
                    if (sIndex !== -1) {
                        arr[1] = arr[1].substring(0, sIndex);
                    }
                }
                paras[arr[0]] = arr[1]
            }
        }
        return decodeURIComponent(paras[pName] || "");
    }

    //提示信息
    var hint = function (info, middle, func) {
        var hint = $('.system-hint-area');
        if (!hint.length) {
            hint = $('<div class="system-hint-area"></div>').appendTo('body');
        }
        var op = $('<p></p>').html(info).hide(); //.appendTo(hint).after('<br/>');
        hint.html(op);
        op.fadeIn();

        //如果传入middle，就让hint显示在屏幕上方1/3出
        //不传入middle或传入的middle是其它值，就让hint显示在屏幕下方
        if (middle == 'middle') {
            hint.css({
                'margin-left': 0 - (op.outerWidth() / 2),
                'position': 'absolute',
                'top': ($(window).height() * 1 / 3)
            })
        } else {
            op.css({
                'margin-left': 0 - (op.outerWidth() / 2)
            })
        }

        setTimeout(function () {
            if (!op.siblings('p').length) {
                op.parent().remove();
            } else {
                op.remove();
            }
            if (func) {
                func();
            }
        }, 2000);
    }
    exports.hint = hint;
    //统一的ajax请求
    var ajax = function (json) {

        var url = domain + json.url,
            type = json.type,
            data = json.data,
            unpack = json.unpack,
            isLoading = json.isLoading,
            timeout = json.timeout,
            loadingAction;
        if (isLoading === true) {
            loadingAction = loading();
        }
        return $.ajax({
            type: type,
            data: data,
            dataType: 'jsonp',
            cache: (json.cache == "false" ? json.cache : "true"),  //原理 在后面加时间戳
            async: (json.async == "false" ? json.async : "true"),
            timeout: timeout ||　30000,
            url: url,
            success: function (res) {                
                if (isLoading === true) {
                    loadingAction.remove();
                }
                try {
                    if (typeof res != 'object') {
                        res = $.parseJSON(res);
                       
                    }
                    if (res.status == 'SUCCESS') {
                        try {
                            //console.log(res.resultObject)
                            if ($.type(res.resultObject) === 'string' && res.resultObject.length) {

                               // res.resultObject = $.parseJSON(res.resultObject);
                            }
                            if (unpack) {
                                json.done = (json.done == undefined) ? json.suc : json.done;
                                json.done(res);
                            } else {
                                json.done = (json.done == undefined) ? json.suc : json.done;
                                json.done(res);
                            }
                        } catch (e) {
                            console.log(e.name + ": " + e.message);
                        }

                    } else {
                        
                    }
                } catch (e) {
                    json.err && json.err();
                    hint(e.name + ": " + e.message);
                }
            },
            error: function (e, errormsg, msg) {

                console.log(errormsg)
                if (isLoading === true) {
                    loadingAction.remove();
                }
                json.err && json.err();
                var errorJson = {
                        'error': '网络错误！',
                        'timeout': '连接超时'
                    },
                    errorMsg = errorJson[errormsg] || '未知错误';
                hint(errorMsg);
            }
        })
    }
    exports.ajax = ajax;

    exports.listAjax = function(opts){
        var options = {
                listType: 1
            },
            param = {
                size: 10,
                page: 0
            },
            isLoad = false;
        $.extend(options, opts);
        $.extend(options.param, param);

        var targetPage = options.param.page || 0,
            total;

        _fnLoad();
        function _fnLoad(page){ 
            
            var page = page || 0;       
            console.log(page);
            console.log(options.param.page)
            _ajax().then(function(res){
                if(res.status == 'SUCCESS'){
                    total = Math.ceil(res.total / options.param.size) - 1;   
                    jQuery.Deferred().done(function() {
                        options.callback(res, page);
                    }, function() {
                        console.log(page)
                        var html;
                        if(page < total){
                            console.log('正在加载page')
                            isLoad = true;
                            html = '<div class="weui-loadmore js_loadmore">'+
                                        '<i class="weui-loading"></i>'+
                                        '<span class="weui-loadmore__tips">正在加载</span>'+
                                    '</div>'
                        }else{
                            html = '<div class="weui-loadmore weui-loadmore_line">' +
                                        '<span class="weui-loadmore__tips">暂无数据</span>' +
                                    '</div>'
                        }
                        $('.js-wrapper').append(html);   
                    }).resolve();
                }
                
            });
        }

            //是否最低端，或者加载更多显示
            //判断是tab类型，还是window类型
            //
        if(options.listType == 1){
            var $obj = $('.js-panel');
        }else if(options.listType == 2){
            var $obj = $(window);
        }
        
      
        $obj.on('scroll', function(){
            var scrollTop = $obj.scrollTop();
            var scrollHeight = $('.js-wrapper').height();
            var windowHeight = $obj.height();
            if (scrollHeight - scrollTop - windowHeight < 50) {
                if(targetPage < total && isLoad){
                    $('.js_loadmore').remove();
                    _fnLoad(++targetPage);
                }
            }
        });
        function _ajax(){
            return new Promise(function (resolve, reject) {
                ajax({
                    url: options.url,
                    data: options.param,
                    type: 'post',
                    suc: function (res) {
                        resolve(res);  
                    }
                });
            });
            
        }
    }


    //微信授权
    exports.initWxConfig = function (wx) {
        function randomString(len) {
            len = len || 32;
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var maxPos = chars.length;
            var str = '';
            for (var i = 0; i < len; i++) {
                str += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return str;
        }
        var timestamp = Math.round(new Date().getTime() / 1000);
        var nonceStr = randomString(32),
            url = window.location.href;

       
       $.ajax({
            url: 'http://blackdragon.tunnel.qydev.com/wechat/getSignature?timestamp='+timestamp+'&nonce=' + nonceStr+'&url=' + url,
            type: 'get',
            success: function (res) {
            
                wx.config({
                    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: 'wx2039ed060d264454', // 必填，公众号的唯一标识
                    timestamp: timestamp, // 必填，生成签名的时间戳
                    nonceStr: nonceStr, // 必填，生成签名的随机串
                    signature: res,// 必填，签名，见附录1
                    jsApiList: [
                        'chooseImage',
                        'uploadImage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                wx.ready(function () {
                    /*wx.error(function (res) {
                        alert(res.errMsg);
                    });*/
                }); 
                
            }
        })             
    }
});
