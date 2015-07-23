<?php
include_once('config.php');
include_once('config_db.php');

$link = mysqli_connect(DBHOST, DBUSER, DBPASS) or die("Ошибка соединения: " . mysqli_error($link));
mysqli_set_charset($link,"utf8") or die("Ошибка соединения: " . mysqli_error($link));
mysqli_select_db($link,DBNAME) or die("Ошибка соединения: " . mysqli_error($link));

function save ($station,$song) {
  GLOBAL $link;
  $song = mysqli_real_escape_string($link,$song);
  $query = "INSERT INTO ".TBNAME." (station,song) VALUES ('$station','$song')";
  $result = mysqli_query($link,$query);
  $obj = new stdClass;
  $obj->action = "save";
  $obj->station = $station;
  if ($result) {
    $obj->status = "ok";
  } else {
    $obj->status = "error";
    $obj->error_msg = mysqli_error($link);
  }
  return json_encode($obj,JSON_UNESCAPED_UNICODE);
}

function load ($station) {
  GLOBAL $link;
  $query = "SELECT song FROM `songs` WHERE `station`='$station'";
  $result = mysqli_query($link,$query) or die("Query failed" . mysqli_error($link));
  header('Content-Type: text/html; charset=utf-8');
  echo "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no\"><br />\n";
  while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)) {
    echo $row['song'] . "<br />\n";
  }
  return ;
}


$station=$_GET["station"];
$action=$_GET["action"];

if (in_array($station, $list) or $station == "all") {
  switch ($action) {
    case "save":
        $song=$_GET["song"];
        $result=save ($station,$song);
        break;
    case "load":
        $result=load ($station);
        break;
    default:
        break;
}
}
else {
  $result = "Wrong station!";
}

if (isset($result)) {
  echo $result;
  sleep(1);
}
?>
