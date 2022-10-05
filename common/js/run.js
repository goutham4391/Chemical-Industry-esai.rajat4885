(function (win, ResizeUtility, pluginInitialize) {
    'use strict';

    var $win = $(win);
    var resizeUtil = new ResizeUtility($win, [
        {md: '(max-width: 768px)'},
        {lg: '(min-width: 769px)'}
    ]);

    var resizeUtil2 = new ResizeUtility($win, [
        {md2: '(max-width: 1100px)'},
        {lg2: '(min-width: 1101px)'}
    ]);

    pluginInitialize($win, resizeUtil);
    pluginInitialize($win, resizeUtil2);

    // UA判定
    $(function () {
        var ua = window.navigator.userAgent;

        if (/iPhone|iPad|iPod/.test(ua)) {
            $('html').addClass('js-touch');
        }
    });

    $(function () {
        // ヘッダ インクルード
        (function () {
            if (!$('#js-inc-header').length) {
                return;
            }

            $.ajax({
                url:'/common/include/js_header.html',
                async: false,
                success: function(data){
                    $('#js-inc-header').html(data);
                }
            });
        }());

        // フッタ インクルード
        (function () {
            if (!$('#js-inc-footer').length) {
                return;
            }

            $.ajax({
                url:'/common/include/js_footer.html',
                async: false,
                success: function(data){
                    $('#js-inc-footer').html(data);
                }
            });
        }());

        // ヘッダ メニュー
        $('.js-megadrop').setMegaDrop();

        // ヘッダ 検索
        $('#js-search-hook').setHeaderSearch();

        // ページトップへ戻る 追従
        $('#to-top').setToTopFixed();

        // トグル
        $('.js-tgl').setToggle();
        $('.js-tgl-sp').setToggleSp();
        $('.js-hamburger-tgl').setToggleHamburger();

        // 同意画面
        $('body').setAuthenticatedDir();

        // モーダル表示
        $('.js-consent-modal').setConsentModal();

        // カレント表示
        $('.list-g-nav').setGlobalCurrent();
        $('.side-nav').setLocalCurrent();

        // 高さ揃え
        $('.js-adjust-h .js-set-h').matchHeight();
        $('.js-adjust-h .js-set-h-01').matchHeight();
        $('.js-adjust-h .js-set-h-02').matchHeight();

        // タブ機能
        $('.js-tab').tabs();

        // ウィンドウを閉じる
        $('.js-win-close').on('click', function () {
            window.close();
        });

        // アイコン表示
        $(function () {
            var linkDomain = location.href.match(/^http?(s)?(:\/\/[\w-.:]+)/i)[0];
            var definitionDomain = 'www.eisai.com';

            // altテキスト
            var blankText = '(New Window)'; // 別ウィンドウで開きます
            var pdfText = '(PDF)'; // PDFファイルを開く
            var zipText = '(ZIP)'; // ZIPファイルを開く

            // ブランクアイコン表示
            $('a[href^=http]').not('[href*="' + linkDomain + '"], [href*="' + definitionDomain + '"], a.no-icon[href^=http]').attr('target', '_blank').append('<span class="icon-blank"><img src="/common/images/icon_blank.png" alt="' + blankText + '">');

            // pdfアイコン表示
            // ハッシュがある場合でもアイコンを付与
            if ($('a[href$=pdf]') || $('a[href*=".pdf#"]')) {
                $('a[href$=pdf]').not('a.no-icon[href$=pdf]').attr('target', '_blank').append('<span class="icon-pdf"><img src="/common/images/icon_pdf.png" alt="' + pdfText + '"></span>');

                $('a[href*=".pdf#"]').not('a.no-icon[href$=pdf]').attr('target', '_blank').append('<span class="icon-pdf"><img src="/common/images/icon_pdf.png" alt="' + pdfText + '"></span>');
            }

            // zipアイコン表示
            $('a[href$=zip]').attr('target', '_blank').append('<span class="icon-zip"><img src="/common/images/icon_zip.png" alt="' + zipText + '"></span>');
        });

        // ファイルサイズ表示
        $(function () {
            $('a.link-size').each(function () {
                var showSize = null;
                var $target = $(this);
                var href = $target.attr('href');
                var req = $.ajax({
                    type: 'HEAD',
                    url: href,
                    success: function () {
                        var size = req.getResponseHeader('Content-Length');

                        if (size >= 1073741824) {
                            showSize = Math.round(size / 1073741824) + 'GB';
                        } else if (size >= 1048576) {
                            showSize = Math.round(size / 1048576) + 'MB';
                        } else if (size >= 1024) {
                            showSize = Math.round(size / 1024) + 'KB';
                        } else if (size < 1024) {
                            showSize = Math.round(size) + 'B';
                        }
                        if (showSize !== null) {
                            $target.append('<span class="file-size">（' + showSize + '）</span>');
                        }
                    }
                });
            });
        });

        resizeUtil.init();
        resizeUtil2.init();

        // 他言語遷移先設定
        $(function () {
            var $dir = $('body').find('.js-dir');

            if ($dir.length > 0) {
                var path = $(location).attr('pathname');
                var langPath = 'https://www.eisai.co.jp';

                $dir.attr('href', langPath + path);
            }
        });
    });
}(
    window,
    /*
     * [description]
     * @param  {[type]} $win [description]
     * @return {[type]}      [description]
     */
    function ($win, breakPoints) {
        'use strict';

        var self = this;

        // 関数を貯め込む用の空配列
        this.functions = [];

        // 関数を登録する処理、配列にプッシュするだけ
        this.regist = function (registerFunction) {
            this.functions.push(registerFunction);
        };

        // 初期化時の処理
        this.init = function () {
            var resizeTimerId = false;
            var i = -1;
            var l = self.functions.length;

            // ロード時に初回実行
            // 配列を順に実行（apply）
            for (i = 0; i < l; i++) {
                self.functions[i].apply();
            }

            // $winに対してresizeイベントをハンドリングしておく
            // これでこの中身がリサイズ時に自動的に走ってくれる
            $win.on({
                'resize.globally': function (event) {
                    // 間引きの処理
                    if (resizeTimerId !== false) {
                        clearTimeout(resizeTimerId);
                    }

                    resizeTimerId = setTimeout(function () {
                        // 初回実行と同じやり方
                        // こっちは`resize`イベントなので`event`オブジェクトを返す
                        for (i = 0; i < l; i++) {
                            self.functions[i].apply(null, [event]);
                        }
                    }, 300);
                }
            });
        };

        self.breakStat = {
            current: 'none'
        };

        this.setBreakPoint = function () {
            var overLoc = true;

            breakPoints.forEach(function (elm) {
                var keyName = Object.keys(elm)[0];

                self.breakStat[keyName] = matchMedia(elm[keyName]).matches;

                if (overLoc && self.breakStat[keyName]) {
                    overLoc = false;

                    self.breakStat.current = keyName;
                }
            });
            if (overLoc) {
                self.breakStat.current = 'over';
            }
        };

        this.setBreakPoint();

        this.regist(function () {
            self.setBreakPoint();
        });
    },
    /*
     * [description]
     * @param  {[type]} $win [description]
     * @return {[type]}      [description]
     */
    function ($win, resizeUtil2) {
        'use strict';

        var breakStat = resizeUtil2.breakStat;

        // ヘッダ メニュー
        $.fn.setMegaDrop = function (option) {
            var config;
            var $wrap;
            var $hook;
            var $detail;
            var $btnClose;

            if (!this) {
                return false;
            }

            config = $.extend({
                effect: {
                    speed: 100
                },
                a11yName: {
                    open: 'Open', // 開く
                    close: 'Close' // 閉じる
                },
                className: {
                    wrap: 'js-megadrop',
                    hook: 'js-megadrop-hook',
                    hook2: 'js-megadrop-hook2',
                    detail: 'js-megadrop-detail',
                    btnClose: 'js-megadrop-close',
                    active: 'is-active',
                    status: 'status'
                }
            }, option);

            resizeUtil2.regist(function () {
                if (breakStat.current === 'md2') {
                    $('.' + config.className.hook).attr('data-megadrop-expanded', 'false');
                } else {
                    $('.' + config.className.detail).hide();
                    $('.' + config.className.wrap).removeClass(config.className.active);
                    $('.' + config.className.hook).find('.' + config.className.status).text(config.a11yName.open);
                }
            });

            return this.each(function () {
                $wrap = $(this);
                $hook = $wrap.find('.' + config.className.hook);
                $detail = $wrap.find('.' + config.className.detail);
                $hook.append('<span class="' + config.className.status + '">' + config.a11yName.open + '</span>');
                $btnClose = $detail.find('.' + config.className.btnClose);

                // ヘッダ メガドロップ SP
                $hook.on('click', function (event) {
                    var $target = $(this);
                    var $targetStatus = $target.find('.' + config.className.status);
                    var $targetWrap = $target.parents('.' + config.className.wrap);
                    var $targetDetail = $targetWrap.find('.' + config.className.detail);

                    if (breakStat.current === 'lg2') {
                        return;
                    }

                    if ($targetDetail.hasClass('is-close-g-nav-3') | $targetDetail.hasClass('is-open-g-nav-3')) {
                        $targetDetail.removeClass('is-close-g-nav-3');
                        $targetDetail.removeClass('is-open-g-nav-3');
                    }
                    $targetDetail.toggleClass('is-open-g-nav-3');


                    // 第三階層の戻るボタン押したとき

                    var $backBtn3 = $('a.js-back-sp-3');

                    $backBtn3.on('click', function(event) {
                        event.preventDefault();

                        if ($targetDetail.hasClass('is-close-g-nav-3') | $targetDetail.hasClass('is-open-g-nav-3')) {
                            $targetDetail.removeClass('is-close-g-nav-3');
                            $targetDetail.removeClass('is-open-g-nav-3');
                        }

                        $targetDetail.toggleClass('is-close-g-nav-3');
                    });

                     // 第三階層のカレント表示

                    var $globalNav = $('ul.megadrop-list');
                    var targetPathname = location.pathname.replace(/index\.html/, '');
                    var targetUrl = (targetPathname + location.hash);
                    var targetArray = targetUrl.split('/',3);
                    var targetHierarchy = targetArray.join('/');
                    var $targetGlobalNav = $globalNav.find('a[href="' + targetHierarchy + '/index.html"]');

                    $targetGlobalNav.addClass('is-current-g-nav-3');

                    // 第三階層をクリックした時に第四階層を表示

                    $('a[class*=js-megadrop-parent]').each(function() {
                        var $parent = $(this);
                        var childNum = $parent.attr('class').split('js-megadrop-parent')[1].substring(0, 2);
                        var $child = $('div.js-megadrop-child'+childNum);

                        $parent.on('click', function (event) {
                            $child.addClass('is-open-g-nav-4');

                             // 第四階層のカレント表示

                            var $globalNav2 = $child.find('ul.megadrop-list2');
                            var $globalNav2Link = $globalNav2.find('a')
                            
                            $globalNav2Link.each(function(index,element) {
                                var $globalNav2LinkHref = $(element).attr('href');

                                if (location.href.indexOf($globalNav2LinkHref) >= 0) {
                                    $(element).addClass('is-current-g-nav-4');
                                }
                            });
                        event.preventDefault();

                            // parentをクリックした時にchildが'is-close-g-nav-4'を持ってたら消す'

                            if ($child.hasClass('is-close-g-nav-4')) {
                                $child.removeClass('is-close-g-nav-4');
                            }

                            // 第4階層の戻るボタン押したとき

                            var $backBtn4 = $('a.js-back-sp-4');

                            $backBtn4.on('click', function(event) {
                                event.preventDefault();

                                if ($child.hasClass('is-close-g-nav-4') | $child.hasClass('is-open-g-nav-4')) {
                                    $child.removeClass('is-close-g-nav-4');
                                    $child.removeClass('is-open-g-nav-4');
                                }

                                $child.toggleClass('is-close-g-nav-4');
                            });
                        });
                    });
                    event.preventDefault();
                });

                 // ホバーして50ミリ秒立たなければメガドロップダウンが作動しないように調整

                function menuShowDelay (element, delayTime) {
                    var sethover;
                    var setleave;
                    var setnexthover;
                    var targetOn;
                    var targetOff;
                    var nowActive = -1;
                    var hoverClass = 'is-active';
                    var menuElement = element;
                    var hoverTime = delayTime;
                    menuElement.on({
                        'mouseenter': function(){
                            targetOn = $(this);
                            targetOn.find('div.js-megadrop-detail').removeAttr('style');
                            
                            if(nowActive === -1){
                                sethover = setTimeout(function(){
                                targetOn.find('div.js-megadrop-detail').addClass('is-block');
                                targetOn.addClass(hoverClass);
                                targetOn.find('div.js-megadrop-detail').css('display', 'block');
                                nowActive = menuElement.index(targetOn);
                                targetOn.find('span.status').text(config.a11yName.close);
                                }, hoverTime);
                            } else {
                            if(targetOn.hasClass(hoverClass)){
                                targetOn.removeClass(hoverClass);
                                clearTimeout(setleave);
                            } else {
                                setnexthover = setTimeout( function(){
                                targetOn.find('div.js-megadrop-detail').addClass('is-block');
                                menuElement.removeClass(hoverClass);
                                targetOn.addClass(hoverClass);
                                targetOn.find('div.js-megadrop-detail').css('display', 'block');
                                nowActive = menuElement.index(targetOn);
                                }, hoverTime);
                            }
                        }
                    },
                        'mouseleave': function(){
                            targetOff = $(this);
                            targetOff.find('div.js-megadrop-detail').removeAttr('style');
                            clearTimeout(sethover);
                            function mouseIsOverWorkaround(what){
                                var temp = $(what).parent().find(":hover");
                                return temp.length == 1 && temp[0] == what;
                            }
                            var parent= targetOff;
                            if(mouseIsOverWorkaround(parent[0])){
                                if(targetOff.hasClass(hoverClass)){
                                    clearTimeout(setnexthover);
                                }
                            } else {
                                setleave = setTimeout(function(){
                                    targetOff.find('div.js-megadrop-detail').removeClass('is-block');
                                    targetOff.removeClass(hoverClass);
                                    targetOff.find('span.status').text(config.a11yName.open);
                                    nowActive = -1;
                            }, hoverTime);
                            }
                        }
                    });
                }
                $(function(){
                    menuShowDelay($('ul.list-g-nav > li'), 50);
                });

                // ヘッダ メガドロップ
                $hook.on('mouseenter.fncMegaDropOpen', function () {
                    var $target = $(this);
                    var $targetWrap = $target.parents('.' + config.className.wrap);
                    var $targetDetail = $targetWrap.find('.' + config.className.detail);
                    var $targetStatus = $target.find('.' + config.className.status);

                    if (breakStat.current === 'md2') {
                        return;
                    }
                

                    // 第二階層を開いたとき、閉じるボタンにis-noneクラスがあれば消す

                    var $btnClose2 =$('button.js-megadrop-close-2');

                            if ($btnClose2.hasClass('is-none')) {
                                $btnClose2.removeClass('is-none')
                            }

                    // 第3階層のリストをホバーしたときの、それに伴う第4階層のメニューを表示

                    $('a[class*=js-megadrop-parent]').each(function() {
                        var $parent = $(this);
                        var childNum = $parent.attr('class').split('js-megadrop-parent')[1];
                        var $child = $('div.js-megadrop-child'+childNum);

                        var setTimeoutTime;
                        $parent.on({
                            'mouseenter': function() {
                                setTimeoutTime = setTimeout( function () {
                                    $child.fadeIn(100);
                                } ,300)

                                // 第四階層開いたときに、is-noneがあればとる、なければ最初につける

                                if ($btnClose2.hasClass('is-none')) {
                                    $btnClose2.removeClass('is-none')
                                }

                                $btnClose2.addClass('is-none');

                                if ($parent.hasClass('no-have-g-nav-4')) {
                                    $btnClose2.removeClass('is-none')
                                }

                                // 第四階層のカレント表示

                                var $globalNav2 = $child.find('ul.megadrop-list2');
                                var $globalNav2Link = $globalNav2.find('a')
                                
                                $globalNav2Link.each(function(index,element) {
                                    var $globalNav2LinkHref = $(element).attr('href');

                                    if (location.href.indexOf($globalNav2LinkHref) >= 0) {
                                        $(element).addClass('is-current-g-nav-4');
                                    }
                                });
                            },
                            'mouseleave': function() {
                                clearTimeout(setTimeoutTime);
                                $child.fadeOut(0);
                            }
                        });
                            
                        $child.on('mouseenter.fncMegaDropOpen2', function () {
                            $child.css('display', 'block');
                        });

                        $child.on('mouseleave.fncMegaDropOpen2', function () {
                                $child.css('display', 'none');
                            
                        });
                    })

                    // 第三階層のカレント表示

                    var $globalNav = $('ul.megadrop-list');
                    var targetPathname = location.pathname.replace(/index\.html/, '');
                    var targetUrl = (targetPathname + location.hash);
                    var targetArray = targetUrl.split('/',3);
                    var targetHierarchy = targetArray.join('/');
                    var $targetGlobalNav = $globalNav.find('a[href="' + targetHierarchy + '/index.html"]');

                    $targetGlobalNav.addClass('is-current-g-nav-3');
                });

                $btnClose.on('click.fncMegaDropClose', function () {
                    var $target = $(this);
                    var $targetDetail = $target.parents('.' + config.className.detail);
                    var $targetWrap = $targetDetail.parents('.' + config.className.wrap);

                    $targetWrap.removeClass(config.className.active);
                    $targetDetail.fadeOut(config.effect.speed);
                    $targetDetail.removeClass('is-block');
                });

                // ヘッダ メガドロップ touch
                $hook.on('touchend', function (event) {
                    var $target = $(this);
                    var targetExpanded = $target.attr('data-megadrop-expanded');
                    var $targetWrap = $target.parents('.' + config.className.wrap);
                    var $targetDetail = $targetWrap.find('.' + config.className.detail);

                    $wrap = $('.' + config.className.wrap);
                    $hook = $wrap.find('.' + config.className.hook);
                    $detail = $wrap.find('.' + config.className.detail);
                    $btnClose = $detail.find('.' + config.className.btnClose);
                    if (breakStat.current === 'md2') {
                        return;
                    }

                    $wrap.removeClass(config.className.active);
                    $hook.attr('data-megadrop-expanded', 'false');
                    $detail.stop().fadeOut(config.effect.speed);

                    if (targetExpanded === 'false') {
                        $targetWrap.addClass(config.className.active);
                        $targetDetail.stop().fadeIn(config.effect.speed);
                        $target.attr('data-megadrop-expanded', 'true');
                        event.preventDefault();
                    }
                    $target.off('mouseenter.fncMegaDropOpen');
                });

                $btnClose.on('touchend', function () {
                    var $target = $(this);
                    var $targetDetail = $target.parents('.' + config.className.detail);
                    var $targetWrap = $targetDetail.parents('.' + config.className.wrap);
                    var $targetHook = $targetWrap.find('.' + config.className.hook);

                    if (breakStat.current === 'md2') {
                        return;
                    }

                    $targetHook.attr('data-megadrop-expanded', 'false');
                    $targetWrap.removeClass(config.className.active);
                    $targetDetail.fadeOut(config.effect.speed);
                    $target.off('clock.fncMegaDropClose');
                });
            });
        };

        // ヘッダ 検索
        $.fn.setHeaderSearch = function (option) {
            var config;
            var $hook;
            var $detail;
            var $hookStatus;

            if (!this) {
                return;
            }

            config = $.extend({
                effect: {
                    speed: 300
                },
                a11yName: {
                    open: 'Open', // 開く
                    close: 'Close' // 閉じる
                },
                idName: {
                    hook: 'js-search-hook'
                },
                className: {
                    detail: 'js-search-detail',
                    status: 'status',
                    active: 'is-active'
                }
            }, option);

            $hook = $(this);
            $detail = $('.' + config.className.detail);
            $hook.append('<span class="' + config.className.status + '">' + config.a11yName.open + '</span>');
            $hookStatus = $hook.find('.' + config.className.status);

            resizeUtil2.regist(function () {
                if (breakStat.current === 'md2') {
                    $detail.show();
                } else {
                    $detail.hide();
                    $hook.removeClass(config.className.active);
                    $hookStatus.text(config.a11yName.open);
                }
            });

            $hook.on('click', function (event) {
                var $target = $(this);
                var $targetStatus = $target.find('.' + config.className.status);

                if ($target.hasClass(config.className.active)) {
                    $targetStatus.text(config.a11yName.open);
                    $target.removeClass(config.className.active);
                    $detail.stop().slideUp(config.effect.speed).removeClass(config.className.active);
                } else {
                    $targetStatus.text(config.a11yName.close);
                    $target.addClass(config.className.active);
                    $detail.stop().slideDown(config.effect.speed).addClass(config.className.active);
                }
                event.preventDefault();
            });
        };

        // ページトップへ戻る 追従
        $.fn.setToTopFixed = function (option) {
            var config;
            var $footer;
            var $target;

            if (!this) {
                return;
            }

            config = $.extend({
                className: {
                    footer: 'site-footer',
                    fixed: 'fixed'
                }
            }, option);

            $footer = $('.' + config.className.footer);
            $target = $(this);

            function fixed() {
                var footerTop = $footer.offset().top;
                var scroll = $win.scrollTop();

                if (scroll > 0) {
                    $target.addClass(config.className.fixed);
                }

                if (scroll <= 0) {
                    $target.removeClass(config.className.fixed);
                }

                if (breakStat.current === 'md2') {
                    if (scroll >= footerTop - ($win.height() - 30)) {
                        $target.removeClass(config.className.fixed);
                    }
                    if ($('body').hasClass('no-nav')) {
                        if (scroll >= footerTop - ($win.height() + 50)) {
                            $target.removeClass(config.className.fixed);
                        }
                    }
                }
                if (breakStat.current === 'lg2') {
                    if (scroll >= footerTop - ($win.height())) {
                        $target.removeClass(config.className.fixed);
                    }
                }
            }

            $(function () {
                fixed();
            });

            $win.on('scroll resize', function () {
                fixed();
            });
        };

        // トグルハンバーガーメニュー
        $.fn.setToggleHamburger = function (option) {
            var config;
            var $wrap;
            var $hook;
            var $hookButton;
            var $detail;
            var $hookStatus;
            var $btnClose;
        
            if (!this) {
                return false;
            }
        
            config = $.extend({
                a11yName: {
                    open: 'Open', // 開く
                    close: 'Close' // 閉じる
                },
                className: {
                    wrap: 'js-hamburger-tgl',
                    hook: 'js-hamburger-tgl-hook',
                    button: 'js-hamburger-tgl-btn',
                    detail: 'js-hamburger-tgl-detail',
                    active: 'is-hamburger-active',
                    status: 'hamburger-status',
                    btnClose: 'js-hamburger-tgl-close',
                    hookText: 'hamburger-tgl-hook-text'
                }
            }, option);
        
            return this.each(function (i) {
                $wrap = $(this);
                $hook = $wrap.find('.' + config.className.hook);
                $hook.wrapInner('<a href="#" class="' + config.className.button + '"></a>');
                $hookButton = $hook.find('.' + config.className.button);
                $detail = $wrap.find('.' + config.className.detail);
                $btnClose = $detail.find('.' + config.className.btnClose);
                $hookButton.append('<span class="' + config.className.status + '">' + config.a11yName.open + '</span>');
                $hookStatus = $hookButton.find('.' + config.className.status);
                $hookButton.attr('href', '#tgl-' + (i + 1));
                $detail.attr('id', 'tgl-' + (i + 1));
        
                if ($wrap.hasClass(config.className.active)) {
                    $hookButton.addClass(config.className.active);
                    $hookStatus.text(config.a11yName.close);
                    $detail.show();
                }
        
                $hookButton.on('click', function (event) {
                    var $target = $(this);
                    var $targetStatus = $target.find('.' + config.className.status);
                    var $targetToggle = $target.parents('.' + config.className.wrap);
                    var $targetDetail = $targetToggle.find('.' + config.className.detail);
                    var $targetText = $target.find('.' + config.className.hookText);
        
                    if ($target.hasClass(config.className.active)) {
                        $target.removeClass(config.className.active);
                        $targetStatus.text(config.a11yName.open);
                        $targetDetail.stop().slideUp();
                        $targetText.text('過去の記事を見る');
                    } else {
                        $target.addClass(config.className.active);
                        $targetStatus.empty();
                        $targetDetail.stop().slideDown();
                        $targetText.text('閉じる');
                    }
                    if ($('body').hasClass('is-fixed')) {
                        $('body').removeClass('is-fixed')
                    } else {
                        $('body').addClass('is-fixed');
                    }
        
                    // 現在地を取得し現在地のメニューを前面に表示
                    var $targetHref = location.pathname; 
                    var $megadropDetail = $('ul.list-g-nav').find('div.js-megadrop-detail');
                    var $megadropDetaillinks = $megadropDetail.find('a');
        
                    $megadropDetaillinks.each(function(index,element) {
                        if (breakStat.current === 'lg2') {
                            return;
                        }
                        var $megadropDetaillinksHref = $(element).attr('href');
                        if ($targetHref === $megadropDetaillinksHref) {
                            $(element).parents('div.js-megadrop-detail').addClass('is-open-g-nav-3');
                            $(element).parents('div.megadrop-wrap2').addClass('is-open-g-nav-4');
                        }

                        // アドレスバーのURLに'inquiry'が含まれていたら下層を表示させるクラスを付けない

                        if ($targetHref.indexOf('inquiry') >= 0)  {
                            $(element).parents('div.megadrop-wrap2').removeClass('is-open-g-nav-4');
                            $megadropDetail.removeClass('is-open-g-nav-4')
                            $megadropDetail.removeClass('is-open-g-nav-3')
                        }

                        // アドレスバーのURLに'news'が含まれていたら下層を表示させるクラスを付けない

                        if ($targetHref.indexOf('news') >= 0) {
                            $(element).parents('div.megadrop-wrap2').removeClass('is-open-g-nav-4');
                            $megadropDetail.removeClass('is-open-g-nav-4')
                            $megadropDetail.removeClass('is-open-g-nav-3')
                        }
        
                        // 第三階層の戻るボタン押したとき
        
                    var $backBtn3 = $('a.js-back-sp-3');
        
                    $backBtn3.on('click', function(event) {
                        event.preventDefault();
        
                        if ($megadropDetail.hasClass('is-close-g-nav-3') | $megadropDetail.hasClass('is-open-g-nav-3')) {
                            $megadropDetail.removeClass('is-close-g-nav-3');
                            $megadropDetail.removeClass('is-open-g-nav-3');
                        }
        
                        $megadropDetail.toggleClass('is-close-g-nav-3');
                    });
                    })
        
                     // 第三階層のカレント表示
        
                    var $globalNav = $('ul.megadrop-list');
                    var targetPathname = location.pathname.replace(/index\.html/, '');
                    var targetUrl = (targetPathname + location.hash);
                    var targetArray = targetUrl.split('/',3);
                    var targetHierarchy = targetArray.join('/');
                    var $targetGlobalNav = $globalNav.find('a[href="' + targetHierarchy + '/index.html"]');
        
                    $targetGlobalNav.addClass('is-current-g-nav-3');
        
                     // ハンバーガーメニューを押したときに現在地が第四階層なら第四階層を表示
        
                    $('a[class*=js-megadrop-parent]').each(function() {
                        var $parent = $(this);
                        var childNum = $parent.attr('class').split('js-megadrop-parent')[1].substring(0, 2);
                        var $child = $('div.js-megadrop-child'+childNum);
        
                        $parent.on('click', function (event) {
                            event.preventDefault();
                            $child.addClass('is-open-g-nav-4');
                        });
        
                            $megadropDetaillinks.each(function(index,element) {
                                var $megadropDetaillinksHref = $(element).attr('href');
                                if ($targetHref === $megadropDetaillinksHref) {
                                    $(element).parents('div.js-megadrop-detail').addClass('is-open-g-nav-4');
                                }
                            });
                            $globalNav.find('a').attr('tabindex', '-1');
        
                             // 第四階層のカレント表示
        
                            var $globalNav2 = $child.find('ul.megadrop-list2');
                            var $globalNav2Link = $globalNav2.find('a')
                            
                            $globalNav2Link.each(function(index,element) {
                                var $globalNav2LinkHref = $(element).attr('href');
        
                                if (location.href.indexOf($globalNav2LinkHref) >= 0) {
                                    $(element).addClass('is-current-g-nav-4');
                                }
                            });
                        event.preventDefault();
        
                            // parentをクリックした時にchildが'is-close-g-nav-4'を持ってたら消す'
        
                            if ($child.hasClass('is-close-g-nav-4')) {
                                $child.removeClass('is-close-g-nav-4');
                            }
        
                            // 第4階層の戻るボタン押したとき
        
                            var $backBtn4 = $('a.js-back-sp-4');
        
                            $backBtn4.on('click', function(event) {
                                event.preventDefault();
        
                                if ($child.hasClass('is-close-g-nav-4') | $child.hasClass('is-open-g-nav-4')) {
                                    $child.removeClass('is-close-g-nav-4');
                                    $child.removeClass('is-open-g-nav-4');
                                }
                            });
                    });
                    event.preventDefault();
                });
        
                $btnClose.on('click', function () {
                    var $target = $(this);
                    var $targetDetail = $target.parents('.' + config.className.detail);
                    var $targetWrap = $targetDetail.parents('.' + config.className.wrap);
                    var $targetHook = $targetWrap.find('.' + config.className.button);
                    var $targetStatus = $targetHook.find('.' + config.className.status);
        
                    $targetDetail.slideUp();
                    $targetHook.removeClass(config.className.active);
                    $targetStatus.text(config.a11yName.open);
                    $targetHook.focus();

                    if ($('body').hasClass('is-fixed')) {
                        $('body').removeClass('is-fixed')
                    } else {
                        $('body').addClass('is-fixed');
                    }
                });
            });
        };

         // トグル
        $.fn.setToggle = function (option) {
            var config;
            var $wrap;
            var $hook;
            var $hookButton;
            var $detail;
            var $hookStatus;
            var $btnClose;

            if (!this) {
                return false;
            }

            config = $.extend({
                a11yName: {
                    open: 'Open', // 開く
                    close: 'Close' // 閉じる
                },
                className: {
                    wrap: 'js-tgl',
                    hook: 'js-tgl-hook',
                    button: 'js-tgl-btn',
                    detail: 'js-tgl-detail',
                    active: 'is-active',
                    status: 'status',
                    btnClose: 'js-tgl-close',
                    hookText: 'tgl-hook-text'
                }
            }, option);

            return this.each(function (i) {
                $wrap = $(this);
                $hook = $wrap.find('.' + config.className.hook);
                $hook.wrapInner('<a href="#" class="' + config.className.button + '"></a>');
                $hookButton = $hook.find('.' + config.className.button);
                $detail = $wrap.find('.' + config.className.detail);
                $btnClose = $detail.find('.' + config.className.btnClose);
                $hookButton.append('<span class="' + config.className.status + '">' + config.a11yName.open + '</span>');
                $hookStatus = $hookButton.find('.' + config.className.status);
                $hookButton.attr('href', '#tgl-' + (i + 1));
                $detail.attr('id', 'tgl-' + (i + 1));

                if ($wrap.hasClass(config.className.active)) {
                    $hookButton.addClass(config.className.active);
                    $hookStatus.text(config.a11yName.close);
                    $detail.show();
                }

                $hookButton.on('click', function (event) {
                    var $target = $(this);
                    var $targetStatus = $target.find('.' + config.className.status);
                    var $targetToggle = $target.parents('.' + config.className.wrap);
                    var $targetDetail = $targetToggle.find('.' + config.className.detail);
                    var $targetText = $target.find('.' + config.className.hookText);

                    if ($target.hasClass(config.className.active)) {
                        $target.removeClass(config.className.active);
                        $targetStatus.text(config.a11yName.open);
                        $targetDetail.stop().slideUp();
                        $targetText.text('Previous Articles');
                    } else {
                        $target.addClass(config.className.active);
                        $targetStatus.empty();
                        $targetDetail.stop().slideDown();
                        $targetText.text('Close');
                    }
                    event.preventDefault();
                });

                $btnClose.on('click', function () {
                    var $target = $(this);
                    var $targetDetail = $target.parents('.' + config.className.detail);
                    var $targetWrap = $targetDetail.parents('.' + config.className.wrap);
                    var $targetHook = $targetWrap.find('.' + config.className.button);
                    var $targetStatus = $targetHook.find('.' + config.className.status);

                    $targetDetail.slideUp();
                    $targetHook.removeClass(config.className.active);
                    $targetStatus.text(config.a11yName.open);
                    $targetHook.focus();
                });
            });
        };

        // トグルPSのみ
        $.fn.setToggleSp = function (option) {
            var config;
            var $wrap;
            var $hook;
            var $detail;
            var $hookButton;
            var $hookStatus;

            if (!this) {
                return false;
            }

            config = $.extend({
                a11yName: {
                    open: 'Open', // 開く
                    close: 'Close' // 閉じる
                },
                className: {
                    wrap: 'js-tgl-sp',
                    hook: 'js-tgl-hook',
                    button: 'js-tgl-btn',
                    detail: 'js-tgl-detail',
                    active: 'is-active',
                    status: 'status',
                    btnClose: 'js-tgl-close'
                }
            }, option);

            resizeUtil2.regist(function () {
                if (breakStat.current === 'lg2') {
                    $('.' + config.className.wrap).find('.' + config.className.hook).prop('tabIndex', -1);
                } else {
                    $('.' + config.className.wrap).find('.' + config.className.hook).prop('tabIndex', 1);
                }
            });

            return this.each(function (i) {
                $wrap = $(this);
                $detail = $wrap.find('.' + config.className.detail);
                $hook = $wrap.find('.' + config.className.hook);
                $hook.wrapInner('<a href="#" class="' + config.className.button + '"></a>');
                $hookButton = $hook.find('.' + config.className.button);
                $hookButton.append('<span class="' + config.className.status + '">' + config.a11yName.open + '</span>');
                $hookStatus = $hookButton.find('.' + config.className.status);
                $hookButton.attr('href', '#tgl-sp-' + (i + 1));
                $detail.attr('id', 'tgl-sp-' + (i + 1));

                if ($hook.hasClass(config.className.active)) {
                    $hook.next().show();
                    $hookStatus.text(config.a11yName.close);
                }

                $hookButton.on('click', function (event) {
                    var $target = $(this);
                    var $targetStatus = $target.find('.' + config.className.status);
                    var $targetToggle = $target.parents('.' + config.className.wrap);
                    var $targetDetail = $targetToggle.find('.' + config.className.detail);

                    if (breakStat.current === 'lg2') {
                        event.preventDefault();
                    } else if (breakStat.current === 'md2') {
                        if ($target.hasClass(config.className.active)) {
                            $target.removeClass(config.className.active);
                            $targetStatus.text(config.a11yName.open);
                            $targetDetail.stop().slideUp();
                        } else {
                            $target.addClass(config.className.active);
                            $targetStatus.text(config.a11yName.close);
                            $targetDetail.stop().slideDown();
                        }
                        event.preventDefault();
                    }
                });
            });
        };

        // モーダル
        $.fn.setConsentModal = function (option) {
            var config;
            var $body;
            var $wrap;
            var $modalOpen;
            var activeElem;
            var $modalWrap;
            var $overlay;
            var firstOpen;
            var n;

            if (!this) {
                return false;
            }

            config = $.extend({
                effect: {
                    speed: 300
                },
                className: {
                    wrap: 'js-consent-modal',
                    overlay: 'js-modal-overlay',
                    btnAgree: 'js-btn-agree',
                    btnDisagree: 'js-btn-disagree',
                    hidden: 'js-hidden',
                    modalOpen: 'js-modal-open',
                    modalLink: 'js-modal-link',
                    confirmLink: 'js-confirm',
                    closeConfirm: 'js-close-confirm',
                    megaDropHook: 'js-megadrop-hook',
                    modalInner: 'box-modal-inner'
                },
                dataName: {
                    confirm: 'confirm'
                }
            }, option);

            $body = $('body');
            $modalWrap = $('.' + config.className.wrap);
            $modalOpen = $('.' + config.className.modalOpen);
            firstOpen = 0;

            this.each(function (n) {
                var $wrap = $(this);
                var $btnAgree = $wrap.find('.' + config.className.btnAgree);
                var $btnDisagree = $wrap.find('.' + config.className.btnDisagree);
                var $modalLink = $wrap.find('.' + config.className.modalLink);
                var $otherA = $body.find('a', 'button');
                var $movie = $wrap.find('video');
                var $movieJstream = $wrap.find('.video-jstream');
                var $currentMovieJstream = null;
                var playerArray = window.playerArray ? window.playerArray : {};
                
                $body.append('<div class="' + config.className.overlay + '"></div>');
                $overlay = $('.' + config.className.overlay);

                if ($modalOpen.length <= 0) {
                    $otherA.attr('tabIndex', -1);
                    $btnAgree.attr('tabIndex', 0);
                    $btnDisagree.attr('tabIndex', 0);
                }

                var closeModal = function ($button) {
                    $modalWrap.fadeOut(config.effect.speed).addClass(config.className.hidden);
                    $overlay.fadeOut(config.effect.speed);
                    $otherA.attr('tabIndex', '');

                    if ($movie.length) {
                        $movie[0].pause();
                    } else if ($movieJstream.length && $currentMovieJstream) {
                        if ($currentMovieJstream) {
                            $currentMovieJstream.accessor.pause();
                        }
                    }

                    if (!$button.hasClass(config.className.closeConfirm) && activeElem) {
                        activeElem.focus();
                    }
                };

                $btnAgree.on('click', function (event) {
                    closeModal($(this));
                    event.preventDefault();
                });

                $modalLink.on('click', function () {
                    closeModal($(this));
                });

                if ($wrap.hasClass(config.className.hidden)) {
                    $overlay.hide();

                    $modalOpen.on('click', function (event) {
                        var $_this = $(this);
                        var $currentWrap;
                        var wrapId;
                        var _wrapId;
                        var $_wrapId;
                        if (!$_this.hasClass(config.className.modalOpen)) {
                            return true;
                        }
                        $currentWrap = $wrap;

                        // Multi
                        if ($modalWrap.length > 1) {
                            wrapId = $_this.attr('href');
                            if (wrapId.match(/^#/) && $(wrapId).length) {
                                if ($(wrapId).hasClass(config.className.wrap)) {
                                    $currentWrap = $(wrapId);
                                }
                            }
                        }

                        //Confirm
                        if ($_this.hasClass(config.className.confirmLink)) {
                            // SP toggle
                            if (breakStat.current === 'md' && $_this.hasClass(config.className.megaDropHook)) {
                                return false;
                            }
                            _wrapId = $_this.data(config.dataName.confirm) || '';
                            if (_wrapId) {
                                $_wrapId = $(_wrapId);
                                if ($_wrapId.length && $_wrapId.hasClass(config.className.wrap)) {
                                    $currentWrap = $_wrapId;
                                }
                            }
                        }

                        $currentMovieJstream = playerArray[wrapId];
                        activeElem = document.activeElement;
                        $currentWrap.fadeIn(config.effect.speed).removeClass(config.className.hidden);
                        $overlay.first().fadeIn(config.effect.speed);
                        $otherA.attr('tabIndex', -1);
                        $currentWrap.find('.' + config.className.btnAgree).attr('tabIndex', 0);
                        $currentWrap.find('.' + config.className.modalLink).attr('tabIndex', 0);
                        $currentWrap.attr('tabIndex', -1).find('.' + config.className.modalInner).prop('tabIndex', 0);
                        event.preventDefault();
                  });
                } else {
                    firstOpen++;
                }
            });
            if (firstOpen && $overlay) {
                if (!$overlay.is(':visible')) {
                    $overlay.last().show();
                }
            }
            return true;
        };

        // 特定ディレクトリ認証表示
        $.fn.setAuthenticatedDir = function (option) {
            var config;
            var $body;
            var dirName;
            var definitionDomain;
            var hostName;
            var pathName;
            var cookiePath;
            var cookieDomain;
            var urlParamName;
            var cookieName;
            var cookieText;
            var cookieEnabled;
            var isConfirmed;
            var modalLoaded;
            var linkAddClass;
            var urlParam;
            var redirectFrom;
            var $confirmWindow;
            var $agreeBtn;
            var $closeBtn;
            var $a;

            if (!this) {
                return false;
            }

            if ($('#js-inc-header').length) {
                return false;
            }

            config = $.extend({
                cookieName: 'confirmed_ir',
                cookiePath: '/',
                dirName: '/ir/',
                modal: 'ir_confirm.html',
                modalLoadDir: '/common/include/modal/',
                modalWindowId: 'ir_confirm',
                dataName: 'confirm',
                urlParamName: 'redirect_ir',
                domain: 'www.eisai.com',
                redirectPath: '/index.html',
                className: {
                    modalLink: 'js-modal-link',
                    modalOpen: 'js-modal-open',
                    modalClose: 'js-close-confirm',
                    btnAgree: 'js-btn-agree',
                    btnDisagree: 'js-btn-disagree',
                    confirmLink: 'js-confirm',
                    hidden: 'js-hidden',
                    modalConfirmOpen: 'js-confirm-modal-open',
                    megadrop: 'js-megadrop',
                    megadropStatus: 'status',
                    carousel: 'top-carousel-1',
                    iconPrefix: 'icon-'
                }
            }, option);

            $body = $('body');

            dirName = config.dirName;
            definitionDomain = config.domain;
            hostName = location.hostname;
            pathName = location.pathname;

            cookiePath = config.cookiePath;
            cookieDomain = window.location.hostname;
            urlParamName = config.urlParamName;

            var getCookie = function (cookieName) {
                if (!document.cookie) {
                    return false;
                }
                var cookieExists = false;
                var cookies = document.cookie.split(';');
                var cookiesLength = cookies.length;
                var i;
                var _item;
                for (i = 0; i < cookiesLength; i++) {
                    _item = cookies[i].replace(/^ +/, '').split('=');
                    if (_item[0] === cookieName) {
                        cookieExists = true;
                    }
                }
                return cookieExists;
            };

            var setCookie = function (cookieText) {
                if (!document.cookie) {
                    return false;
                }
                document.cookie = cookieText + '; path=' + cookiePath + '; domain=' + cookieDomain;
                return true;
            };

            var getUrlParam = function () {
                var urlParam = location.search.substring(1).split('&') || '';
                var arg, i;
                var urlVals;
                var paramKey;
                if (urlParam) {
                    arg = {};
                    for (i = 0; i < urlParam.length; i++) {
                        urlVals = urlParam[i].split('=');
                        paramKey = urlVals[0];
                        arg[paramKey] = urlVals[1];
                    }
                }
                return arg;
            };

            isConfirmed = getCookie(config.cookieName);

            if (!isConfirmed) {
                urlParam = getUrlParam();
                if (urlParam && urlParam[urlParamName]) {
                    redirectFrom = urlParam[urlParamName];
                    if (redirectFrom.lastIndexOf('/') + 1 === redirectFrom.length) {
                        redirectFrom += 'index.html';
                    }
                    if (redirectFrom.indexOf('/') === 0) {
                        redirectFrom =  redirectFrom.substring(1);
                    }
                    redirectFrom = dirName + redirectFrom;
                }

                linkAddClass = [
                    config.modalWindowId,
                    config.className.confirmLink,
                    config.className.modalOpen,
                    config.className.modalConfirmOpen
                ];
                linkAddClass = linkAddClass.join(' ');

                $a = $('a');
                for(var i = 0; i < $a.length; i++) {
                    var $_a = $a.eq(i);
                    var _link = $a[i].pathname.replace(/https?:\/\//, '').replace(hostName, '').replace(definitionDomain, '');

                    if (_link.indexOf(dirName) === 0 && !$_a.hasClass('.' + config.className.modalLink)) {
                        $_a.addClass(linkAddClass).data(config.dataName, '#' + config.modalWindowId);
                    }
                }

                $.ajax({
                    url: config.modalLoadDir + config.modal,
                    async: false,
                    timeout: 30000,
                    success: function (data) {
                        $body.prepend(data);
                        modalLoaded = true;
                    },
                    error: function () {
                        modalLoaded = false;
                    }
                });

                if (!modalLoaded) {
                    return;
                }

                $confirmWindow = $('#' + config.modalWindowId);
                $agreeBtn = $confirmWindow.find('.' + config.className.modalLink);
                $closeBtn = $confirmWindow.find('.' + config.className.modalClose);

                if (redirectFrom) {
                    if (location.hash !== '') {
                        redirectFrom += location.hash;
                    }
                    $confirmWindow.removeClass(config.className.hidden).find('.' + config.className.modalLink).attr('href', redirectFrom);
                    $confirmWindow.find('.' + config.className.modalClose).removeClass(config.className.btnAgree).addClass(config.className.btnDisagree).attr('href', config.redirectPath);
                }

                $('.' + config.className.confirmLink).on('click', function (event) {
                    var $link;
                    var _link;
                    var _target;
                    var $_icon;
                    var agreeIcon;
                    var movePosition;

                    if (!isConfirmed) {
                        $link = $(this);

                        $agreeBtn.attr('href', '#').removeAttr('target').find('[class^="' + config.className.iconPrefix + '"]').remove();
                        $closeBtn.attr('href', '#').removeClass(config.className.btnDisagree).addClass(config.className.btnAgree);

                        _link = $link.attr('href');
                        _target = $link.attr('target') || '';
                        $_icon = $link.find('[class^="' + config.className.iconPrefix + '"]') || '';
                        $agreeBtn.attr('href', _link);

                        if (_target) {
                            $agreeBtn.attr('target', _target);
                        }
                        if ($_icon) {
                            agreeIcon = $_icon.clone();
                            $agreeBtn.append(agreeIcon);
                        }

                        movePosition = true;

                        //exclude layer
                        if ($link.closest('.' + config.className.megadrop).length) {
                            movePosition = false;
                        }
                        if ($link.closest('.' + config.className.carousel).length) {
                            movePosition = false;
                        }
                        if (movePosition) {
                            $link.after($confirmWindow);
                        }

                        event.preventDefault();
                    }
                });

                $agreeBtn.on('click', function (event) {
                    isConfirmed = setCookie(config.cookieName + '=' + dirName) || true;
                    $('a[href^="' + dirName + '"]').removeClass(linkAddClass);
                    $confirmWindow.remove();
                });
                $closeBtn.on('click', function (event) {
                    $body.prepend($confirmWindow);
                });
            }

        };

        // グロナビカレント表示
        $.fn.setGlobalCurrent = function (option) {
            var config;
            var targetPathname;
            var targetUrl;
            var targetHierarchy;
            var $globalNav;
            var $targetGlobalNav;

            if (!this) {
                return false;
            }

            config = $.extend({
                className: {
                    gNav: 'list-g-nav',
                    current: 'is-current'
                }
            }, option);


            return this.each(function () {
                $globalNav = $(this);
                targetPathname = location.pathname.replace(/index\.html/, '');
                targetUrl = (targetPathname + location.hash);
                targetHierarchy = targetUrl.split('/')[1];

                $targetGlobalNav = $globalNav.find('a[href="/' + targetHierarchy + '/index.html"]').parents('li');

                var $targetGlobalNavLinks = $targetGlobalNav.parents('li').find('div.sub-nav').find('a');

                $targetGlobalNav.addClass(config.className.current);

                $targetGlobalNavLinks.each(function(index, element) {
                    var $targetGlobalNavLinkHref = $(element).attr('href');

                    if ($targetGlobalNavLinkHref.indexOf(targetUrl) >= 0) {
                        $targetGlobalNav.removeClass(config.className.current);
                    }

                    if (targetUrl.indexOf('inquiry') >= 0) {
                        $targetGlobalNav.removeClass(config.className.current);
                    }

                    if (targetUrl.indexOf('news') >= 0) {
                        $targetGlobalNav.removeClass(config.className.current);
                    }
                })
            });
        };


        // サイドナビカレント表示
        $.fn.setLocalCurrent = function (option) {
            var config;
            var $sideNav;
            var $sideNavA;
            var $sideNavHash;
            var targetPathname;
            var targetUrl;
            var urlYear;

            if (!this) {
                return false;
            }

            config = $.extend({
                className: {
                    sideNav: 'side-nav',
                    newsNav: 'side-nav-news',
                    current: 'is-current',
                    open: 'is-open',
                    parentCurrent: 'parent-current',
                    hashAnchor: 'hash-anchor'
                }
            }, option);

            return this.each(function () {
                $sideNav = $(this);
                $sideNavA = $sideNav.find('a');
                $sideNavHash = $sideNav.find('.' + config.className.hashAnchor);
                targetPathname = location.pathname.replace(/index\.html/, '');
                targetUrl = (targetPathname + location.hash);
                urlYear = targetUrl.replace(/\D/g, '').slice(0, 4);

                // サイドナビ
                if ($sideNav.hasClass(config.className.newsNav)) {
                    $sideNavHash.on('click', function () {
                        var $target = $(this);

                        $sideNavA.removeClass(config.className.current);
                        $target.addClass(config.className.current);
                    });
                    $sideNavA.each(function () {
                        var $target = $(this);
                        var sideNavHref = $target.attr('href');
                        var sideNavYear = sideNavHref.replace(/\D/g, '').slice(0, 4);

                        if (urlYear === sideNavYear) {
                            $target.addClass(config.className.current);

                            return false;
                        } else if (sideNavHref === targetUrl) {
                            $target.addClass(config.className.current);

                            return false;
                        }

                        return true;
                    });
                } else {
                    $sideNavA.each(function () {
                        var $target = $(this);
                        var sideNavHref = $target.attr('href').replace(/index\.html/, '');
                        var targetParent = targetPathname.replace(/(\/[\w-.:]+\.html)/, '/');

                        if (sideNavHref === targetUrl) {
                            $target.addClass(config.className.current).parents('ul').addClass(config.className.open);

                            return false;
                        } if (sideNavHref === targetParent) {
                            $target.addClass(config.className.current).parents('ul').addClass(config.className.open);
                        }

                        return true;
                    });
                    $('.' + config.className.sideNav + ' ul.' + config.className.open).prev('a').addClass(config.className.parentCurrent);
                }
                // 'a.parent-current'を子要素に持つlistのみを表示

                var $sideNavList = $sideNav.children('li');
                var $sideNavListParent = $('a.parent-current').parent('li');
                var $sideNavListCurrent = $('a.is-current').parent('li');

                if (location.pathname.indexOf('news') === -1) {
                    $sideNavList.css('display', 'none');
                    $sideNavListParent.css('display', 'block');
                    $sideNavListCurrent.css('display', 'block');
                }
            });
        };
    }
));

// =============== プラグイン本体 ===============

// 高さぞろえ

/*
* jquery-match-height 0.7.2 by @liabru
* http://brm.io/jquery-match-height/
* License MIT
*/
!function(t){"use strict";"function"==typeof define&&define.amd?define(["jquery"],t):"undefined"!=typeof module&&module.exports?module.exports=t(require("jquery")):t(jQuery)}(function(t){var e=-1,o=-1,n=function(t){return parseFloat(t)||0},a=function(e){var o=1,a=t(e),i=null,r=[];return a.each(function(){var e=t(this),a=e.offset().top-n(e.css("margin-top")),s=r.length>0?r[r.length-1]:null;null===s?r.push(e):Math.floor(Math.abs(i-a))<=o?r[r.length-1]=s.add(e):r.push(e),i=a}),r},i=function(e){var o={
byRow:!0,property:"height",target:null,remove:!1};return"object"==typeof e?t.extend(o,e):("boolean"==typeof e?o.byRow=e:"remove"===e&&(o.remove=!0),o)},r=t.fn.matchHeight=function(e){var o=i(e);if(o.remove){var n=this;return this.css(o.property,""),t.each(r._groups,function(t,e){e.elements=e.elements.not(n)}),this}return this.length<=1&&!o.target?this:(r._groups.push({elements:this,options:o}),r._apply(this,o),this)};r.version="0.7.2",r._groups=[],r._throttle=80,r._maintainScroll=!1,r._beforeUpdate=null,
r._afterUpdate=null,r._rows=a,r._parse=n,r._parseOptions=i,r._apply=function(e,o){var s=i(o),h=t(e),l=[h],c=t(window).scrollTop(),p=t("html").outerHeight(!0),u=h.parents().filter(":hidden");return u.each(function(){var e=t(this);e.data("style-cache",e.attr("style"))}),u.css("display","block"),s.byRow&&!s.target&&(h.each(function(){var e=t(this),o=e.css("display");"inline-block"!==o&&"flex"!==o&&"inline-flex"!==o&&(o="block"),e.data("style-cache",e.attr("style")),e.css({display:o,"padding-top":"0",
"padding-bottom":"0","margin-top":"0","margin-bottom":"0","border-top-width":"0","border-bottom-width":"0",height:"100px",overflow:"hidden"})}),l=a(h),h.each(function(){var e=t(this);e.attr("style",e.data("style-cache")||"")})),t.each(l,function(e,o){var a=t(o),i=0;if(s.target)i=s.target.outerHeight(!1);else{if(s.byRow&&a.length<=1)return void a.css(s.property,"");a.each(function(){var e=t(this),o=e.attr("style"),n=e.css("display");"inline-block"!==n&&"flex"!==n&&"inline-flex"!==n&&(n="block");var a={
display:n};a[s.property]="",e.css(a),e.outerHeight(!1)>i&&(i=e.outerHeight(!1)),o?e.attr("style",o):e.css("display","")})}a.each(function(){var e=t(this),o=0;s.target&&e.is(s.target)||("border-box"!==e.css("box-sizing")&&(o+=n(e.css("border-top-width"))+n(e.css("border-bottom-width")),o+=n(e.css("padding-top"))+n(e.css("padding-bottom"))),e.css(s.property,i-o+"px"))})}),u.each(function(){var e=t(this);e.attr("style",e.data("style-cache")||null)}),r._maintainScroll&&t(window).scrollTop(c/p*t("html").outerHeight(!0)),
this},r._applyDataApi=function(){var e={};t("[data-match-height], [data-mh]").each(function(){var o=t(this),n=o.attr("data-mh")||o.attr("data-match-height");n in e?e[n]=e[n].add(o):e[n]=o}),t.each(e,function(){this.matchHeight(!0)})};var s=function(e){r._beforeUpdate&&r._beforeUpdate(e,r._groups),t.each(r._groups,function(){r._apply(this.elements,this.options)}),r._afterUpdate&&r._afterUpdate(e,r._groups)};r._update=function(n,a){if(a&&"resize"===a.type){var i=t(window).width();if(i===e)return;e=i;
}n?o===-1&&(o=setTimeout(function(){s(a),o=-1},r._throttle)):s(a)},t(r._applyDataApi);var h=t.fn.on?"on":"bind";t(window)[h]("load",function(t){r._update(!1,t)}),t(window)[h]("resize orientationchange",function(t){r._update(!0,t)})});

// タブ機能

/*! jQuery UI - v1.12.1 - 2017-12-12
* http://jqueryui.com
* Includes: widget.js, keycode.js, unique-id.js, widgets/tabs.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function(t){t.ui=t.ui||{},t.ui.version="1.12.1";var e=0,i=Array.prototype.slice;t.cleanData=function(e){return function(i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function(e,i,s){var n,o,a,r={},l=e.split(".")[0];e=e.split(".")[1];var h=l+"-"+e;return s||(s=i,i=t.Widget),t.isArray(s)&&(s=t.extend.apply(null,[{}].concat(s))),t.expr[":"][h.toLowerCase()]=function(e){return!!t.data(e,h)},t[l]=t[l]||{},n=t[l][e],o=t[l][e]=function(t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new o(t,e)},t.extend(o,n,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),a=new i,a.options=t.widget.extend({},a.options),t.each(s,function(e,s){return t.isFunction(s)?(r[e]=function(){function t(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(r[e]=s,void 0)}),o.prototype=t.widget.extend(a,{widgetEventPrefix:n?a.widgetEventPrefix||e:e},r,{constructor:o,namespace:l,widgetName:e,widgetFullName:h}),n?(t.each(n._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),t.widget.bridge(e,o),o},t.widget.extend=function(e){for(var s,n,o=i.call(arguments,1),a=0,r=o.length;r>a;a++)for(s in o[a])n=o[a][s],o[a].hasOwnProperty(s)&&void 0!==n&&(e[s]=t.isPlainObject(n)?t.isPlainObject(e[s])?t.widget.extend({},e[s],n):t.widget.extend({},n):n);return e},t.widget.bridge=function(e,s){var n=s.prototype.widgetFullName||e;t.fn[e]=function(o){var a="string"==typeof o,r=i.call(arguments,1),l=this;return a?this.length||"instance"!==o?this.each(function(){var i,s=t.data(this,n);return"instance"===o?(l=s,!1):s?t.isFunction(s[o])&&"_"!==o.charAt(0)?(i=s[o].apply(s,r),i!==s&&void 0!==i?(l=i&&i.jquery?l.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+o+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+o+"'")}):l=void 0:(r.length&&(o=t.widget.extend.apply(null,[o].concat(r))),this.each(function(){var e=t.data(this,n);e?(e.option(o||{}),e._init&&e._init()):t.data(this,n,new s(o,this))})),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function(i,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=e++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),this.classesElementLookup={},s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),i),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function(){return{}},_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){var e=this;this._destroy(),t.each(this.classesElementLookup,function(t,i){e._removeClass(i,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:t.noop,widget:function(){return this.element},option:function(e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function(e){var i,s,n;for(i in e)n=this.classesElementLookup[i],e[i]!==this.options.classes[i]&&n&&n.length&&(s=t(n.get()),this._removeClass(n,i),s.addClass(this._classes({element:s,keys:i,classes:e,add:!0})))},_setOptionDisabled:function(t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_classes:function(e){function i(i,o){var a,r;for(r=0;i.length>r;r++)a=n.classesElementLookup[i[r]]||t(),a=e.add?t(t.unique(a.get().concat(e.element.get()))):t(a.not(e.element).get()),n.classesElementLookup[i[r]]=a,s.push(i[r]),o&&e.classes[i[r]]&&s.push(e.classes[i[r]])}var s=[],n=this;return e=t.extend({element:this.element,classes:this.options.classes||{}},e),this._on(e.element,{remove:"_untrackClassesElement"}),e.keys&&i(e.keys.match(/\S+/g)||[],!0),e.extra&&i(e.extra.match(/\S+/g)||[]),s.join(" ")},_untrackClassesElement:function(e){var i=this;t.each(i.classesElementLookup,function(s,n){-1!==t.inArray(e.target,n)&&(i.classesElementLookup[s]=t(n.not(e.target).get()))})},_removeClass:function(t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function(t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function(t,e,i,s){s="boolean"==typeof s?s:i;var n="string"==typeof t||null===t,o={extra:n?e:i,keys:n?t:e,element:n?this.element:t,add:s};return o.element.toggleClass(this._classes(o),s),this},_on:function(e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function(s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.on(h,c,r):i.on(h,r)})},_off:function(e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.off(i).off(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){this._addClass(t(e.currentTarget),null,"ui-state-hover")},mouseleave:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){this._addClass(t(e.currentTarget),null,"ui-state-focus")},focusout:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget,t.ui.keyCode={BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38},t.fn.extend({uniqueId:function(){var t=0;return function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++t)})}}(),removeUniqueId:function(){return this.each(function(){/^ui-id-\d+$/.test(this.id)&&t(this).removeAttr("id")})}}),t.ui.escapeSelector=function(){var t=/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;return function(e){return e.replace(t,"\\$1")}}(),t.ui.safeActiveElement=function(t){var e;try{e=t.activeElement}catch(i){e=t.body}return e||(e=t.body),e.nodeName||(e=t.body),e},t.widget("ui.tabs",{version:"1.12.1",delay:300,options:{active:null,classes:{"ui-tabs":"ui-corner-all","ui-tabs-nav":"ui-corner-all","ui-tabs-panel":"ui-corner-bottom","ui-tabs-tab":"ui-corner-top"},collapsible:!1,event:"click",heightStyle:"content",hide:null,show:null,activate:null,beforeActivate:null,beforeLoad:null,load:null},_isLocal:function(){var t=/#.*$/;return function(e){var i,s;i=e.href.replace(t,""),s=location.href.replace(t,"");try{i=decodeURIComponent(i)}catch(n){}try{s=decodeURIComponent(s)}catch(n){}return e.hash.length>1&&i===s}}(),_create:function(){var e=this,i=this.options;this.running=!1,this._addClass("ui-tabs","ui-widget ui-widget-content"),this._toggleClass("ui-tabs-collapsible",null,i.collapsible),this._processTabs(),i.active=this._initialActive(),t.isArray(i.disabled)&&(i.disabled=t.unique(i.disabled.concat(t.map(this.tabs.filter(".ui-state-disabled"),function(t){return e.tabs.index(t)}))).sort()),this.active=this.options.active!==!1&&this.anchors.length?this._findActive(i.active):t(),this._refresh(),this.active.length&&this.load(i.active)},_initialActive:function(){var e=this.options.active,i=this.options.collapsible,s=location.hash.substring(1);return null===e&&(s&&this.tabs.each(function(i,n){return t(n).attr("aria-controls")===s?(e=i,!1):void 0}),null===e&&(e=this.tabs.index(this.tabs.filter(".ui-tabs-active"))),(null===e||-1===e)&&(e=this.tabs.length?0:!1)),e!==!1&&(e=this.tabs.index(this.tabs.eq(e)),-1===e&&(e=i?!1:0)),!i&&e===!1&&this.anchors.length&&(e=0),e},_getCreateEventData:function(){return{tab:this.active,panel:this.active.length?this._getPanelForTab(this.active):t()}},_tabKeydown:function(e){var i=t(t.ui.safeActiveElement(this.document[0])).closest("li"),s=this.tabs.index(i),n=!0;if(!this._handlePageNav(e)){switch(e.keyCode){case t.ui.keyCode.RIGHT:case t.ui.keyCode.DOWN:s++;break;case t.ui.keyCode.UP:case t.ui.keyCode.LEFT:n=!1,s--;break;case t.ui.keyCode.END:s=this.anchors.length-1;break;case t.ui.keyCode.HOME:s=0;break;case t.ui.keyCode.SPACE:return e.preventDefault(),clearTimeout(this.activating),this._activate(s),void 0;case t.ui.keyCode.ENTER:return e.preventDefault(),clearTimeout(this.activating),this._activate(s===this.options.active?!1:s),void 0;default:return}e.preventDefault(),clearTimeout(this.activating),s=this._focusNextTab(s,n),e.ctrlKey||e.metaKey||(i.attr("aria-selected","false"),this.tabs.eq(s).attr("aria-selected","true"),this.activating=this._delay(function(){this.option("active",s)},this.delay))}},_panelKeydown:function(e){this._handlePageNav(e)||e.ctrlKey&&e.keyCode===t.ui.keyCode.UP&&(e.preventDefault(),this.active.trigger("focus"))},_handlePageNav:function(e){return e.altKey&&e.keyCode===t.ui.keyCode.PAGE_UP?(this._activate(this._focusNextTab(this.options.active-1,!1)),!0):e.altKey&&e.keyCode===t.ui.keyCode.PAGE_DOWN?(this._activate(this._focusNextTab(this.options.active+1,!0)),!0):void 0},_findNextTab:function(e,i){function s(){return e>n&&(e=0),0>e&&(e=n),e}for(var n=this.tabs.length-1;-1!==t.inArray(s(),this.options.disabled);)e=i?e+1:e-1;return e},_focusNextTab:function(t,e){return t=this._findNextTab(t,e),this.tabs.eq(t).trigger("focus"),t},_setOption:function(t,e){return"active"===t?(this._activate(e),void 0):(this._super(t,e),"collapsible"===t&&(this._toggleClass("ui-tabs-collapsible",null,e),e||this.options.active!==!1||this._activate(0)),"event"===t&&this._setupEvents(e),"heightStyle"===t&&this._setupHeightStyle(e),void 0)},_sanitizeSelector:function(t){return t?t.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g,"\\$&"):""},refresh:function(){var e=this.options,i=this.tablist.children(":has(a[href])");e.disabled=t.map(i.filter(".ui-state-disabled"),function(t){return i.index(t)}),this._processTabs(),e.active!==!1&&this.anchors.length?this.active.length&&!t.contains(this.tablist[0],this.active[0])?this.tabs.length===e.disabled.length?(e.active=!1,this.active=t()):this._activate(this._findNextTab(Math.max(0,e.active-1),!1)):e.active=this.tabs.index(this.active):(e.active=!1,this.active=t()),this._refresh()},_refresh:function(){this._setOptionDisabled(this.options.disabled),this._setupEvents(this.options.event),this._setupHeightStyle(this.options.heightStyle),this.tabs.not(this.active).attr({"aria-selected":"false","aria-expanded":"false",tabIndex:-1}),this.panels.not(this._getPanelForTab(this.active)).hide().attr({"aria-hidden":"true"}),this.active.length?(this.active.attr({"aria-selected":"true","aria-expanded":"true",tabIndex:0}),this._addClass(this.active,"ui-tabs-active","ui-state-active"),this._getPanelForTab(this.active).show().attr({"aria-hidden":"false"})):this.tabs.eq(0).attr("tabIndex",0)},_processTabs:function(){var e=this,i=this.tabs,s=this.anchors,n=this.panels;this.tablist=this._getList().attr("role","tablist"),this._addClass(this.tablist,"ui-tabs-nav","ui-helper-reset ui-helper-clearfix ui-widget-header"),this.tablist.on("mousedown"+this.eventNamespace,"> li",function(e){t(this).is(".ui-state-disabled")&&e.preventDefault()}).on("focus"+this.eventNamespace,".ui-tabs-anchor",function(){t(this).closest("li").is(".ui-state-disabled")&&this.blur()}),this.tabs=this.tablist.find("> li:has(a[href])").attr({role:"tab",tabIndex:-1}),this._addClass(this.tabs,"ui-tabs-tab","ui-state-default"),this.anchors=this.tabs.map(function(){return t("a",this)[0]}).attr({role:"presentation",tabIndex:-1}),this._addClass(this.anchors,"ui-tabs-anchor"),this.panels=t(),this.anchors.each(function(i,s){var n,o,a,r=t(s).uniqueId().attr("id"),l=t(s).closest("li"),h=l.attr("aria-controls");e._isLocal(s)?(n=s.hash,a=n.substring(1),o=e.element.find(e._sanitizeSelector(n))):(a=l.attr("aria-controls")||t({}).uniqueId()[0].id,n="#"+a,o=e.element.find(n),o.length||(o=e._createPanel(a),o.insertAfter(e.panels[i-1]||e.tablist)),o.attr("aria-live","polite")),o.length&&(e.panels=e.panels.add(o)),h&&l.data("ui-tabs-aria-controls",h),l.attr({"aria-controls":a,"aria-labelledby":r}),o.attr("aria-labelledby",r)}),this.panels.attr("role","tabpanel"),this._addClass(this.panels,"ui-tabs-panel","ui-widget-content"),i&&(this._off(i.not(this.tabs)),this._off(s.not(this.anchors)),this._off(n.not(this.panels)))},_getList:function(){return this.tablist||this.element.find("ol, ul").eq(0)},_createPanel:function(e){return t("<div>").attr("id",e).data("ui-tabs-destroy",!0)},_setOptionDisabled:function(e){var i,s,n;for(t.isArray(e)&&(e.length?e.length===this.anchors.length&&(e=!0):e=!1),n=0;s=this.tabs[n];n++)i=t(s),e===!0||-1!==t.inArray(n,e)?(i.attr("aria-disabled","true"),this._addClass(i,null,"ui-state-disabled")):(i.removeAttr("aria-disabled"),this._removeClass(i,null,"ui-state-disabled"));this.options.disabled=e,this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,e===!0)},_setupEvents:function(e){var i={};e&&t.each(e.split(" "),function(t,e){i[e]="_eventHandler"}),this._off(this.anchors.add(this.tabs).add(this.panels)),this._on(!0,this.anchors,{click:function(t){t.preventDefault()}}),this._on(this.anchors,i),this._on(this.tabs,{keydown:"_tabKeydown"}),this._on(this.panels,{keydown:"_panelKeydown"}),this._focusable(this.tabs),this._hoverable(this.tabs)},_setupHeightStyle:function(e){var i,s=this.element.parent();"fill"===e?(i=s.height(),i-=this.element.outerHeight()-this.element.height(),this.element.siblings(":visible").each(function(){var e=t(this),s=e.css("position");"absolute"!==s&&"fixed"!==s&&(i-=e.outerHeight(!0))}),this.element.children().not(this.panels).each(function(){i-=t(this).outerHeight(!0)}),this.panels.each(function(){t(this).height(Math.max(0,i-t(this).innerHeight()+t(this).height()))}).css("overflow","auto")):"auto"===e&&(i=0,this.panels.each(function(){i=Math.max(i,t(this).height("").height())}).height(i))},_eventHandler:function(e){var i=this.options,s=this.active,n=t(e.currentTarget),o=n.closest("li"),a=o[0]===s[0],r=a&&i.collapsible,l=r?t():this._getPanelForTab(o),h=s.length?this._getPanelForTab(s):t(),c={oldTab:s,oldPanel:h,newTab:r?t():o,newPanel:l};e.preventDefault(),o.hasClass("ui-state-disabled")||o.hasClass("ui-tabs-loading")||this.running||a&&!i.collapsible||this._trigger("beforeActivate",e,c)===!1||(i.active=r?!1:this.tabs.index(o),this.active=a?t():o,this.xhr&&this.xhr.abort(),h.length||l.length||t.error("jQuery UI Tabs: Mismatching fragment identifier."),l.length&&this.load(this.tabs.index(o),e),this._toggle(e,c))},_toggle:function(e,i){function s(){o.running=!1,o._trigger("activate",e,i)}function n(){o._addClass(i.newTab.closest("li"),"ui-tabs-active","ui-state-active"),a.length&&o.options.show?o._show(a,o.options.show,s):(a.show(),s())}var o=this,a=i.newPanel,r=i.oldPanel;this.running=!0,r.length&&this.options.hide?this._hide(r,this.options.hide,function(){o._removeClass(i.oldTab.closest("li"),"ui-tabs-active","ui-state-active"),n()}):(this._removeClass(i.oldTab.closest("li"),"ui-tabs-active","ui-state-active"),r.hide(),n()),r.attr("aria-hidden","true"),i.oldTab.attr({"aria-selected":"false","aria-expanded":"false"}),a.length&&r.length?i.oldTab.attr("tabIndex",-1):a.length&&this.tabs.filter(function(){return 0===t(this).attr("tabIndex")}).attr("tabIndex",-1),a.attr("aria-hidden","false"),i.newTab.attr({"aria-selected":"true","aria-expanded":"true",tabIndex:0})},_activate:function(e){var i,s=this._findActive(e);s[0]!==this.active[0]&&(s.length||(s=this.active),i=s.find(".ui-tabs-anchor")[0],this._eventHandler({target:i,currentTarget:i,preventDefault:t.noop}))},_findActive:function(e){return e===!1?t():this.tabs.eq(e)},_getIndex:function(e){return"string"==typeof e&&(e=this.anchors.index(this.anchors.filter("[href$='"+t.ui.escapeSelector(e)+"']"))),e},_destroy:function(){this.xhr&&this.xhr.abort(),this.tablist.removeAttr("role").off(this.eventNamespace),this.anchors.removeAttr("role tabIndex").removeUniqueId(),this.tabs.add(this.panels).each(function(){t.data(this,"ui-tabs-destroy")?t(this).remove():t(this).removeAttr("role tabIndex aria-live aria-busy aria-selected aria-labelledby aria-hidden aria-expanded")}),this.tabs.each(function(){var e=t(this),i=e.data("ui-tabs-aria-controls");i?e.attr("aria-controls",i).removeData("ui-tabs-aria-controls"):e.removeAttr("aria-controls")}),this.panels.show(),"content"!==this.options.heightStyle&&this.panels.css("height","")},enable:function(e){var i=this.options.disabled;i!==!1&&(void 0===e?i=!1:(e=this._getIndex(e),i=t.isArray(i)?t.map(i,function(t){return t!==e?t:null}):t.map(this.tabs,function(t,i){return i!==e?i:null})),this._setOptionDisabled(i))},disable:function(e){var i=this.options.disabled;if(i!==!0){if(void 0===e)i=!0;else{if(e=this._getIndex(e),-1!==t.inArray(e,i))return;i=t.isArray(i)?t.merge([e],i).sort():[e]}this._setOptionDisabled(i)}},load:function(e,i){e=this._getIndex(e);var s=this,n=this.tabs.eq(e),o=n.find(".ui-tabs-anchor"),a=this._getPanelForTab(n),r={tab:n,panel:a},l=function(t,e){"abort"===e&&s.panels.stop(!1,!0),s._removeClass(n,"ui-tabs-loading"),a.removeAttr("aria-busy"),t===s.xhr&&delete s.xhr};this._isLocal(o[0])||(this.xhr=t.ajax(this._ajaxSettings(o,i,r)),this.xhr&&"canceled"!==this.xhr.statusText&&(this._addClass(n,"ui-tabs-loading"),a.attr("aria-busy","true"),this.xhr.done(function(t,e,n){setTimeout(function(){a.html(t),s._trigger("load",i,r),l(n,e)},1)}).fail(function(t,e){setTimeout(function(){l(t,e)},1)})))},_ajaxSettings:function(e,i,s){var n=this;return{url:e.attr("href").replace(/#.*$/,""),beforeSend:function(e,o){return n._trigger("beforeLoad",i,t.extend({jqXHR:e,ajaxSettings:o},s))}}},_getPanelForTab:function(e){var i=t(e).attr("aria-controls");return this.element.find(this._sanitizeSelector("#"+i))}}),t.uiBackCompat!==!1&&t.widget("ui.tabs",t.ui.tabs,{_processTabs:function(){this._superApply(arguments),this._addClass(this.tabs,"ui-tab")}}),t.ui.tabs});
