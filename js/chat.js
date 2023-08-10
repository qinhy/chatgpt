var contextarray = [];

var defaults = {
    html: false,        // Enable HTML tags in source
    xhtmlOut: false,        // Use '/' to close single tags (<br />)
    breaks: false,        // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-',  // CSS language prefix for fenced blocks
    linkify: true,         // autoconvert URL-like texts to links
    linkTarget: '',           // set target to open link in
    typographer: true,         // Enable smartypants and other sweet transforms
    _highlight: true,
    _strict: false,
    _view: 'html'
};
defaults.highlight = function (str, lang) {
    if (!defaults._highlight || !window.hljs) { return ''; }

    var hljs = window.hljs;
    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(lang, str).value;
        } catch (__) { }
    }

    try {
        return hljs.highlightAuto(str).value;
    } catch (__) { }

    return '';
};
mdHtml = new window.Remarkable('full', defaults);

mdHtml.renderer.rules.table_open = function () {
    return '<table class="table table-striped">\n';
};

mdHtml.renderer.rules.paragraph_open = function (tokens, idx) {
    var line;
    if (tokens[idx].lines && tokens[idx].level === 0) {
        line = tokens[idx].lines[0];
        return '<p class="line" data-line="' + line + '">';
    }
    return '<p>';
};

mdHtml.renderer.rules.heading_open = function (tokens, idx) {
    var line;
    if (tokens[idx].lines && tokens[idx].level === 0) {
        line = tokens[idx].lines[0];
        return '<h' + tokens[idx].hLevel + ' class="line" data-line="' + line + '">';
    }
    return '<h' + tokens[idx].hLevel + '>';
};
function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(name + '=') === 0) {
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return null;
}

function isMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['iphone', 'ipod', 'ipad', 'android', 'windows phone', 'blackberry', 'nokia', 'opera mini', 'mobile'];
    for (let i = 0; i < mobileKeywords.length; i++) {
        if (userAgent.indexOf(mobileKeywords[i]) !== -1) {
            return true;
        }
    }
    return false;
}

function insertPresetText() {
    $("#kw-target").val($('#preset-text').val());
    autoresize();
}

function initcode() {
    console['\x6c\x6f\x67']("Original site : http://github.com/dirk1983/chatgpt");
}

