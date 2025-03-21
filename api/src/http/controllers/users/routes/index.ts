import { FastifyTypedInstance } from '../../../../types.ts';

import { listUser } from '../list-user.ts';
import { addUser } from '../add-user.ts';
import { updateUser } from '../update-user.ts';
import { deleteUser } from '../delete-user.ts';

export function usersPrivateRoutes(app: FastifyTypedInstance) {
	app.register(listUser);
	app.register(addUser);
	app.register(updateUser);
	app.register(deleteUser);
}
