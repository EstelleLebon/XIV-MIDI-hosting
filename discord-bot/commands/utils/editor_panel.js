const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const createLogger = require('../../logger/logger');
const logger = createLogger('editor_panel');

const { add_user, get_user, update_user } = require('../../utils/user_db_tools');
const { getfilesbyeditorid, updatefile, deletefile } = require('../../utils/file_db_tools');


const user_part = async (interaction) => {
    const id = interaction.user.id;
    let admin = 0;
    if (interaction.member.permissions.has('ADMINISTRATOR')) {
        admin = 1;
    }

    // define & check editor_role
    let editor_role = 0;
    if (interaction.member.roles.cache.some(role => role.name === 'Midi Editors')) {
        editor_role = 1;
    }

    try {
        let user = await get_user(id);
        // if user does not exist, add user to database
        if (!user) {
            await add_user(id, interaction.user.tag, interaction.user.tag, null, admin, editor_role);
            user = await get_user(id);
            logger.info(`User added to database: ${JSON.stringify(user)}`);
        } else {
            // if user exists, update user in database
            // update user.discord_name if it changed
            user.discord_name = interaction.user.tag;
            // update user.admin if it changed
            user.admin = admin;
            // update user.editor_role if it changed
            user.editor_role = editor_role;
            // push updated user to database
            await update_user(id, user);
            logger.info(`User updated: ${JSON.stringify(user)}`);
        }
        return user;
    } catch (error) {
        logger.error(`Error getting or updating user: ${error}`);
        return null;
    }
};

const files_part = async (id) => {
    try {
        const files = await getfilesbyeditorid(id);
        logger.debug(`returning ${files.length} files`);
        return files || null;
    } catch (error) {
        logger.error(`Error getting files: ${error}`);
        return null;
    }
};

const get_formated_files = (files) => {
    const data = [];
    let i = 0;
    if (files.length === 0) {
        return "0";
    }
    files.forEach(file => {
        if (i >= 10) return data;

        const id = i  + 1;
        i++;
        const filename = `${file.artist}_${file.title}_${file.performer}_${file.editor}`;
        data.push({id : id, filename: filename});
    });
    logger.debug(`data: ${JSON.stringify(data)}`);
    return data;
};

const get_files_rows = (message) => {
    const map = message.split('\n');

    const rows = [];
    const row0 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('<<')
                .setStyle(ButtonStyle.Secondary),);
    rows.push(row0);

    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();
    map.forEach(file => {
        const id = file.split(' - ')[0];
        if (id <= 5) {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(`file_${id}`)
                    .setLabel(id)
                    .setStyle(ButtonStyle.Secondary),);
        }
        if (id > 5) {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`file_${id}`)
                    .setLabel(id)
                    .setStyle(ButtonStyle.Secondary),);
        }
    });
    if (row1.components.length > 0) {
        rows.push(row1);
    }
    if (row2.components.length > 0) {
        rows.push(row2);
    }
    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('>>')
                .setStyle(ButtonStyle.Secondary),);
    rows.push(row3);
    logger.debug(`files rows: ${JSON.stringify(rows)}`);
    return rows;
};        

const get_menu_rows = (user, website_files_length, discord_files_length, editor_channel_files_length) => {
    const rows = [];
    const row0 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('edit_editor_name')
                .setLabel('Edit editor name')
                .setStyle(ButtonStyle.Success));
    if (user.editor_role === 1) {
        row0.addComponents(
            new ButtonBuilder()
                .setCustomId('edit_editor_channel')
                .setLabel('Edit editor channel')
                .setStyle(ButtonStyle.Success))
    }
    rows.push(row0);
    if (website_files_length !== "0" || discord_files_length !== "0" || editor_channel_files_length !== "0") {
        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();
        if (website_files_length !== "0") {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId('delete_website_file')
                    .setLabel('Delete website file')
                    .setStyle(ButtonStyle.Danger));
        }
        if (discord_files_length !== "0") {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId('delete_discord_file')
                    .setLabel('Delete discord file')
                    .setStyle(ButtonStyle.Danger));
        }
        if (editor_channel_files_length !== "0") {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId('delete_editor_channel_file')
                    .setLabel('Delete editor channel file')
                    .setStyle(ButtonStyle.Danger));
        }
        row2.addComponents(
            new ButtonBuilder()
                .setCustomId('totaly_delete')
                .setLabel('Delete file from all sources')
                .setStyle(ButtonStyle.Danger));

        rows.push(row1);
        rows.push(row2);
        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Exit')
                    .setLabel('Exit')
                    .setStyle(ButtonStyle.Secondary));
        rows.push(row3);
    }
    return rows;
};