function copyToClipboard(text) {
    var input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

function copycode(obj) {
    copyToClipboard($(obj).closest('code').clone().children('button').remove().end().text());
    layer.msg("コピー完了！");
}

function autoresize() {
    var textarea = $('#kw-target');
    var width = textarea.width();
    var content = (textarea.val() + "a").replace(/\\n/g, '<br>');
    var div = $('<div>').css({
        'position': 'absolute',
        'top': '-99999px',
        'border': '1px solid red',
        'width': width,
        'font-size': '15px',
        'line-height': '20px',
        'white-space': 'pre-wrap'
    }).html(content).appendTo('body');
    var height = div.height();
    var rows = Math.ceil(height / 20);
    div.remove();
    textarea.attr('rows', rows);
    $("#article-wrapper").height(parseInt($(window).height()) - parseInt($("#fixed-block").height()) - parseInt($(".layout-header").height()) - 80);
}

$(document).ready(function () {
    initcode();
    autoresize();
    $("#kw-target").on('keydown', function (event) {
        if (event.keyCode == 13 && event.ctrlKey) {
            send_post();
            return false;
        }
    });

    $(window).resize(function () {
        autoresize();
    });

    $('#kw-target').on('input', function () {
        autoresize();
    });

    $("#ai-btn").click(function () {
        if ($("#kw-target").is(':disabled')) {
            clearInterval(timer);
            $("#kw-target").val("");
            $("#kw-target").attr("disabled", false);
            autoresize();
            $("#ai-btn").html('<i class="iconfont icon-wuguan"></i>送信');
            if (!isMobile()) $("#kw-target").focus();
        } else {
            send_post();
        }
        return false;
    });

    $("#clean").click(function () {
        $("#article-wrapper").html("");
        contextarray = [];
        layer.msg("リセット完了！");
        return false;
    });

    $("#showlog").click(function () {
        let btnArry = ['既読'];
        layer.open({ type: 1, title: '全ログ', area: ['80%', '80%'], shade: 0.5, scrollbar: true, offset: [($(window).height() * 0.1), ($(window).width() * 0.1)], content: '<iframe src="chat.txt?' + new Date().getTime() + '" style="width: 100%; height: 100%;"></iframe>', btn: btnArry });
        return false;
    });

    function send_post() {
        if (($('#key').length) && ($('#key').val().length != 51)) {
            layer.msg("正しいAPI-KEYをお願いいたします。", { icon: 5 });
            return;
        }

        var prompt = $("#kw-target").val();

        if (prompt == "") {
            layer.msg("質問が空です", { icon: 5 });
            return;
        }

        var loading = layer.msg('考え中...', {
            icon: 16,
            shade: 0.4,
            time: false //取消自动关闭
        });

        function draw() {
            $.get("getpicture.php", function (data) {
                layer.close(loading);
                layer.msg("処理完了！");
                answer = randomString(16);
                $("#article-wrapper").append('<li class="article-title" id="q' + answer + '"><pre></pre></li>');
                for (var j = 0; j < prompt.length; j++) {
                    $("#q" + answer).children('pre').text($("#q" + answer).children('pre').text() + prompt[j]);
                }
                $("#article-wrapper").append('<li class="article-content" id="' + answer + '"><img onload="document.getElementById(\'article-wrapper\').scrollTop=100000;" src="pictureproxy.php?url=' + encodeURIComponent(data.data[0].url) + '"></li>');
                $("#kw-target").val("");
                $("#kw-target").attr("disabled", false);
                autoresize();
                $("#ai-btn").html('<i class="iconfont icon-wuguan"></i>送信');
                if (!isMobile()) $("#kw-target").focus();
            }, "json");
        }
        function streaming() {
            var es = new EventSource("stream.php");
            console.log(es)
            var isstarted = true;
            var alltext = "";
            var isalltext = false;
            es.onerror = function (event) {
                layer.close(loading);
                var errcode = getCookie("errcode");
                switch (errcode) {
                    case "invalid_api_key":
                        layer.msg("API-KEYが無効です");
                        break;
                    case "context_length_exceeded":
                        layer.msg("文が長すぎました。");
                        break;
                    case "rate_limit_reached":
                        layer.msg("同時にアクセスするユーザーが多すぎます、後で再試行してください");
                        break;
                    case "access_terminated":
                        layer.msg("不正な使用、API-KEYがブロックされました");
                        break;
                    case "no_api_key":
                        layer.msg("API-KEYが提供されていません");
                        break;
                    case "insufficient_quota":
                        layer.msg("API-KEYの残高が不足しています");
                        break;
                    case "account_deactivated":
                        layer.msg("アカウントが無効化されました");
                        break;
                    case "model_overloaded":
                        layer.msg("OpenAIモデルが過負荷、もう一度リクエストを行ってください");
                        break;
                    case null:
                        layer.msg("OpenAIサーバーへのアクセスタイムアウトまたは未知のエラータイプ");
                        break;
                    default:
                        layer.msg("OpenAIサーバーの故障、エラータイプ:" + errcode);
                }
                es.close();
                if (!isMobile()) $("#kw-target").focus();
                return;
            }
            es.onmessage = function (event) {
                event.data = atob(event.data);
                if (isstarted) {
                    layer.close(loading);
                    $("#kw-target").val("少々お待ちください…");
                    $("#kw-target").attr("disabled", true);
                    autoresize();
                    $("#ai-btn").html('<i class="iconfont icon-wuguan"></i>中止');
                    layer.msg("処理完了！");
                    isstarted = false;
                    answer = randomString(16);
                    $("#article-wrapper").append('<li class="article-title" id="q' + answer + '"><pre></pre></li>');
                    for (var j = 0; j < prompt.length; j++) {
                        $("#q" + answer).children('pre').text($("#q" + answer).children('pre').text() + prompt[j]);
                    }
                    $("#article-wrapper").append('<li class="article-content" id="' + answer + '"></li>');
                    let str_ = '';
                    let i = 0;
                    let strforcode = '';
                    timer = setInterval(() => {
                        let newalltext = alltext;
                        let islastletter = false;
                        //有时服务器错误地返回\\n作为换行符,尤其是包含上下文的提问时,这行代码可以处理一下。
                        if (newalltext.split("\n").length == 1) {
                            newalltext = newalltext.replace(/\\n/g, '\n');
                        }
                        if (str_.length < (newalltext.length - 3)) {
                            str_ += newalltext[i++];
                            strforcode = str_;
                            if ((str_.split("```").length % 2) == 0) {
                                strforcode += "\n```\n";
                            } else {
                                strforcode += "_";
                            }
                        } else {
                            if (isalltext) {
                                clearInterval(timer);
                                strforcode = newalltext;
                                islastletter = true;
                                $("#kw-target").val("");
                                $("#kw-target").attr("disabled", false);
                                autoresize();
                                $("#ai-btn").html('<i class="iconfont icon-wuguan"></i>送信');
                                if (!isMobile()) $("#kw-target").focus();
                            }
                        }
                        //let arr = strforcode.split("```");
                        //for (var j = 0; j <= arr.length; j++) {
                        //    if (j % 2 == 0) {
                        //        arr[j] = arr[j].replace(/\n\n/g, '\n');
                        //        arr[j] = arr[j].replace(/\n/g, '\n\n');
                        //        arr[j] = arr[j].replace(/\t/g, '\\t');
                        //        arr[j] = arr[j].replace(/\n {4}/g, '\n\\t');
                        //        arr[j] = $("<div>").text(arr[j]).html();
                        //    }
                        //}

                        //var converter = new showdown.Converter();
                        //newalltext = converter.makeHtml(arr.join("```"));
                        newalltext = mdHtml.render(strforcode);
                        //newalltext = newalltext.replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
                        $("#" + answer).html(newalltext);
                        if (islastletter) MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                        //if (document.querySelector("[id='" + answer + "']" + " pre code")) document.querySelectorAll("[id='" + answer + "']" + " pre code").forEach(el => { hljs.highlightElement(el); });
                        $("#" + answer + " pre code").each(function () {
                            $(this).html("<button onclick='copycode(this);' class='codebutton'>コピー</button>" + $(this).html());
                        });
                        document.getElementById("article-wrapper").scrollTop = 100000;
                    }, 30);
                }
                if (event.data == "[DONE]") {
                    isalltext = true;
                    contextarray.push([prompt, alltext]);
                    contextarray = contextarray.slice(-5); //只保留最近5次对话作为上下文,以免超过最大tokens限制
                    es.close();
                    return;
                }
                var json = eval("(" + event.data + ")");
                if (json.choices[0].delta.hasOwnProperty("content")) {
                    if (alltext == "") {
                        alltext = json.choices[0].delta.content.replace(/^\n+/, ''); //去掉回复消息中偶尔开头就存在的连续换行符
                    } else {
                        alltext += json.choices[0].delta.content;
                    }
                }
            }
        }


        if (prompt.charAt(0) === '絵') {
            $.ajax({
                cache: true,
                type: "POST",
                url: "setsession.php",
                data: {
                    message: prompt,
                    context: '[]',
                    key: ($("#key").length) ? ($("#key").val()) : '',
                },
                dataType: "json",
                success: function (results) {
                    draw();
                }
            });
        } else {
            $.ajax({
                cache: true,
                type: "POST",
                url: "setsession.php",
                data: {                    
                    system_role: document.getElementById('system').dataset.hidden,
                    message: prompt,
                    context: (!($("#keep").length) || ($("#keep").prop("checked"))) ? JSON.stringify(contextarray) : '[]',
                    key: ($("#key").length) ? ($("#key").val()) : '',
                },
                dataType: "json",
                success: function (results) {
                    streaming();
                }
            });
        }


    }

    function randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

});
