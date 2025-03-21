import { FastifyTypedInstance } from '../../../../../types.ts';

import { listFiles } from '../http/controllers/files/list-files.ts';
import { listFile } from '../http/controllers/files/list-file.ts';
import { createFile } from '../http/controllers/files/create-file.ts';
import { updateFile } from '../http/controllers/files/update-file.ts';
import { deleteFile } from '../http/controllers/files/delete-file.ts';

export function filesPrivateRoutes(app: FastifyTypedInstance) {
	app.register(listFiles);
	app.register(listFile);
	app.register(createFile);
	app.register(updateFile);
	app.register(deleteFile);
}
