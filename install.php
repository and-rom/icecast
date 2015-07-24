<!DOCTYPE html>
<html>
<head>
  <title>Настройка БД для <?=basename(__DIR__)?> на <?=$_SERVER['SERVER_NAME']?></title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta charset="utf-8">
  <meta name="description" content="">
  <meta name="author" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="shortcut icon" href="">
</head>
<body>
<?php
if (!empty($_POST)) {
  if (!empty($_POST['dbhost']) & !empty($_POST['dbuser']) & !empty($_POST['dbpass']) & !empty($_POST['dbname'])) {
    $dbhost = $_POST['dbhost'];
    $dbname = $_POST['dbname'];
    $dbuser = $_POST['dbuser'];
    $dbpass = $_POST['dbpass'];

    $link = mysqli_connect($dbhost, $dbuser, $dbpass) or die("Ошибка соединения: " . mysqli_error($link));
    mysqli_set_charset($link,"utf8") or die("Ошибка: " . mysqli_error($link));
    mysqli_select_db($link,$dbname) or die("Ошибка: " . mysqli_error($link));
    echo "Соединилсь с " . mysqli_get_host_info ($link) . "<br />";
    echo "Открытие файла<br />";
    $sql = file_get_contents("./icecast.sql");
    if (!$sql) {die ("Ошибка открытия файла");}
    echo "Обработка файла <br />";
    mysqli_multi_query($link,$sql) or die("Ошибка: " . mysqli_error($link));
    mysqli_close($link);
    echo "Готово<br />";

    $file = fopen("config_db.php","w");
    $config = "<?php\n";
    $config .= '  define("DBHOST", "' . $dbhost . '");' . "\n";
    $config .= '  define("DBUSER", "' . $dbuser . '");' . "\n";
    $config .= '  define("DBPASS", "' . $dbpass . '");' . "\n";
    $config .= '  define("DBNAME", "' . $dbname . '");' . "\n";
    $config .= "?>";
    fwrite($file,$config);
    fclose($file);
    echo "<a href=./>На главную</a>";
    $ok = "ok";
  }
} 
if (empty($_POST) | !isset($ok)) {
?>
  <form id="form-setup" method="post" action="<?=$_SERVER['SCRIPT_NAME']?>">
  <fieldset>
    <legend></legend>
	<fieldset>
	  <legend>Сервер БД</legend>
	  <label for="dbhost">Логин: </label><input id="dbhost" type="text" name="dbhost"/>
	</fieldset>
	<fieldset>
	  <legend>Пользователь БД</legend>
	  <label for="dbuser">Логин: </label><input id="dbuser" type="text" name="dbuser"/><br />
	  <label for="dbpass">Пароль: </label><input id="dbpass" type="password" name="dbpass"/>
	</fieldset>
	<fieldset>
	  <legend>База данных</legend>
	  <label for="dbname">Имя БД: </label><input id="dbname" type="text" name="dbname"/>
	</fieldset>
	<input type="submit" name="submit" value="OK"/>
  </fieldset>
  </form>
<?
}
?>
</body>
</html>
