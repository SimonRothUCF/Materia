<?php
$webpack = \Config::get('materia.urls.js_css');
$vendor = \Config::get('materia.urls.js_css').'vendor/';
$cdnjs = '//cdnjs.cloudflare.com/ajax/libs/';
$g_fonts = '//fonts.googleapis.com/';

return [

	'always_load_groups' => [
		'default' => [
			'main',
			'fonts',
		],
	],

	'groups' => [
		'admin' => [$webpack.'css/admin.css'],
		'support' => [$webpack.'css/support.css'],
		'catalog' => [$webpack.'css/widget-catalog.css'],
		'widget_play' => [
			$webpack.'css/widget-play.css',
			$vendor.'ng-modal.css'
		],
		'lti' => [$webpack.'css/util-lti-picker.css'],
		'mywidgets'  => [$webpack.'css/my-widgets.css'],
		'my_widgets' => [
			$webpack.'css/my-widgets.css',
			$cdnjs.'jqPlot/1.0.9/jquery.jqplot.min.css',
			$cdnjs.'jqueryui/1.12.1/themes/ui-lightness/jquery-ui.min.css',
			$vendor.'jquery.dataTables.min.css',
			$vendor.'ng-modal.css'
		],
		'widget_create' => [
			$webpack.'css/widget-create.css',
			$vendor.'ng-modal.css'
		],
		'widget_detail' => [
			$webpack.'css/widget-detail.css',
			$vendor.'ng-modal.css'
		],
		'widget_catalog' => [$webpack.'css/widget-catalog.css'],
		'profile' => [$webpack.'css/profile.css'],
		'login' => [$webpack.'css/login.css'],
		'scores' => [
			$cdnjs.'jqPlot/1.0.9/jquery.jqplot.min.css',
			$webpack.'css/scores.css',
		],
		'pre_embed_placeholder' => [$webpack.'css/widget-embed-placeholder.css'],
		'embed_scores' => [$webpack.'css/scores.css'],
		'question_import' => [
			$vendor.'jquery.dataTables.min.css',
			$webpack.'css/util-question-import.css',
		],
		'media_import' => [$webpack.'css/util-media-import.css'],
		'help' => [$webpack.'css/help.css'],
		'errors' => [$webpack.'css/errors.css'],
		'core' => [$webpack.'css/core.css'],
		'fonts' => [
			$g_fonts.'css?family=Kameron:700&text=0123456789%25',
			$g_fonts.'css?family=Lato:300,400,700,700italic,900&amp;v2',
		],
		'guide' => [$webpack.'css/widget-guide.css'],
	],
];
