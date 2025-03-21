import { FastifyTypedInstance } from '@/types';

import { listUser } from '@/http/controllers/users/list-user';
import { addUser } from '@/http/controllers/users/add-user';
import { updateUser } from '@/http/controllers/users/update-user';
import { deleteUser } from '@/http/controllers/users/delete-user';

export function usersRoutes(app: FastifyTypedInstance) {
	app.register(listUser);
	app.register(addUser);
	app.register(updateUser);
	app.register(deleteUser);
}
