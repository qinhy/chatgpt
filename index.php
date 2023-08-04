<?php
$jsonString = file_get_contents('roles.json');
$data = json_decode($jsonString, true)['roles_jp'];
?>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <title>JapanGPT demo (ChatGPT3.5)</title>
    <link rel="stylesheet" href="css/common.css?v1.1">
    <link rel="stylesheet" href="css/wenda.css?v1.1">
    <link rel="stylesheet" href="css/hightlight.css">    
    <script src="js/jquery-3.6.4.min.js"></script>
    <script src="js/jquery.cookie.min.js"></script>
</head>

<body>
    <div class="layout-wrap">
        <header class="layout-header">
            <div class="container" data-flex="main:justify cross:start">
                <div class="header-logo">
                    <h2 class="logo"><a class="links" id="clean" title="clear all"><span class="logo-title">clear all</span></a></h2>
                </div>
                <div class="header-logo">
                    <h2 class="logo"><a class="links" href="https://github.com/dirk1983/chatgpt"><span class="logo-title">source code</span></a></h2>
                </div>
            </div>
        </header>
        <div class="layout-content">
            <div class="container">
                <article class="article" id="article">
                    <div class="article-box">
                        <div class="precast-block" data-flex="main:left">
                            <div class="input-group">
                                <span style="text-align: center;color:#9ca2a8">&nbsp;&nbsp;連続対話：</span>
                                <input type="checkbox" id="keep" checked style="min-width:220px;">
                                <label for="keep"></label>
                            </div>
                            <div class="input-group">
                                <span style="text-align: center;color:#9ca2a8">&nbsp;&nbsp;マインドセット</span>
                                <!-- <select id="preset-text" onchange="insertPresetText()" style="width:calc(100% - 90px);max-width:280px;"> -->
                                <select id="preset-text" style="width:calc(100% - 90px);max-width:280px;">
                                        <?php foreach($data as $option): ?>
                                                <option value='<?php echo str_replace('"', '&quot;', str_replace("'", '&apos;', $option['value'])); ?>'><?php echo $option['text']; ?></option>
                                        <?php endforeach; ?>
                                </select>
                            </div>
                        </div>
                        <ul id="article-wrapper">
                        </ul>
                        <div class="creating-loading" data-flex="main:center dir:top cross:center">
                            <div class="semi-circle-spin"></div>
                        </div>
                        <div id="fixed-block">
                            <div class="precast-block" id="kw-target-box" data-flex="main:left cross:center">
                                <div id="target-box" class="box">
                                    <textarea name="kw-target" placeholder="ここで質問して、Ctrl+Enterを押して送信します" id="kw-target" autofocus rows=1></textarea>
                                </div>
                                <div class="right-btn layout-bar">
                                    <p class="btn ai-btn bright-btn" id="ai-btn" data-flex="main:center cross:center"><i class="iconfont icon-wuguan"></i>送信</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </div>
    <div id="system" data-hidden="You are a helpful assistant who is proficient in both English and Japanese. Please ensure that all your replies are in Japanese, except for computer commands."></div>
    <script src="js/remarkable.js"></script>
    <script src="js/layer.min.js"></script>
    <script src="js/chat.js?v2.8"></script>
    <script src="js/highlight.min.js"></script>
    <script src="//cdn.bootcss.com/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
        showProcessingMessages: false,
        messageStyle: "none",
        extensions: ["tex2jax.js"],
        jax: ["input/TeX", "output/HTML-CSS"],
        tex2jax: {
            inlineMath:  [ ["$", "$"] ],
        displayMath: [ ["$$","$$"] ],
        skipTags: ['script', 'noscript', 'style', 'textarea', 'pre','code','a'],
        ignoreClass:"comment-content"
            },
        "HTML-CSS": {
            availableFonts: ["STIX","TeX"],
        showMathMenu: false
            }
        });
    </script>
    <script>
        const rols = document.getElementById('preset-text');
        const sys = document.getElementById('system');
        rols.onchange = ()=>{
            sys.dataset.hidden = rols.options[rols.selectedIndex].value;            
            $("#clean").click(); 
        };        
        if ($('#key').length) {
            $(document).ready(function() {
                var key = $.cookie('key');
                if (key) {
                    $('#key').val(key);
                }
                $('#key').on('input', function() {
                    var inputVal = $(this).val();
                    $.cookie('key', inputVal, {
                        expires: 365
                    });
                });
            });
        }
    </script>
</body>

</html>
