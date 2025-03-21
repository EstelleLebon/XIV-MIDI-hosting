export interface User {
	discord_id: string;
	discord_name: string;
	editor_name: string;
	editor_channel_id: string;
	admin: boolean;
	editor_role: boolean;
	createdAt: Date;
	updatedAt: Date;
}
