<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/event-stream");
header("X-Accel-Buffering: no");
set_time_limit(0);
session_start();
$postData = $_SESSION['data'];
$postData_j = json_decode($postData);
$responsedata = "";
$ch = curl_init();

$OPENAI_API_KEY = 'sk-';//getenv('OPENAI_API_KEY');]

function sendmsg($msg) {    
    echo "data: ".$msg."\n\n";
} 

//如果首页开启了输入自定义apikey，则采用用户输入的apikey
if (isset($_SESSION['key'])) {
    $OPENAI_API_KEY = $_SESSION['key'];
}
session_write_close();
$headers  = [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: Bearer ' . $OPENAI_API_KEY
];

setcookie("errcode", ""); //EventSource无法获取错误信息，通过cookie传递
setcookie("errmsg", "");

$callback = function ($ch, $data) {
    global $responsedata;
    // error_log('sssssssssssssssssssssssssss'.$data); 
    $data_arr = explode('data: ',$data);
    $responsedata .= $data;
    if(json_decode($responsedata,true)){
        $data_arr = [$responsedata];
    }

    for($i = 0; $i < count($data_arr); ++$i) {
        $complete=json_decode($data_arr[$i],true);
        if($complete==null)continue;      
        // if($complete==null)throw new Exception('json_decode at data is null!');

        if (isset($complete['error'])) {
            setcookie("errcode", $complete['error']['code']);
            setcookie("errmsg", $data);
            if (strpos($complete['error']['message'], "Rate limit reached") === 0) { //访问频率超限错误返回的code为空，特殊处理一下
                setcookie("errcode", "rate_limit_reached");
            }
            if (strpos($complete['error']['message'], "Your access was terminated") === 0) { //违规使用，被封禁，特殊处理一下
                setcookie("errcode", "access_terminated");
            }
            if (strpos($complete['error']['message'], "You didn't provide an API key") === 0) { //未提供API-KEY
                setcookie("errcode", "no_api_key");
            }
            if (strpos($complete['error']['message'], "You exceeded your current quota") === 0) { //API-KEY余额不足
                setcookie("errcode", "insufficient_quota");
            }
            if (strpos($complete['error']['message'], "That model is currently overloaded") === 0) { //OpenAI模型超负荷
                setcookie("errcode", "model_overloaded");
            }
            $responsedata = $data;
        } else {
            $datatmp = $data_arr[$i];
            if(isset($complete['choices'][0]['delta']['content'])){
                $complete['choices'][0]['delta']['content'] = base64_encode($complete['choices'][0]['delta']['content']);  
                $datatmp = json_encode($complete, true); 
            } 
            else{
                $complete1 = json_decode($responsedata, true); 
                if($complete1 && isset($complete1['choices'][0]['message']['content'])){
                    // $datatmp = base64_encode($complete1['choices'][0]['message']['content']);
                    // $temp = '{"id":"","object":"","created":0,"model":"","choices":[{"index":0,"delta":{"content":"'.$datatmp;
                    // $datatmp =  $temp.'"},"finish_reason":"stop"}]}';
                    $complete1['choices'][0]['message']['content'] = base64_encode($complete1['choices'][0]['message']['content']);
                    $datatmp = json_encode($complete1);
                }
            }
            sendmsg($datatmp);
            flush();
        }
    }
    return strlen($data);
};

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, $callback);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 120); // 设置连接超时时间为30秒
curl_setopt($ch, CURLOPT_MAXREDIRS, 3); // 设置最大重定向次数为3次
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // 允许自动重定向
curl_setopt($ch, CURLOPT_AUTOREFERER, true); // 自动设置Referer
//curl_setopt($ch, CURLOPT_PROXY, "http://127.0.0.1:1081");

curl_exec($ch);
curl_close($ch);

// echo $responsedata;

// $answer = "";
// if (substr(trim($responsedata), -6) == "[DONE]") {
//     $responsedata = substr(trim($responsedata), 0, -6) . "{";
// }
// $responsearr = explode("}\n\ndata: {", $responsedata);

// foreach ($responsearr as $msg) {
//     $contentarr = json_decode("{" . trim($msg) . "}", true);
//     if (isset($contentarr['choices'][0]['delta']['content'])) {
//         $answer .= $contentarr['choices'][0]['delta']['content'];
//     }
// }
// $questionarr = json_decode($postData, true);
// $filecontent = $_SERVER["REMOTE_ADDR"] . " | " . date("Y-m-d H:i:s") . "\n";
// $filecontent .= "Q:" . end($questionarr['messages'])['content'] .  "\nA:" . trim($answer) . "\n----------------\n";
// $myfile = fopen(__DIR__ . "/chatlog.php", "a") or die("Writing file failed.");
// fwrite($myfile, $responsedata);
// fclose($myfile);
