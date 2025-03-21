import { model, Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
	_id: string;
	discord_id: string;
	discord_name: string;
	editor_name: string;
	editor_channel_id: string;
	admin: boolean;
	editor_role: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema: Schema = new Schema<UserDocument>(
	{
		discord_id: {
			type: String,
			required: true,
			unique: true,
		},
		discord_name: {
			type: String,
			required: true,
		},
		editor_name: {
			type: String,
			required: true,
		},
		editor_channel_id: {
			type: String,
			required: false,
		},
		admin: {
			type: Boolean,
			required: true,
		},
		editor_role: {
			type: Boolean,
			required: true,
		},
	},
	{ timestamps: true, versionKey: false, collection: '_dev_users' },
);

const UserModel = model<UserDocument>('users', UserSchema);

export { UserModel };
