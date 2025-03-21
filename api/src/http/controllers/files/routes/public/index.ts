import { FastifyTypedInstance } from '../../../../../types.ts';

import { listFiles } from '../../list-files.ts';
import { listFile } from '../../list-file.ts';


export function filesPublicRoutes(app: FastifyTypedInstance) {
	app.register(listFiles);
	app.register(listFile);

}
