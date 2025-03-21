import { FastifyTypedInstance } from '../../../../../types.ts';

import { listFiles } from '../http/controllers/files/list-files.ts';
import { listFile } from '../http/controllers/files/list-file.ts';


export function filesPublicRoutes(app: FastifyTypedInstance) {
	app.register(listFiles);
	app.register(listFile);

}
