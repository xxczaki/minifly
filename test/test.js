import test from 'ava';
import execa from 'execa';
import globby from 'globby';
import del from 'del';

// Delete a directory with minified files before running tests
del('minifly');

test('help message', async t => {
	const ret = await execa.shell('node index.js --help');
	t.regex(ret.stdout, /Examples/);
});

test('outputs minified files in correct directory', async t => {
	await execa.shell('node index.js --ignore test.js').then(async () => {
		await globby(['minifly']).then(files => {
			const array = [
				'minifly/index.min.js',
				'minifly/images/example.jpg',
				'minifly/images/example.png',
				'minifly/images/example.svg',
				'minifly/test/test.min.js',
				'minifly/test/fixtures/example.min.css',
				'minifly/test/fixtures/example.min.html',
				'minifly/test/fixtures/example.min.js'
			];
			t.deepEqual(files, array);
		});
	});
});

