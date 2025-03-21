import { FastifyTypedInstance } from '../../../../../types.ts';

import { listFiles } from '../../list-files.ts';
import { listFile } from '../../list-file.ts';
import { createFile } from '../../create-file.ts';
import { updateFile } from '../../update-file.ts';
import { deleteFile } from '../../delete-file.ts';

export function filesPrivateRoutes(app: FastifyTypedInstance) {
	app.register(listFiles);
	app.register(listFile);
	app.register(createFile);
	app.register(updateFile);
	app.register(deleteFile);
}
