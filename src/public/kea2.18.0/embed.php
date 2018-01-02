<?php
header("Access-Control-Allow-Origin: *");
$content = file_get_contents('index.html');



$scheme = (isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) == 'on')? 'https': 'http';
$baseHref = $scheme.'://' . $_SERVER['SERVER_NAME'] . $_SERVER['SCRIPT_NAME'];
$pos = strrpos($baseHref, '/');
$baseHref = substr($baseHref, 0, $pos+1);//.'index.html';

$content = str_replace('<head>', '<head><base href="'.$baseHref.'" />', $content);


echo $content;
