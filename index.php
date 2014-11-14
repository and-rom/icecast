<?php
include_once('config.php');
?>
<!DOCTYPE html>
<html>
  <head>
    <title>Songs Name</title>
    <link rel="icon" href="img/favicon.ico" type="image/x-icon"><link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" type="text/css" media="screen" href="style.css" />
    <meta charset="utf-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script type="text/javascript" src="ice.js"></script>
  </head>
  <body onload="init();">
    <div class="frame">
      <div id="wrapper" >
<?php
foreach ($list as $station) {
?>
      <div class="container">
        <div class="station">
          <div class="stName">
            <span><?=$names[$station]?></span>
            <img src="img/stations/<?=$station?>.png" />
          </div>
          <div class="songName" id="<?=$station?>songName"></div>
          <div class="spinner" id="<?=$station?>spinner">
            <img id="img-spinner" src="spinner.gif" alt="Loading"/>
          </div>
          </div>
          <div class="links">
            <a class="refresh"  id="<?=$station?>Refresh" href="#"></a>
            <a class="search" id="<?=$station?>Search" target="_blank" href="#"></a>
            <a class="save" id="<?=$station?>Save" href="#"></a>
          </div>
        </div>
<?
}
?>
      </div>
    </div>
    <div id="control">
      <a href="#" id="left" onclick="moveLeft();"></a>
      <a href="#" id="right" onclick="moveRight();"></a>
    </div>
    <div id="hint">
      <p>
        <strong>F4:</strong> Refresh all stations.<br \>
        <strong>Mouse wheel:</strong> Scroll stations.
      </p>
    </div>
  </body>
</html>
