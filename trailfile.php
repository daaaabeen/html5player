<?php
header("Content-type: image/png");
$url = urldecode($_GET["url"]);
$fp = fopen ( $url, "r" );
$data = "";
while ( ! feof ( $fp ) ) {
	echo fgets ( $fp );
}
fclose ( $fp );