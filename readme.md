# Minifly 🗜️

> Minify different types of files easily

[![Build Status](https://travis-ci.org/xxczaki/minifly.svg?branch=master)](https://travis-ci.org/xxczaki/minifly) 
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

# Highlights

- Zero-config
- Fast and easy to use
- Uses async/await
- Minifies files concurrently
- Supports [multiple file types](#supported-files)

# Install

```bash
npm install --global minifly
```
You can also use `npx`:
```bash
npx minifly
```

# Usage

```bash
	Usage
		$ minifly <options>
 
	Options
		--output, -o  			Output directory (Default: minifly)
		--ignore, -i  			Ignore specific files or directories
		--minExt, -m			File extensions of minified files (Default: .min)
		--concurrency, -c		Max number of minifiers running at the same time (Default: CPU cores)
 
	Examples
    	$ minifly
	  	$ minifly -i 'index.js,dist/*.css' -o dist
		$ minifly -m ''
```

## Supported files

|      Type     |   Minifier    |
| ------------- | ------------- |
| HTML (*.html) | [html-minifier](https://github.com/kangax/html-minifier)  |
| CSS (*.css)   | [clean-css](https://github.com/jakubpawlowicz/clean-css)  |
| JavaScript (*.js)   | [terser](https://github.com/terser-js/terser)  |
| JPG (*.jpg)   | [imagemin-mozjpeg](https://github.com/imagemin/imagemin-mozjpeg)  |
| PNG (*.png)   | [imagemin-pngquant](https://github.com/imagemin/imagemin-pngquant)  |
| GIF (*.gif)   | [imagemin-gifsicle](https://github.com/imagemin/imagemin-gifsicle)  |
| SVG (*.svg)   | [imagemin-svgo](https://github.com/imagemin/imagemin-svgo)  |

More file types will be supported soon :unicorn:

## License

MIT
