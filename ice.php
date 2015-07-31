<?php
include_once('config.php');
include_once('config_db.php');
error_reporting(0);

function connect () {
  $link = mysqli_connect(DBHOST, DBUSER, DBPASS) or die("Connection error: " . mysqli_error($link));
  mysqli_set_charset($link,"utf8") or die("Error: " . mysqli_error($link));
  mysqli_select_db($link,DBNAME) or die("Error: " . mysqli_error($link));
  return $link;
}

function save ($station,$song,$username) {
  if (!empty($username) or !empty($song)) {
    $link = connect();
    $song = mysqli_real_escape_string($link,$song);
    $query = "INSERT INTO `songs` (station,song,user) VALUES ('$station','$song','$username')";
    $result = mysqli_query($link,$query);
    $err_msg = ($result ? "" : mysqli_error($link));
  } else {
    $err_msg = "No username or song given.";
  }
  $obj = new stdClass;
  $obj->action = "save";
  $obj->station = $station;
  if (empty($err_msg)) {
    $obj->status = "ok";
  } else {
    $obj->status = "error";
    $obj->error_msg = $err_msg;
  }
  return json_encode($obj,JSON_UNESCAPED_UNICODE);
}

function load ($station,$username) {
  if (!empty($username)) {
    $link = connect();
    $query = "SELECT song FROM `songs` WHERE `station`='$station' AND `user`='$username'";
    $result = mysqli_query($link,$query) or die("Query failed" . mysqli_error($link));
    header('Content-Type: text/html; charset=utf-8');
    echo "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no\"><br />\n";
    while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)) {
      echo $row['song'] . "<br />\n";
    }
    return ;
  } else {
    echo "No username given.";
    return ;
  }
}


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
  $result = getMp3StreamTitle($url);
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

if (!empty($_GET) and isset($_GET["station"]) and isset($_GET["action"])){
  $action=$_GET["action"];
  $station=$_GET["station"];
  $username=($_GET["user"] ? $_GET["user"] : "");
  if (in_array($station, $list) or $station == "all") {
    switch ($action) {
      case "request":
        if ($station == "all") {
          foreach ($list as $station) {
            $stations[$station]=stationRequest($station);
          }
        } else {
           $stations[$station]=stationRequest($station);
        }
        $obj = new stdClass;
        $obj->action = "refresh";
        $obj->response = $stations;
        $result = json_encode($obj,JSON_UNESCAPED_UNICODE);;
        break;
      case "save":
        $result = save ($station,($_GET["song"] ? $_GET["song"] : ""),$username);
        break;
      case "load":
        $result = load ($station,$username);
        break;
      case "list":
        $obj = new stdClass;
        $obj->action = "list";
        $obj->stations = $list;
        $result = json_encode($obj,JSON_UNESCAPED_UNICODE);
        break;
      default:
        $result = "Wrong action.";
        break;
    }
  } else {
    $result = "Wrong station.";
  }
} else {
  $result ="No action os station given.";
}

if (isset($result)) {
  echo $result;
  sleep(1);
}
?>
