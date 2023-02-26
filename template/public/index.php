<!DOCTYPE html>
<html lang="en">

<head>
  <?php
  /*% for (var item in htmlWebpackPlugin.files.css) { %*/
  echo '<link href="/*%= htmlWebpackPlugin.files.css[item] %*/" type="text/css" rel="stylesheet"></link>';
  /*% } %*/
  /*% for (var item in htmlWebpackPlugin.files.js ) { %*/
  echo '<script defer src="/*%= htmlWebpackPlugin.files.js[item] %*/"></script>';
  /*% } %*/
  ?>
</head>

<body>
  <div id="root"></div>
</body>

</html>