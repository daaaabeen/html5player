<?php
$url = $_REQUEST["trailfile_id"];
$fp = fopen ( $url, "r" );
$data = "";
while ( ! feof ( $fp ) ) {
	$data .= fgets ( $fp );
}
fclose ( $fp );
echo $data;