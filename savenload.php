<?php
include_once('config.php');

function save ($station,$song) {
  $file = $station.'.txt';
  // Открываем файл для получения существующего содержимого
  $current = file_get_contents($file);
  // Добавляем нового человека в файл
  $current .= $song.".\n";
  // Пишем содержимое обратно в файл
  file_put_contents($file, $current);
}

function load ($station) {
  $file = $station.'.txt';
  // Открываем файл для получения существующего содержимого
  $result = file_get_contents($file);
  return $result;
}


$station=$_GET["station"];
$action=$_GET["action"];

if (in_array($station, $list)) {
  switch ($action) {
    case "save":
        $song=$_GET["song"];
        save ($station,$song);
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
