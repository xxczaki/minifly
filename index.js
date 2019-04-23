#!/usr/bin/env node

'use strict';

const fs = require('fs');
const meow = require('meow');
const ora = require('ora');
const globby = require('globby');
const makeDir = require('make-dir');
const hasExt = require('has-ext');
const upath = require('upath');
const pAll = require('p-all');
const {minify} = require('html-minifier');
const CleanCSS = require('clean-css');
const Terser = require('terser');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');

const cli = meow(`
    Usage
      $ minifly <options>
 
		Options
			--output, -o  Output directory [default: minifly]
      --ignore, -i  Ignore specific files or directories
 
    Examples
      $ minifly
	  	$ minifly --ignore 'index.js,dist/*.css' -o dist
`, {
	flags: {
		output: {
			type: 'string',
			alias: 'o',
			default: 'minifly'
		},
		ignore: {
			type: 'string',
			alias: 'i'
		}
	}
});

(async () => {
	const spinner = ora('Minifying...').start();

	await globby(['*', '{,!(node_modules)/**/}', '!*.min.*', `!{${cli.flags.ignore}}`]).then(async files => {
		const minifyHtml = async () => {
			const html = await files.filter(name => hasExt(name, 'html'));

			await html.map(async file => {
				const contents = await fs.readFileSync(file, 'utf8');

				if (contents === '') {
					return;
				}

				const output = await minify(contents, {
					removeComments: true,
					collapseWhitespace: true,
					removeRedundantAttributes: true,
					useShortDoctype: true,
					removeEmptyAttributes: true,
					removeStyleLinkTypeAttributes: true,
					keepClosingSlash: true,
					minifyJS: true,
					minifyCSS: true,
					minifyURLs: true
				});

				const path = await `${cli.flags.output}/` + file.substring(0, file.lastIndexOf('/'));
				await makeDir(path);

				fs.writeFile(`${cli.flags.output}/${upath.changeExt(file, '.min.html')}`, output, err => {
					if (err) {
						spinner.fail('Error!\n' + err);
					}
				});
			});
		};

		const minifyCss = async () => {
			const css = await files.filter(name => hasExt(name, 'css'));

			await css.map(async file => {
				const contents = await fs.readFileSync(file, 'utf8');

				if (contents === '') {
					return;
				}

				const output = await new CleanCSS().minify(contents);

				const path = await `${cli.flags.output}/` + file.substring(0, file.lastIndexOf('/'));
				await makeDir(path);

				fs.writeFile(`${cli.flags.output}/${upath.changeExt(file, '.min.css')}`, output.styles, err => {
					if (err) {
						spinner.fail('Error!\n' + err);
					}
				});
			});
		};

		const minifyJs = async () => {
			const js = await files.filter(name => hasExt(name, 'js'));

			await js.map(async file => {
				const contents = await fs.readFileSync(file, 'utf8');

				if (contents === '') {
					return;
				}

				const output = await Terser.minify(contents, {
					warnings: false,
					compress: {
						comparisons: false
					},
					parse: {},
					mangle: true,
					output: {
						comments: false,
						/* eslint-disable camelcase */
						ascii_only: true
						/* eslint-enable camelcase */
					}
				});

				const path = await `${cli.flags.output}/` + file.substring(0, file.lastIndexOf('/'));
				await makeDir(path);

				fs.writeFile(`${cli.flags.output}/${upath.changeExt(file, '.min.js')}`, output.code, err => {
					if (err) {
						spinner.fail('Error!\n' + err);
					}
				});
			});
		};

		const minifyImages = async () => {
			const images = await files.filter(name => hasExt(name, ['jpg', 'png', 'svg']));

			await imagemin(images, `${cli.flags.output}/images`, {
				plugins: [
					imageminMozjpeg(),
					imageminPngquant(),
					imageminSvgo()
				]
			});
		};

		const actions = [
			() => minifyHtml(),
			() => minifyCss(),
			() => minifyJs(),
			() => minifyImages()
		];

		await pAll(actions, {concurrency: 4}).then(() => {
			spinner.succeed('Done!');
		});
	}).catch(error => {
		spinner.fail('Error!\n' + error);
	});
})();
