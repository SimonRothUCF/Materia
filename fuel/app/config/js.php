<?php
$webpack = \Config::get('materia.urls.js_css');
$vendor = \Config::get('materia.urls.js_css').'vendor/';
$cdnjs = '//cdnjs.cloudflare.com/ajax/libs/';

return [
	'groups' => [
		'admin'      => [$webpack.'js/admin.js'],
		'support'    => [$webpack.'js/support.js'],
		'author'     => [$webpack.'js/author.js'],
		'student'    => [$webpack.'js/student.js'],
		'materia'    => [$webpack.'js/materia.js'],
		'homepage'   => [$webpack.'js/homepage.js'],
		'catalog'    => [$webpack.'js/catalog.js'],
		'mywidgets'  => [$webpack.'js/my-widgets.js'],

		'angular'    => [$vendor.'angular.min.js'],
		'ng-animate' => [$vendor.'angular-animate.min.js'],
		'jquery'     => [$vendor.'jquery.min.js'],
		'dataTables' => [$vendor.'jquery.dataTables.min.js'],
		'labjs'      => [$vendor.'LAB.min.js'],
		'hammerjs'   => [$vendor.'hammer.min.js'],
		'swfobject'  => [$vendor.'swfobject.js'],

		'react'      => [
			'//unpkg.com/react@16.13.1/umd/react.development.js',
			'//unpkg.com/react-dom@16.13.1/umd/react-dom.development.js'
		],
		'my_widgets' => [$cdnjs.'jqueryui/1.12.1/jquery-ui.min.js'],
		'jqplot'     => [
			$cdnjs.'jqPlot/1.0.9/jquery.jqplot.min.js',
			$cdnjs.'jqPlot/1.0.9/plugins/jqplot.barRenderer.min.js',
			$cdnjs.'jqPlot/1.0.9/plugins/jqplot.canvasTextRenderer.min.js',
			$cdnjs.'jqPlot/1.0.9/plugins/jqplot.canvasAxisTickRenderer.min.js',
			$cdnjs.'jqPlot/1.0.9/plugins/jqplot.categoryAxisRenderer.min.js',
			$cdnjs.'jqPlot/1.0.9/plugins/jqplot.cursor.min.js',
			$cdnjs.'jqPlot/1.0.9/plugins/jqplot.highlighter.min.js',
		]
	]
];
