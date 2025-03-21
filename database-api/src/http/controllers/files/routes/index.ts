import { FastifyTypedInstance } from '@/types';

import { listFiles } from '@/http/controllers/files/list-files';
import { listFile } from '@/http/controllers/files/list-file';
import { createFile } from '@/http/controllers/files/create-file';
import { updateFile } from '@/http/controllers/files/update-file';
import { deleteFile } from '@/http/controllers/files/delete-file';

export function filesRoutes(app: FastifyTypedInstance) {
	app.register(listFiles);
	app.register(listFile);
	app.register(createFile);
	app.register(updateFile);
	app.register(deleteFile);
}
