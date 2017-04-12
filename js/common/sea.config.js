if (typeof seajs !== 'undefined') {
    (function seajsSetConfig() {
        var newRootPATH = "/";
        var ctxPathjs = "../js/assets/";
        // Seajs配置信息
        var config = {
            base: '/',
            paths: {
                'assets': 'js/assets/',
                'module': 'js/module',
                'plugin': 'js/plugin'
            },
            alias: {
                'com': 'js/common/common.js',
                'doT': 'js/assets/doT.min.js',
                'formCheck': 'js/module/formCheck.js',
                'dialog': 'js/module/dialog.js',
                'comment': 'js/module/comment.js',
                'localDB': 'js/module/localDB.js',
            }
        };
        // no jQuery on the window
        if (typeof $ === 'undefined') {
            config.preload = ['jquery'];
        }
        seajs.config(config);
    })();
}
