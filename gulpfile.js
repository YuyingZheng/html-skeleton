var gulp = require('gulp'),
		merge = require('merge-stream'),
		clean = require('gulp-clean'),
		newer = require('gulp-newer'),
		rename = require("gulp-rename"),
		sequence = require('gulp-sequence'),
		sourcemaps = require('gulp-sourcemaps'),
		browserSync = require('browser-sync'),
		
	 //html
	 fileinclude = require('gulp-file-include'),
	 htmlbeautify = require('gulp-html-beautify'),

	 //css
	 postcss = require('gulp-postcss'),
	 syntax = require('postcss-scss'),
	 sorting = require('postcss-sorting'),
	 bulkSass = require('gulp-sass-bulk-import'),//gulp task to allow importing directories in your SCSS
	 sass = require('gulp-sass'),
	 autoprefixer = require('gulp-autoprefixer'),
	 combineMq = require('gulp-combine-mq'), //Combine matching media queries into one media query definition
	 cssnano = require('gulp-cssnano');//Minify CSS with cssnano.

	 //icon
	 svgstore = require('gulp-svgstore'), //Combine svg files into one with <symbol> elements
	 svgmin = require('gulp-svgmin'),//Minify SVG files with gulp.
	 path = require('path'),//Node.JS path module
	 
	//image
	imagemin = require('gulp-imagemin');

	// Error handler
	function swallowError(error) {
		//if you want details of the error in the console
		console.log(error.toString())
		this.emit('end')
	}
//========================================================================================================//
//                                            Html task
//========================================================================================================//
var ViewSrc = 'src/views/**/*.shtml',
		ViewDst = 'dist/includes/',
		PageSrc = 'src/views/pages/*.sthml',
		PageDst = 'dist/';
gulp.task('html', function(callback) {
	sequence('copy-html', 'build-html')(callback)
})

gulp.task('copy-html', function() {
	 return gulp.src(ViewSrc)
						.pipe(newer(ViewDst))
						.pipe(gulp.dest(ViewDst));
});

gulp.task('build-html', function() {
	return gulp.src(PageSrc)
	           .pipe(fileinclude({
							 prefix: '@@',
							 basepath: '@file'
	}))
	.pipe(htmlbeautify({
		indent_size: 2
	}))
	.pipe(rename({
		extname: ".html"
	}))
	.pipe(gulp.dest(PageDst));
})

//========================================================================================================//
//                                            Css task
//========================================================================================================//

var CssSortingFiles = ['src/scss/**/*.scss', '!src/scss/vendors/**/*.scss','!src/scss/utils/**/*.scss'],
		CssSortingFolder = 'src/scss',
		AppCssSrc = 'src/scss/app.scss',
		AppCssDst = 'dist/css',
		AppCssDstFile = 'dist/css/app.css';
gulp.task('css', function(callback){
  sequence('css-sorting', 'scss','css-minify')(callback)
});
gulp.task('css-sorting',function() {
	return gulp.src(CssSortingFiles)
	           .pipe(postcss([
							 sorting({
								 "order": [
									 {
										"type": "at-rule",
										"name": "extend"
									 },
									 "custom-properties",
									 "dollar-variables",
									 "declarations",
									 "rules",
									 "at-rules", 
									 {
										"type": "at-rule",
										"name": "include"
										},
										{
											"type": "at-rule",
											"name": "include",
											"parameter": "media"
										}
									],
									"clean-empty-lines": true,
									"properties-order": "alphabetical",
									"unspecified-properties-position": "bottomAlphabetical"
							 })
						 ],{ parser:syntax}))
						 .pipe(gulp.dest(CssSortingFolder));
});
gulp.task('scss', function() {
	return gulp.src(AppCssSrc)
						 .pipe(bulkSass())
						 .pipe(sourcemaps.init())
						 .pipe(sass({outputStyle : 'expand'}).on('error', swallowError))
						 .pipe(autoprefixer({
							 browsers: [
								 'last 2 versions',
								 'Explorer >= 9',
								 'Android >= 4'
							 ]
						 }))
						.pipe(sourcemaps.write('/'))
				    .pipe(gulp.dest(AppCssDst));
});
gulp.task('css-minify',function() {
	return gulp.src(AppCssDstFile)
	           .pipe(combineMq({
							 beautify: false
						 }))
						 .pipe(cssnano({
							 suffix: '.min'
						 }))
						 .pipe(gulp.dest(AppCssDst))
})