const get_menu_embed = (interaction, user, files, website_files_length, discord_files_length, editor_channel_files_length) => {
    let embed = new EmbedBuilder()
            .setAuthor({
                name: "FFXIV MIDI Repository",
                iconURL: "https://th.bing.com/th/id/OIG.462uH5OW2SOk5LU87zsu?pid=ImgGn",
            })
            .setTitle('--------------------  Editor Panel  --------------------')
            .setDescription('Here you can manage your files and settings.')
            .setColor('#FFD700')
            .setTimestamp()
    embed.addFields(
        { name: ' ', value: " ", inline: false},
        { name: ' ', value: " ", inline: false},
        { name: ' ', value: " ", inline: false},
        { name: '----------------------------  User  ----------------------------', value: " ", inline: false},
        { name: 'Discord tag', value: interaction.user.tag, inline: true },
        { name: 'Editor name', value: user.editor_name, inline: true });
    if (user.editor_role === 1) {
        embed.addFields(
            { name: 'Editor channel', value: user.editor_channel_id ? user.editor_channel_id : "Not set", inline: true });
    }
    embed.addFields(
                { name: ' ', value: " ", inline: false},
                { name: ' ', value: " ", inline: false},
                { name: ' ', value: " ", inline: false},
                { name: '----------------------------  Files  ----------------------------', value: " ", inline: false },
                { name: ' ', value: " ", inline: true},
                { name: 'Total files', value: files.length.toString(), inline: true },
                { name: ' ', value: " ", inline: true},
                { name: 'Website files', value: website_files_length, inline: true },
                { name: 'Discord files', value: discord_files_length, inline: true });
    if (user.editor_role === 1) {
        embed.addFields(
                { name: 'Editor channel files', value: editor_channel_files_length, inline: true });
    }
    return embed;
};



