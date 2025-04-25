import { FastifyTypedInstance } from '../../../../../types.ts';

import { listFilesPublic } from '../../list-files-public.ts';


export function filesPublicRoutes(app: FastifyTypedInstance) {
	app.register(listFilesPublic);
}
