import test from 'ava';
import execa from 'execa';
import globby from 'globby';
import del from 'del';

// Delete a directory with minified files before running tests
del('minifly');

test('help message', async t => {
	const ret = await execa('./index.js', ['--help']);
	t.regex(ret.stdout, /Examples/);
});

test('outputs minified files in correct directory', async t => {
	process.chdir('./test/fixtures');
	await execa('../../index.js').then(async () => {
		await globby(['minifly']).then(files => {
			const array = [
				'minifly/example.min.css',
				'minifly/example.min.html',
				'minifly/example.min.js',
				'minifly/images/example.gif',
				'minifly/images/example.jpg',
				'minifly/images/example.png',
				'minifly/images/example.svg'
			];

			t.deepEqual(files, array);
		});
	});
});