/*module.exports = {
    data: new SlashCommandBuilder()
        .setName('editor_panel')
        .setDescription('Displays the editor panel options.')
        .setDefaultMemberPermissions(8) // Set default permissions for administrators (8 corresponds to ADMINISTRATOR)
        ,
    async execute(interaction) {
        await interaction.deferReply({ content: "Fetching user data...", ephemeral: true });
        logger.info(`User ${interaction.user.id} requested the editor panel.`);
        const id = interaction.user.id;
        // USER PART
        const user = await user_part(interaction);
        // FILES PART
        const files = await files_part(id);
        let discord_files = [];
        let website_files = [];
        let editor_channel_files = [];
        let website_files_length = "0";
        let discord_files_length = "0";
        let editor_channel_files_length = "0";
        if (files && files.length > 0) {
            discord_files = files.filter(file => file.discord === true).map(file => file.discord_file);
            website_files = files.filter(file => file.website === true).map(file => file.website_file);
            editor_channel_files = files.filter(file => file.editor_channel === true).map(file => file.editor_channel_file);
            website_files_length = website_files.length.toString();
            logger.debug(`website_files_length: ${website_files_length}`);
            discord_files_length = discord_files.length.toString();
            logger.debug(`discord_files_length: ${discord_files_length}`);
            editor_channel_files_length = editor_channel_files.length.toString();
            logger.debug(`editor_channel_files_length: ${editor_channel_files_length}`);
        }
        const embed = get_menu_embed(interaction, user, files, website_files_length, discord_files_length, editor_channel_files_length);
        const comps = get_menu_rows(user, website_files_length, discord_files_length, editor_channel_files_length);
        try {
            await interaction.deleteReply();
            await interaction.followUp({ embeds: [embed], components: comps, ephemeral: true });
        } catch (error) {
            logger.error(`Error sending follow-up message: ${error}`);
        }


        const display_files = async (files, interaction, type) => {
            const formated_files = get_formated_files(files);
            const message = formated_files.map(file => `${file.id} - [${type}] - ${file.filename}`).join('\n');
            const sendmessage = "Select button corresponding to your choice:\n" + message;
            const rows = get_files_rows(message);
            try {
                await interaction.editReply({ content: sendmessage, embeds: [], components: rows, ephemeral: true });
            } catch (error) {
                logger.error(`Error sending follow-up message: ${error}`);
            }
        };

        const filter = i => i.user.id === interaction.user.id;
        let collector = interaction.channel.createMessageComponentCollector({ filter, time: (15 * 60000) - 1000 });
        collector.on('collect', async interactionc0 => {
            try {
                await interactionc0.deferUpdate();
            } catch (error) {
                logger.warn(`Error deferring update: ${error}`);
            }
            switch (interactionc0.customId) {
                case 'Exit':
                    try {
                        await interactionc0.editReply({ components: [], ephemeral: true });
                    } catch (error) {
                        logger.error(`Error sending follow-up message: ${error}`);
                    }
                    break;
                case 'edit_editor_name':
                    try {
                        await interactionc0.editReply({ content: "Please enter your new editor name:", embeds: [], components: [], ephemeral: true });
                    } catch (error) {
                        logger.error(`Error sending follow-up message: ${error}`);
                    }
                    const filter = m => m.author.id === interactionc0.user.id;
                    const collector0 = interactionc0.channel.createMessageCollector({ filter, time: 300000 });
                    collector0.on('collect', async message => {
                        await message.delete();
                        user.editor_name = message.content;
                        await update_user(id, user);
                        collector0.stop();
                    });
                    collector0.on('end', async collected => {
                        const embed = get_menu_embed(interactionc0, user, files, website_files_length, discord_files_length, editor_channel_files_length);
                        const comps = get_menu_rows(user, website_files_length, discord_files_length, editor_channel_files_length);
                        if (collected.size === 0) {
                            collector0 = interactionc0.channel.createMessageCollector({ filter, time: 300000 });
                            try {
                                await interactionc0.editReply({ content: "Editor name not received.", embeds: [embed], components: comps, ephemeral: true });
                            } catch (error) {
                                logger.error(`Error sending follow-up message: ${error}`);
                            }
                        } else {
                            try {
                                await interactionc0.editReply({ content: "", embeds: [embed], components: comps, ephemeral: true });
                            } catch (error) {
                                logger.error(`Error sending follow-up message: ${error}`);
                            }
                        }
                    });
                    
                    break;
                case 'edit_editor_channel':
                    try {
                        await interactionc0.editReply({ content: "[How to find channel ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID)\nPlease enter your channel ID:", embeds:[], components: [], ephemeral: true });
                    } catch (error) {
                        logger.error(`Error sending follow-up message: ${error}`);
                    }
                    const filter1 = m0 => m0.author.id === interactionc0.user.id;
                    let collector1 = interactionc0.channel.createMessageCollector({ filter: filter1, time: 300000 });
                    collector1.on('collect', async message0 => {
                        try {
                            await message0.delete();
                        } catch (error) {
                            logger.warn(`Error deleting message: ${error}`);
                        }
                        const client = require('../../bot');
                        let channel = client.channels.cache.get(message0.content);
                        if (!channel) {
                            try {
                                await interactionc0.editReply({ content: "Channel not found, enter channel ID:", embeds: [], components: [], ephemeral: true });
                            } catch (error) {
                                logger.error(`Error sending follow-up message: ${error}`);
                            }
                            collector1 = interactionc0.channel.createMessageCollector({ filter: filter1, time: 300000 });
                            return;
                        }
                        const url = `https://discord.com/channels/${channel.guild.id}/${channel.id}`;
                        const comps = [];
                        const raw = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('confirm-channel')
                                    .setLabel('Confirm')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId('cancel-channel')
                                    .setLabel('Cancel')
                                    .setStyle(ButtonStyle.Danger));
                        comps.push(raw);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        try {
                            await interactionc0.editReply({ content: `Channel ID received: ${message0.content}\nClick the link below and check if this is your editor channel:\n[Channel URL](${url})`, embeds: [], components: comps, ephemeral: true });
                        } catch (error) {
                            logger.error(`Error sending follow-up message: ${error}`);
                        }
                        const filter2 = i0 => i0.user.id === interactionc0.user.id;
                        const collector2 = interactionc0.channel.createMessageComponentCollector({ filter: filter2, time: 300000 });
                        collector2.on('collect', async interaction2 => {
                            switch (interaction2.customId) {
                                case 'confirm-channel':
                                    user.editor_channel_id = message0.content;
                                    await update_user(id, user);
                                    const embed = get_menu_embed(interaction2, user, files, website_files_length, discord_files_length, editor_channel_files_length);
                                    const comps = get_menu_rows(user, website_files_length, discord_files_length, editor_channel_files_length);
                                    try {
                                        await interactionc0.editReply({ content : "", embeds: [embed], components: comps, ephemeral: true });
                                    } catch (error) {
                                        logger.error(`Error sending follow-up message: ${error}`);
                                    }
                                    collector1.stop();
                                    collector2.stop();
                                    break;
                                case 'cancel-channel':
                                    collector2.stop();
                                    collector1 = interaction2.channel.createMessageCollector({ filter: filter1, time: 300000 });
                                    try {
                                        await interactionc0.editReply({ content: "[How to find channel ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID)\nPlease enter your channel ID:", embeds:[], components: [], ephemeral: true });
                                    } catch (error) {
                                        logger.error(`Error sending follow-up message: ${error}`);
                                    }
                                    break;
                            }
                        });
                        collector2.on('end', async collected => {
                            if (collected.size === 0) {
                                try {
                                    await interactionc0.editReply({ content: "Interaction timed out.", embeds: [], components: [], ephemeral: true });
                                } catch (error) {
                                    logger.error(`Error sending follow-up message: ${error}`);
                                }
                            }
                        });
                    });
                    collector1.on('end', async collected => {
                        const embed = get_menu_embed(interactionc0, user, files, website_files_length, discord_files_length, editor_channel_files_length);
                        const comps = get_menu_rows(user, website_files_length, discord_files_length, editor_channel_files_length);
                        if (collected.size === 0) {
                            try {
                                await interactionc0.editReply({ content: "Channel ID not received.", embeds: [embed], components: comps, ephemeral: true });
                            } catch (error) {
                                logger.error(`Error sending follow-up message: ${error}`);
                            }
                        } else {
                            await update_user(id, user);
                            try {
                                await interactionc0.editReply({ content: "", embeds: [embed], components: comps, ephemeral: true });
                            } catch (error) {
                                logger.error(`Error sending follow-up message: ${error}`);
                            }
                        }
                    });
                    break; 
                case 'delete_website_file':
                    await display_files(website_files, interactionc0, "Website");
                    break;
                case 'delete_discord_file':
                    await display_files(discord_files, interactionc0, "Discord");
                    break;
                case 'delete_editor_channel_file':
                    await display_files(editor_channel_files, interactionc0, "Editor Channel");
                    break;       
                case 'totaly_delete':
                    await display_files(files, interactionc0, "All");
                    break;       
            }
        });
        collector.on('end', async collected => {
            if (collected.size === 0) {
                try {
                    await interaction.editReply({ components: [], ephemeral: true });
                    await interaction.followUp({ content: "Interaction timed out.", ephemeral: true });
                } catch (error) {
                    logger.error(`Error sending follow-up message: ${error}`);
                }
            }        
        });
    },    
};
*/