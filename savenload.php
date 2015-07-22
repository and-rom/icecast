<?php
include_once('config.php');
include_once('config_db.php');

mysql_connect(DBHOST, DBUSER, DBPASS) or die("Ошибка соединения: " . mysql_error());
mysql_set_charset("utf8") or die("Ошибка соединения: " . mysql_error());
mysql_select_db(DBNAME) or die("Ошибка соединения: " . mysql_error());

function save ($station,$song) {
  $result = mysql_query("INSERT INTO ".TBNAME." (station,song)
                               VALUES ('$station','" . mysql_real_escape_string($song) . "')");
  $obj = new stdClass;
  $obj->action = "save";
  $obj->station = $station;
  if ($result) {
    $obj->status = "ok";
  } else {
    $obj->status = "error";
    $obj->error_msg = mysql_error();
  }
  return json_encode($obj,JSON_UNESCAPED_UNICODE);
}

function load ($station) {
  if ($station == "all") {
  $query = "SELECT station,song FROM songs ORDER BY station ASC, id ASC";
  } else {
  $query = "SELECT station,song FROM `songs` WHERE `station`='$station'";
  }
  $result = mysql_query($query) or die("Query failed" . mysql_error());
  $songs = array();
  $obj = new stdClass;
  $obj->action = "load";
  $obj->stations = array();
  while($row = mysql_fetch_array($result,MYSQL_ASSOC)) {
    $obj->stations[][$row['station']][] = $row['song'];
    //$songs[$row['station']][]= $row['song'];
  }

//  for ()
 // $obj->station = $station;
 // $obj->stations = $songs;
  return json_encode($obj,JSON_UNESCAPED_UNICODE);
//  return $obj;
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
