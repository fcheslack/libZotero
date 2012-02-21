<?php

$libraryType = 'group'; //user or group
$libraryID = 65557;
$librarySlug = 'SOPA-PIPA';
$apiKey = '';

$reportCollectionKey = '';
$baseUrl = '/libZotero/phpexamples/zreports';

$libraryCacheType = 'file';//file or apc
$librarySaveFilePath = './_librarycache';
$headerTemplateFilePath = './postTemplates/reportHeader.phtml';
$postTemplateFilePath = './postTemplates/reportPost.phtml';
$footerTemplateFilePath = './postTemplates/reportFooter.phtml';
$ttl = 18000;
