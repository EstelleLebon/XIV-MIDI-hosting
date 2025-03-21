import fs from 'fs';
import path from 'path';

export function loadTestEnv() {
	const envPath = path.resolve(__dirname, '..', '.env.local');
	try {
		const envFileContent = fs.readFileSync(envPath, 'utf-8');
		const lines = envFileContent.split('\n');

		lines.forEach((line) => {
			if (line.trim() === '' || line.trim().startsWith('#')) return;

			const equalIndex = line.indexOf('=');

			if (equalIndex !== -1) {
				const key = line.slice(0, equalIndex).trim();
				const value = line.slice(equalIndex + 1).trim();

				if (key && value) {
					process.env[key] = value;
				}
			}
		});

		console.log('Test ENV Loaded!');
	} catch (error) {
		console.error('Erro while loading .env:', error);
	}
}