//========================================================================================================//
//                                            JS task
//========================================================================================================//

var JsSrc = 'src/js/**/*.js',
		JsDst = 'dist/js';
		
gulp.task('js', function() {
	return gulp.src(JsSrc)
						 .pipe(newer(JsDst))
						 .pipe(gulp.dest(JsDst));
});
//========================================================================================================//
//                                            Fonts task
//========================================================================================================//

var FontSrc = 'src/assets/fonts/*',
FontDst = 'dist/assets/fonts/';


gulp.task('font', function() {
		return gulp.src(FontSrc)
		.pipe(newer(FontDst))
		.pipe(gulp.dest(FontDst));
});

//========================================================================================================//
//                                            Icons task
//========================================================================================================//

var IconSrc = 'src/assets/icons/*.svg',
IconDst = 'dist/assets/images/';


gulp.task('icon', function () {
		return gulp.src(IconSrc)
		.pipe(svgmin(function (file) {
			var prefix = path.basename(file.relative, path.extname(file.relative));
				return {
					plugins: [{
						cleanupIDs: {
							prefix: prefix + '-',
							minify: true
						}
					}]
				}
}))
	.pipe(rename({ prefix: 'icon-' }))
	.pipe(svgstore())
	.pipe(gulp.dest(IconDst));
});

//========================================================================================================//
//                                            Images task
//========================================================================================================//

var ImgSrc = 'src/assets/images/**/*',
ImgDst = 'dist/assets/images/',
UploadSrc = 'src/assets/uploads/**/*',
UploadDst = 'dist/assets/uploads/';


gulp.task('image', function() {
		var copyImg = gulp.src(ImgSrc)
		.pipe(newer(ImgDst))
		.pipe(imagemin())
		.pipe(gulp.dest(ImgDst));

		var copyUpload = gulp.src(UploadSrc)
		.pipe(newer(UploadDst))
		.pipe(imagemin())
		.pipe(gulp.dest(UploadDst));

		return merge(copyImg, copyUpload);
});


//========================================================================================================//
//                                            Clean task
//========================================================================================================//

var CleanFolder = ['dist/{css,includes,js,assets}/' ,'dist/*.html'];


gulp.task('clean', function() {
	return gulp.src(CleanFolder, { read: false })
  	.pipe(clean());
});

//========================================================================================================//
//                                            Clean task
//========================================================================================================//

var CleanFolder = ['dist/{css,includes,js,assets}/' ,'dist/*.html'];


gulp.task('clean', function() {
	return gulp.src(CleanFolder, { read: false })
  	.pipe(clean());
});

//========================================================================================================//
//                                            Build task
//========================================================================================================//

gulp.task('build', function(callback) {
	sequence('html', 'css', 'js', 'font', 'icon', 'image')(callback)
});

//========================================================================================================//
//                                            Server task
//========================================================================================================//
var WatchHtmlFolders = 'src/views/**/*.shtml',
		WatchCssFolders = 'src/scss/**/*.scss',
		WatchJsFolders = 'src/js/**/*.js',
		WatchFontFolders = 'src/assets/fonts/*',
		WatchIconFolders = 'src/assets/icons/*',
		WatchImageFolders = ['src/assets/images/**/*', 'src/assets/uploads/**/*'],
		serverFiles = 'dist/**/*.*';

gulp.task('server', function() {
	  browserSync.init({
			server: 'dist/',
			notify: false,
		});

		//watch html
			gulp.watch(WatchHtmlFolders, ['html']);
		 
		//watch css
		gulp.watch(WatchCssFolders, ['css']);
		
		//watch js 
		gulp.watch(WatchJsFolders, ['js']);
		
		//watch font
		gulp.watch(WatchFontFolders, ['font']);
		
		//watch icon
		gulp.watch(WatchIconFolders, ['icon']);
		
		//watch image
		gulp.watch(WatchImageFolders, ['image']);
		
		//watch dist folder 
   	gulp.watch(serverFiles).on('change', browserSync.reload); 
	
})
//========================================================================================================//
//                                            Default task
//========================================================================================================//
gulp.task('default', function(callback) {
   sequence('clean', 'build', 'server')(callback)
})