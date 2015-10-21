<?php
include_once('config.php');
?>
<!DOCTYPE html>
<html>
  <head>
    <title>Сейчас играет...</title>
    <link rel="icon" href="img/favicon.ico" type="image/x-icon"><link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" type="text/css" media="screen" href="style.css" />
    <!--<meta charset="utf-8" />-->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=0.8, maximum-scale=1.0, user-scalable=no">
    <script type="text/javascript" src="ice.js"></script>
  </head>
  <body onload="init();">
    <div id="user">
      <a href="#" id="user-btn" onclick="user();"  title="Войти или зарегистрироваться"><img src="img/user.png" /><span id="user-name"></span></a>
    </div>
    <div class="frame">
      <div id="wrapper" >
<?php
foreach ($list as $station) {
?>
      <div class="container">
        <div class="station">
          <div class="stName">
            <span><?=$names[$station]?></span>
            <a class="load" id="<?=$station?>Load" href="#"  title="Сохраненные композиции"><img src="img/stations/<?=$station?>.png" /></a>
          </div>
          <div class="songName" id="<?=$station?>songName"></div>
          <div class="spinner" id="<?=$station?>spinner">
            <img id="img-spinner" src="img/spinner.gif" alt="Loading"/>
          </div>
          </div>
          <div calss="car">
<?php
  for ($i = 0; $i < count($list); $i++) {
?>
          <span class="dot<?=($list[$i] == $station ? " dot-active" : "");?>"></span>
<?
  }
?>
          </div>
          <div class="links">
            <a class="refresh"  id="<?=$station?>Refresh" href="#" title="Обновить"></a>
            <a class="search" id="<?=$station?>Search" target="_blank" href="#" title="Поиск"></a>
            <a class="save" id="<?=$station?>Save" href="#" title="Сохранить"></a>
          </div>
        </div>
<?
}
?>
      </div>
    </div>
   <div id="control">
      <a href="#" id="left" title="Влево" onclick="moveLeft();"></a>
      <a href="#" id="right" title="Вправо" onclick="moveRight();"></a>
    </div>
    <div id="hint">
      <p>
        <strong>F4, смыхивание вверх:</strong><br />Обновить все радиостанции.<br />
        <strong>Колесо мышки, смахивание влево или вправо:</strong><br />Прокрутка радиостанций.<br />
      </p>
    </div>
  </body>
</html>
