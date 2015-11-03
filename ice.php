<?php
error_reporting(0);
include_once('config.php');
include_once('config_db.php');

function connect () {
  $link = mysqli_connect(DBHOST, DBUSER, DBPASS) or die("Connection error: " . mysqli_error($link));
  mysqli_set_charset($link,"utf8") or die("Error: " . mysqli_error($link));
  mysqli_select_db($link,DBNAME) or die("Error: " . mysqli_error($link));
  return $link;
}

function save ($station,$song,$username) {
  if (!empty($username) and !empty($song)) {
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
    $obj = new stdClass;
    $obj->action = "load";
    $obj->station = $station;
  if (!empty($username)) {
    $link = connect();
    $query = "SELECT song,id FROM `songs` WHERE `station`='$station' AND `user`='$username'";
    $result = mysqli_query($link,$query);
    $err_msg = ($result ? "" : mysqli_error($link));
    if (empty($err_msg)) {
      $obj->songs = [];
      while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)) {
         $obj->songs[] = $row;
      }
    } else {
      $obj->status = "error";
      $obj->error_msg = $err_msg;
    }
  } else {
      $obj->status = "error";
      $obj->error_msg = "No username given.";
  }
  return json_encode($obj,JSON_UNESCAPED_UNICODE);
}

function delete ($song,$username) {
  if (!empty($username) and !empty($song)) {
    $link = connect();
    $song = mysqli_real_escape_string($link,$song);
    $query = "DELETE FROM `songs` WHERE `songs`.`id` = '$song' AND `user` = '$username'";
    mysqli_query($link,$query);
    $result = (mysqli_affected_rows($link) > 0 ? true : false);
    $err_msg = (empty(mysqli_error($link)) ? ($result ? "" : "Not deleted") : mysqli_error($link));
  } else {
    $err_msg = "No username or song id given.";
  }
  $obj = new stdClass;
  $obj->action = "delete";
  if (empty($err_msg)) {
    $obj->id = $song;
    $obj->status = "ok";
  } else {
    $obj->status = "error";
    $obj->error_msg = $err_msg;
  }
  return json_encode($obj,JSON_UNESCAPED_UNICODE);
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
        if (!$stream) return "Failed to update.";

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
  if (strlen($result)<=0) {
    $result = "No Song.";
  }
  else {
    $result = str_replace ("_VOICE","",$result);
    $encoding = mb_detect_encoding($result, "auto");
    /** Encoding tests
    * echo $encoding." ";
    * $result = utf8_encode($result);
    * $result = iconv('ASCII', 'UTF-8//IGNORE', $result);
    * $result = mb_convert_encoding( $result, "UTF-8", $encoding);
    * $encoding = mb_detect_encoding($a, "auto");
    * echo " ".$encoding;
    */
  }
  return $result;
}

function request($station) {
global $names;
  $obj = new stdClass;
  if (empty($station)) {
    $obj->status = "error";
    $obj->error_msg = "No station given.";
    $result = json_encode($obj,JSON_UNESCAPED_UNICODE);
    return $result;
  } elseif (!in_array($station, array_keys($names)) and $station != "all") {
      $obj->status = "error";
      $obj->error_msg = "Wrong station.";
      $result = json_encode($obj,JSON_UNESCAPED_UNICODE);
      return $result;
  } else {
     if ($station == "all") {
       foreach ($names as $name=>$title) {
         $stations[$name]=stationRequest($name);
       }
     } else {
       $stations[$station]=stationRequest($station);
     }
     $obj->action = "refresh";
     $obj->response = $stations;
     $result = json_encode($obj,JSON_UNESCAPED_UNICODE);
     return $result;
  }
}


if (!empty($_GET)){
  $action = (isset($_GET["action"]) ? $_GET["action"] : "");
  $station = (isset($_GET["station"]) ? $_GET["station"] : "");
  $username = (isset($_GET["user"]) ? $_GET["user"] : "");
  $song = (isset($_GET["song"]) ? $_GET["song"] : "");
    switch ($action) {
      case "request":
        $result = request($station);
        break;
      case "save":
        $result = save ($station,$song,$username);
        break;
      case "load":
        $result = load ($station,$username);
        break;
      case "delete":
        $result = delete ($song,$username);
        break;
      case "list":
        $obj = new stdClass;
        $obj->action = "list";
        $obj->stations = $names;
        $result = json_encode($obj,JSON_UNESCAPED_UNICODE);
        break;
      default:
        $obj = new stdClass;
        $obj->status = "error";
        $obj->error_msg = "Wrong or empty action.";
        $result = json_encode($obj,JSON_UNESCAPED_UNICODE);
        break;
    }
} else {
  $obj = new stdClass;
  $obj->status = "error";
  $obj->error_msg = "Empty request";
  $result = json_encode($obj,JSON_UNESCAPED_UNICODE);
}

if (isset($result)) {
  header('Content-Type: application/json');
  echo $result;
  sleep(1);
}
?>
