<?php
include_once('config.php');
    function getMp3StreamTitle($steam_url)
    {
        $result = false;
        $icy_metaint = -1;
        $needle = 'StreamTitle=';
        $ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36';

        $opts = array(
            'http' => array(
                'method' => 'GET',
                'header' => 'Icy-MetaData: 1',
                'user_agent' => $ua
            )
        );

        $default = stream_context_set_default($opts);

        $stream = fopen($steam_url, 'r');

        if($stream && ($meta_data = stream_get_meta_data($stream)) && isset($meta_data['wrapper_data'])){
            foreach ($meta_data['wrapper_data'] as $header){
                if (strpos(strtolower($header), 'icy-metaint') !== false){
                    $tmp = explode(":", $header);
                    $icy_metaint = trim($tmp[1]);
                    break;
                }
            }
        }

        if($icy_metaint != -1)
        {
            $buffer = stream_get_contents($stream, 300, $icy_metaint);

            if(strpos($buffer, $needle) !== false)
            {
                $title = explode($needle, $buffer);
                $title = trim($title[1]);
                $result = substr($title, 1, strpos($title, ';') - 2);
            }
        }

        if($stream)
            fclose($stream);                

        return $result;
    }

function stationRequest($name) {
  $url = 'http://nashe2.hostingradio.ru:80/'.$name.'-128.mp3';
  $result = getMp3StreamTitle($url, 19200);
  $result = str_replace ("_VOICE","",$result);
  if (strlen($result)<=0) {
    $result = "No Song.";
  }
  else {
    $encoding = mb_detect_encoding($result, "auto");
    //echo $encoding." ";

    //$result = utf8_encode($result);
    //$result = iconv('ASCII', 'UTF-8//IGNORE', $result);
    //$result = mb_convert_encoding( $result, "UTF-8", $encoding);

    //$encoding = mb_detect_encoding($a, "auto");
    //echo " ".$encoding;
  }
  return $result;
}

$q=$_GET["station"];

if (in_array($q, $list)) {
  //$a[]=array("station" => $q,"song" => stationRequest($q));
  $a[$q]=stationRequest($q);
  //$result = json_encode($a,JSON_UNESCAPED_UNICODE);
}
elseif ($q == "all") {
  foreach ($list as $station) {
    //$a[]=array("station" => $station,"song" => stationRequest($station));
    $a[$station]=stationRequest($station);
    //$result = json_encode($a,JSON_UNESCAPED_UNICODE);
  }
} else {
  $result = "Wrong station!";
}
$obj = new stdClass;
$obj->action = "refresh";
$obj->response = $a;
echo json_encode($obj,JSON_UNESCAPED_UNICODE);;
//  sleep(1);
?>
