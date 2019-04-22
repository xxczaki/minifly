#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const meow = require('meow');
const ora = require('ora');
const globby = require('globby');
const upath = require('upath');
const {minify} = require('html-minifier');
const CleanCSS = require('clean-css');
const Terser = require('terser');

const cli = meow(`
    Usage
      $ minifly <options>
 
    Options
      --ignore, -i  Ignore specific files or directories
 
    Examples
      $ minifly
	  $ minifly --ignore 'index.js,dist/*.css'
`, {
	flags: {
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
			const html = await files.filter(name => path.extname(name).substr(1) === 'html');

			html.map(async file => {
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

				fs.writeFile(upath.changeExt(file, '.min.html'), output, err => {
					if (err) {
						spinner.fail('Error!\n' + err);
					}
				});
			});
		};

		const minifyCss = async () => {
			const css = await files.filter(name => path.extname(name).substr(1) === 'css');

			css.map(async file => {
				const contents = await fs.readFileSync(file, 'utf8');

				if (contents === '') {
					return;
				}

				const output = await new CleanCSS().minify(contents);

				fs.writeFile(upath.changeExt(file, '.min.css'), output.styles, err => {
					if (err) {
						spinner.fail('Error!\n' + err);
					}
				});
			});
		};

		const minifyJs = async () => {
			const js = await files.filter(name => path.extname(name).substr(1) === 'js');

			js.map(async file => {
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

				fs.writeFile(upath.changeExt(file, '.min.js'), output.code, err => {
					if (err) {
						spinner.fail('Error!\n' + err);
					}
				});
			});
		};

		Promise.all([minifyHtml(), minifyCss(), minifyJs()]).then(() => {
			spinner.succeed('Done!');
		});
	}).catch(error => {
		spinner.fail('Error!\n' + error);
	});
})();
