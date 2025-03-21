const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const createLogger = require('../../logger/logger');
const logger = createLogger('upload-editor-Command');
const { add_user, get_user, update_user } = require('../../utils/user_db_tools');
const crypto = require('crypto');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const push_website = require('./upload_modules/website');
const push_discord = require('./upload_modules/discord');
const push_editor_channel = require('./upload_modules/editor_channel');
const checkMidi = require('./upload_modules/file_checks');
const { midi_file } = require('./upload_modules/midi_file');
const editor_channel_id = require('./upload_modules/editor_channel_id');
const website_url = process.env.websiteurl
const statusDb = require('../../utils/status_db');
const { sendAlert } = require('../../utils/alert');

const handleEditorChannelId = async (interaction, user, editor_channel_push) => {
    if (editor_channel_push === true && user.editor_channel_id == null) {
        try {
            logger.info(`Editor Channel ID not set for ${interaction.user.tag} / ${interaction.user.id}`);
            const channelid = editor_channel_id(interaction);
            logger.debug(`Editor Channel ID: ${channelid}`);
            if (channelid == null) {
                logger.error(`Error setting editor channel ID: ${channelid}`);
                return 0;
            }
            user.editor_channel_id = channelid;
            logger.debug(`User editor channel ID set to: ${channelid}`);

            // update user in database
            await update_user(user);
            logger.info(`Editor channel ID set for ${interaction.user.tag} / ${interaction.user.id}`);
            return 1;
        } catch (error) {
            logger.error(`Error setting editor channel ID: ${error}`);
            return 0;
        }
        
    } else {
        return 2;
    }
};
const loadstring = [".", "..", "..."];
const loading = async (embed, interaction) => {
    if (!interaction) return;
    if (typeof interaction !== 'object' || interaction === null) return;
    embed.updateEmbedField("status:", `Uploading to database${loadstring[0]}`);
    loadstring.push(loadstring.shift());
    await interaction.editReply({ embeds: [embed], ephemeral: true });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(0x0000001000000000)
        .setName('upload-editor')
        .setDescription("Upload MIDI files.")
        .addAttachmentOption(option => option
            .setName('midi')
            .setDescription('[required] .mid file to upload.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('band-size')
            .setDescription('[required] Number of performers / tracks.')
            .setRequired(true)
            .addChoices(
                {name: 'solo', value: 'Solo'},
                {name: 'duet', value: 'Duet'},
                {name: 'trio', value: 'Trio'},
                {name: 'quartet', value: 'Quartet'},
                {name: 'quintet', value: 'Quintet'},
                {name: 'sextet', value: 'Sextet'},
                {name: 'septet', value: 'Septet'},
                {name: 'octet', value: 'Octet'},
            )
        )
        .addStringOption(option => option
            .setName('artist')
            .setDescription('[required] Artist of the song.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('title')
            .setDescription('[required] Title of the song.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('push-options')
            .setDescription('[required] Where to push the file.')
            .setRequired(true)
            .addChoices(
                {name: 'Public Discord (Solo-Octet channel)', value: 'discord'},
                {name: 'Editor Discord (Your own personal editor channel)', value: 'editor channel'},
                {name: 'Website (xivmidi.com)', value: 'website'},
                {name: 'Website & Public Discord', value: 'website + discord'},
                {name: 'Website & Editor channel', value: 'website + editor channel'},
                {name: 'Public Discord & Editor channel', value: 'discord + editor channel'},
                {name: 'All Options (Website & Public Discord & Editor Discord)', value: 'website + discord + editor channel'}
            )
        )
        .addStringOption(option => option
            .setName('editor-name')
            .setDescription('[optional] Enter your desired editor name (will be saved as default for future uploads).')
            .setRequired(false)
        )
        /*.addStringOption(option => option
            .setName('tags')
            .setDescription('[optional] Separate tags with commas.')
            .setRequired(false)
        )*/
        .addStringOption(option => option
            .setName('source')
            .setDescription('[optional] Source of the MIDI file.')
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName('comment')
            .setDescription('[optional] Any additional information.')
            .setRequired(false)
        )
        
        ,

    async execute(interaction) {
        await interaction.deferReply({ content: "Processing your upload...", ephemeral: true });
        logger.info(`Upload command executed by ${interaction.user.tag} / ${interaction.user.id}`);

        // Check if the database is up
        logger.info(`Fetching DB status...`);
        const dbStatus = await statusDb();
        logger.debug(`DB status: ${dbStatus}`);
        if (dbStatus !== 200) {
            logger.warn(`Database is down.`);
            try {
                sendAlert('The database is currently down!');
                logger.debug(`Sending message: The database is currently down. Please try again later.`);
                return interaction.editReply({ content: 'The database is currently down. Please try again later.', ephemeral: true });
            } catch (error) {
                logger.error(`Error sending message: ${error}`);
                return;
            }
        }

        // function to sanitize string
        function sanitizeString(str) {
            return str.replace(/[^a-zA-Z0-9 ]/g, '');
        }

        // USER PART
        // define user_discord_id in id:
        const id = interaction.user.id;
        logger.debug(`User ID: ${id}`);

        // define & check admin
        var admin = 0;
        var editor_role = 0;
        if (interaction.member) {
            // define & check admin
            try {
                if (interaction.member.permissions.has('ADMINISTRATOR')) {
                    logger.debug(`User has admin permissions`);
                    admin = 1;
                }
            } catch (error) {
                logger.debug(`User does not have admin permissions`);
                admin = 0;
            }
            // define & check editor_role
            if (interaction.member.roles) {
                logger.debug(`Roles exist`);
                if (interaction.member.roles.cache.some(role => role.name === 'Midi Editors')) {
                    logger.debug(`User has editor role`);
                    editor_role = 1;
                } else {
                    logger.debug(`User does not have editor role`);
                    editor_role = 0;
                }
            }
        }
        logger.debug(`Admin: ${admin}`);
        logger.debug(`Editor Role: ${editor_role}`);

        // define editor_name
        let editor_name = interaction.options.getString('editor-name');
        const editor_name2 = interaction.user.tag
        if (editor_name) {
            editor_name = sanitizeString(editor_name);
        }
        logger.debug(`Editor Name: ${editor_name}`);
        logger.debug(`Editor Name2: ${editor_name2}`);
        let tmpeditorname = editor_name ? editor_name : editor_name2;
        // get user from database
        await get_user(id).then(async (user) => {
            // if user does not exist, add user to database
            if (!user) {await add_user(id, interaction.user.tag, editor_name ? editor_name : editor_name2, null, admin, editor_role);}
            // if user exists, update user in database
            else {
                logger.debug(`User found: ${user.discord_id}`);
                // update user.discord_name if it changed
                user.discord_name = interaction.user.tag;
                // update user.editor_name if it changed
                if (editor_name) {
                    if (editor_name !== user.editor_name && editor_name !== '') {
                        user.editor_name = editor_name;
                    }
                } 
                tmpeditorname = user.editor_name;
                // update user.admin if it changed
                user.admin = admin;
                // update user.editor_role if it changed
                user.editor_role = editor_role;
                // push updated user to database
                await update_user(user);
                logger.info(`User updated: ${JSON.stringify(user)}`);
            }
        }).catch((error) => {
            logger.error(`Error getting user: ${error}`);
        });

        // FILE PART
        // define file object
        const file = {id: null,
            md5: null,
            editor_discord_id: null,
            editor: null,
            artist: null,
            title: null,
            performer: null,
            sources: null,
            comments: null,
            tags: [],
            song_duration: null,
            tracks: null,
            discord: null,
            website: null,
            editor_channel: null,
            discord_message_id: null,
            discord_link: null,
            website_file_path: null,
            website_link: null,
            editor_channel_id: null,
            editor_channel_link: null
        };
        await get_user(id).then((user) => {
            logger.debug(`User found: ${user.discord_id}`);
            file.editor = user.editor_name;
            logger.debug(`Editor: ${file.editor}`);
            file.editor_discord_id = user.discord_id;
            logger.debug(`Editor Discord ID: ${file.editor_discord_id}`);
        }).catch((error) => {
            logger.error(`Error getting user: ${error}`);
        });
        // get midi file into cache
        const midi = interaction.options.getAttachment('midi');
        const response = await fetch(midi.url);
        const midiBuffer = await response.arrayBuffer();
        const midiCache = Buffer.from(midiBuffer);

        // check if midi file is valid
        const midiCheck = await checkMidi(midiCache);
        if (!midiCheck) {
            delete midiCache;
            try {
                return interaction.editReply({ content: 'Invalid MIDI file.', ephemeral: true });
            } catch (error) {
                logger.error(`Error sending message: ${error}`);
                return;
            }
        }
        // check tracks
        const tracks = midi_file(midiCache);
        file.tracks = tracks;

        /* Tags
        const tags = interaction.options.getString('tags');
        if (tags) {
            file.tags = tags.split(',').map(tag => tag.trim());
        }*/

        // create md5 hash from midi file
        const hash = crypto.createHash('md5');
        hash.update(midiCache);
        const md5 = hash.digest('hex');
        logger.debug(`MD5 hash: ${md5}`);
        file.md5 = md5;

        // define artist
        const artist = interaction.options.getString('artist');
        file.artist = artist;

        // define title
        const title = interaction.options.getString('title');
        file.title = title;

        // define track number
        const track_number = interaction.options.getString('band-size');
        file.performer = track_number;


        // define source
        let source = interaction.options.getString('source');
        if (source === ' ' || source === '') {
            source = null;
        }
        if (source) {
            file.sources = source;
        }        

        // define comment
        let comment = interaction.options.getString('comment');
        if (comment === ' ' || comment === '') {
            comment = null;
        }
        if (comment) {
            file.comments = comment;
        }

        // check if artist and title are at least 2 characters long
        if (file.artist.length < 2 || file.title.length < 2) {
            if (artist.length < 2) {
                try {
                    return interaction.editReply({ content: `Artist must contain at least 2 characters.\n Received: ${file.artist}`, ephemeral: true });
                } catch (error) {
                    logger.error(`Error sending message: ${error}`);
                    return;
                }
            }
            if (title.length < 2) {
                try {
                    return interaction.editReply({ content: `Title must contain at least 2 characters.\n Received: ${file.title}`, ephemeral: true });
                } catch (error) {
                    logger.error(`Error sending message: ${error}`);
                    return;
                }
            }
        }

        // define filename
        const filename = `${sanitizeString(artist)} - ${sanitizeString(title)} - ${track_number} - ${tmpeditorname}`;
        logger.debug(`Filename: ${filename}`);

        // define pushes
        const pushes = interaction.options.getString('push-options');
        let discord_push = pushes.includes('discord');
        let website_push = pushes.includes('website');
        let editor_channel_push = pushes.includes('editor channel');
        logger.debug(`Pushes: ${pushes}`);
        logger.debug(`Discord push: ${discord_push}`);
        logger.debug(`Website push: ${website_push}`);
        logger.debug(`Editor channel push: ${editor_channel_push}`);

        // md5 check
        const md5status = {
            globalstatus : true,
            discordstatus : true,
            websitestatus : true,
            editorchannelstatus : true,
            newfile : true,
            editdiscord : false,
            editwebsite : false,
            editeditorchannel : false
        }
        const { handle_md5_result } = require('./upload_modules/md5');
        await handle_md5_result(md5, md5status)
        .then( async (md5status) => {
            logger.debug(`MD5 status: ${JSON.stringify(md5status, null, 2)}`);
            if (md5status.globalstatus == false) {
                discord_push = false;
                website_push = false;
                editor_channel_push = false;
            }
            if (md5status.discordstatus == false) {
                if (website_push) {
                    md5status.editwebsite = true;
                }
                if (editor_channel_push) {
                    md5status.editeditorchannel = true;
                }
            }
            if (md5status.websitestatus == false) {
                if (discord_push) {
                    md5status.editdiscord = true;
                }
                if (editor_channel_push) {
                    md5status.editeditorchannel = true;
                }
            }
            if (md5status.editorchannelstatus == false) {
                if (discord_push) {
                    md5status.editdiscord = true;
                }
                if (website_push) {
                    md5status.editwebsite = true;
                }
            }


            if (md5status.discordstatus == false) {
                discord_push = false;
            }
            if (md5status.websitestatus == false) {
                website_push = false;
            }
            if (md5status.editorchannelstatus == false) {
                editor_channel_push = false;
            }
            logger.debug(`MD5 status: ${JSON.stringify(md5status, null, 2)}`);

            // check if editor channel ID is set
            await get_user(id).then(async (user) => {
                logger.debug(`User found: ${user}`);
                const result = await handleEditorChannelId(interaction, user, editor_channel_push);
                logger.debug(`result: ${result}`);
                if (result == 0) {
                    logger.debug(`Editor Channel ID not set.`);
                    return interaction.editReply('Your editor channel ID has not been found. Please contact an admin if you have your own editor channel.'); // Sortir de la fonction si la condition est vraie
                } else {
                    logger.debug(`Editor Channel ID set.`);
                    // Le reste du code ici ne s'exécutera pas si la condition est vraie
                    logger.debug(`Discord push: ${discord_push}`);
                    logger.debug(`Website push: ${website_push}`);
                    logger.debug(`Editor channel push: ${editor_channel_push}`);
                    if (discord_push) {
                        file.discord_message_id = "Enabled";
                    } else {
                        if (md5status.discordstatus == false) {
                            file.discord_message_id = "Already Exists";
                        } else {
                            file.discord_message_id = "Disabled";
                        }
                    }
                    if (website_push) {
                        file.website_file_path = "Enabled";
                    } else {
                        if (md5status.websitestatus == false) {
                            file.website_file_path = "Already Exists";
                        } else {
                            file.website_file_path = "Disabled";
                        }
                    }
                    if (editor_channel_push) {
                        file.editor_channel_id = "Enabled";
                    } else {
                        if (md5status.editorchannelstatus == false) {
                            file.editor_channel_id = "Already Exists";
                        } else {
                            file.editor_channel_id = "Disabled";
                        }
                    }
                    
                    if (!file.comments) {
                        file.comments = " ";
                    }
                    if (!file.sources) {
                        file.sources = " ";
                    }
                    
                    let trackInstruments = "";
                    if (file.tracks && file.tracks.length > 0) {
                        trackInstruments = file.tracks
                            .map(track => track.instrument || 'Unknown')
                            .filter(instrument => instrument !== 'Unknown')
                            .join(', ');
                        if (trackInstruments === "") {
                            trackInstruments = " ";
                        }
                    } else {
                        trackInstruments = " ";
                    }

                    /*let embedtags = "";
                    if (file.tags && file.tags != []) {
                        embedtags = file.tags.join(', ');
                    } else {
                        embedtags = " ";
                    }*/

                    let embed = new EmbedBuilder()
                    .setAuthor({
                        name: "XIVMIDI",
                        iconURL: "https://th.bing.com/th/id/OIG.462uH5OW2SOk5LU87zsu?pid=ImgGn",
                    })
                    .setTitle("MIDI upload Preview")
                    .setDescription("Here is a preview of your upload:")
                    .addFields(
                        {name: "Filename:",value: filename || "N/A",inline: false},
                        {name: "Artist:",value: file.artist || "N/A",inline: true},
                        {name: "Title:",value: file.title || "N/A",inline: false},
                        {name: "Editor Name:",value: file.editor || "N/A",inline: false},
                        {name: "Band Size:",value: file.performer || "N/A",inline: false},
                        // {name: "Tags:",value: embedtags || "N/A",inline: false},
                        {name: "Instruments:",value: trackInstruments || "N/A",inline: false},
                        {name: "Comments:",value: file.comments || "N/A",inline: false},
                        {name: "Source:",value: file.sources || "N/A",inline: false},
                        {name: "Discord Push:",value: file.discord_message_id || "N/A",inline: true},
                        {name: "Website Push:",value: file.website_file_path || "N/A",inline: true},
                        {name: "Editor Channel Push:",value: file.editor_channel_id || "N/A",inline: true},)

                    .setColor("#001df5")
                    .setTimestamp();
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirm')
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('cancel')
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Danger)
                        );

                    if (md5status.globalstatus == false) {
                        embed.addFields({name: "status:",value: "File already exists in all upload channels!",inline: false})
                        try {
                            return interaction.editReply({ embeds: [embed], components: [] });
                        } catch (error) {
                            logger.error(`Error sending message: ${error}`);
                        }
                    }
                    else if (md5status.discordstatus == false) {
                        if (md5status.editwebsite == false) {
                            if (md5status.editeditorchannel == false) {
                                embed.addFields({name: "status:",value: "File already exists in discord!",inline: false})
                                try {
                                    await interaction.editReply({ embeds: [embed], components: [] });
                                } catch (error) {
                                    logger.error(`Error sending message: ${error}`);
                                }
                            }
                        }
                    }
                    else if (md5status.websitestatus == false) {
                        if (md5status.editdiscord == false) {
                            if (md5status.editeditorchannel == false) {
                                embed.addFields({name: "status:",value: "File already exists on website!",inline: false})
                                try {
                                    await interaction.editReply({ embeds: [embed], components: [] });   
                                } catch (error) {
                                    logger.error(`Error sending message: ${error}`);
                                }
                            }
                        }
                    }
                    else if (md5status.editorchannelstatus == false) {
                        if (md5status.editdiscord == false) {
                            if (md5status.editwebsite == false) {
                                embed.addFields({name: "status:",value: "File already exists in editor channel!",inline: false})
                                try {
                                    await interaction.editReply({ embeds: [embed], components: [] });
                                } catch (error) {
                                    logger.error(`Error sending message: ${error}`);
                                }
                            }
                        }
                    }
                    if (md5status.globalstatus == true) {
                        
                        let time = 600;
                        embed.addFields({name: " ",value: `TimeOut: ${Math.floor(time / 60)}m ${(time % 60)}s`,inline: false})
                        var msg = null;
                        try {
                            msg = await interaction.editReply({ embeds: [embed], components: [row] });
                        } catch (error) {
                            logger.error(`Error sending message: ${error}`);
                        }
                        if (editor_name == null || source == null || comment == null) {
                            try {
                                await interaction.followUp({ content: 'Please note the additional options such as Source, Comment, and Editor Name are still available.', ephemeral: true });
                            } catch (error) {
                                logger.error(`Error sending message: ${error}`);
                            }
                        }
                        const filter = i => (i.customId === 'confirm' || i.customId === 'cancel') && i.user.id === interaction.user.id && i.message.id === msg?.id;                 
                        const collector = interaction.channel.createMessageComponentCollector({ filter, time: (time * 1000) });
                        const inter = interaction;
                        embed.updateEmbedField = (name, value) => {
                            const field = embed.data.fields.find(f => f.name.toLowerCase() === name.toLowerCase());
                            if (field) {
                                field.value = value;
                            }
                        };
                        const timer = async(embed) => {
                            time -= 1;
                            if (time <= 0) {
                                return
                            }
                            if (time <= 15) {
                                embed.updateEmbedField(" ", `TimeOut: **${time}s**`);
                                try {
                                    await inter.editReply({ embeds: [embed], components: [row] });
                                    return;
                                } catch (error) {
                                    logger.error(`Error updating embed: ${error.message}`);
                                    return;
                                }
                            }
                            if (time % 5 == 0) {
                                if (time >= 60) {
                                    embed.updateEmbedField(" ", `TimeOut: ${Math.floor(time / 60)}m ${(time % 60)}s`);
                                } else {
                                    embed.updateEmbedField(" ", `TimeOut: ${time}s`);
                                }
                                try {
                                    await inter.editReply({ embeds: [embed], components: [row] });
                                } catch (error) {
                                    logger.error(`Error updating embed: ${error.message}`);
                                }
                            }
                        }
                        const interval0 = setInterval(async () => {
                            await timer(embed, inter);
                        }, 1000);
                        

                        collector.on('collect', async (interaction) => {
                            clearInterval(interval0);
                            try {
                                await interaction.deferUpdate();   
                            } catch (error) {
                                logger.warn(`Interaction error: ${error}`);
                            }   
                            
                            // Check if the database is up
                            logger.info(`Fetching DB status...`);
                            const dbStatus = await statusDb();
                            logger.debug(`DB status: ${dbStatus}`);
                            if (dbStatus !== 200) {
                                logger.warn(`Database is down.`);
                                try {
                                    await sendAlert('The database is currently down!');
                                    logger.debug(`Sending message: The database is currently down. Please try again later.`);
                                    return inter.editReply({ content: 'The database is currently down. Please try again later.', ephemeral: true, embeds: [], components: [] });
                                } catch (error) {
                                    logger.error(`Error sending message: ${error}`);
                                    return;
                                }
                            }

                            embed.spliceFields(11, 1);
                            embed.setTitle("MIDI upload Status")
                            embed.setDescription("Here is a status of your upload:")
                            logger.debug(`Interaction: ${interaction.customId}`);
                            if (interaction.customId === 'confirm') {
                                embed.updateEmbedField('discord push:', discord_push ? 'Preparing upload...' : 'Disabled');
                                embed.updateEmbedField('website push:', website_push ? 'Preparing upload...' : 'Disabled');
                                embed.updateEmbedField('editor channel push:', editor_channel_push ? 'Preparing upload...' : 'Disabled');
                                embed.addFields({name: "status:",value: "Uploading to database...",inline: false})
                                try {
                                    await inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                } catch (error) {
                                    logger.error(`Error sending message: ${error}`);
                                }
                                const interval = setInterval(async () => {
                                    try {
                                        await loading(embed, inter);
                                    } catch (error) {
                                        logger.error(`Error editing embed - loading: ${error}`);
                                        clearInterval(interval);
                                    }
                                }, 666);
                                const pushfile = { md5: file.md5 };
                                pushfile.md5 = file.md5;
                                pushfile.editor_discord_id = file.editor_discord_id;
                                pushfile.editor = tmpeditorname;
                                pushfile.artist = file.artist;
                                pushfile.title = file.title;
                                pushfile.performer = file.performer;
                                pushfile.sources = file.sources;
                                pushfile.comments = file.comments;
                                pushfile.tags = file.tags;
                                pushfile.song_duration = 0;
                                pushfile.tracks = file.tracks;
                                
                                if (file.website_file_path == "Enabled") { 
                                    try {
                                        let website_file = {
                                            md5: file.md5,
                                            artist: sanitizeString(file.artist),
                                            title: sanitizeString(file.title),
                                            performer: pushfile.performer.toLowerCase(),
                                            editor: sanitizeString(tmpeditorname),
                                            sources: file.sources,
                                            comments: file.comments,
                                            editor_discord_id: file.editor_discord_id,
                                            website_file_path: file.website_file_path,
                                            link: ""
                                        }
                                        website_file = await push_website(website_file, filename);
                                        logger.debug(`Website file: ${JSON.stringify(website_file, null, 2)}`);
                                        pushfile.website_file_path = website_file.website_file_path;
                                        pushfile.website_link = website_file.link;
                                        logger.debug(`Website file path: ${pushfile.website_file_path}`);
                                        logger.debug(`Website link: ${pushfile.website_link}`);
                                        const tmpstr = website_url.slice(0, -1) + pushfile.website_link;                                    
                                        logger.debug(`Website link: ${tmpstr}`);
                                        const link = `[link](${tmpstr})`;
                                        logger.debug(`Link: ${link}`);
                                        let sendpath = "";
                                        logger.debug(`Performer: ${website_file.performer}`);
                                        switch (website_file.performer.toLowerCase()) {
                                            case "solo":
                                                sendpath = `/usr/src/app/websites_files/1_solos/${filename}.mid`;
                                                break;
                                            case "duet":
                                                sendpath = `/usr/src/app/websites_files/2_duets/${filename}.mid`;
                                                break;
                                            case "trio":
                                                sendpath = `/usr/src/app/websites_files/3_trios/${filename}.mid`;
                                                break;
                                            case "quartet":
                                                sendpath = `/usr/src/app/websites_files/4_quartets/${filename}.mid`;
                                                break;
                                            case "quintet":
                                                sendpath = `/usr/src/app/websites_files/5_quintets/${filename}.mid`;
                                                break;
                                            case "sextet":
                                                sendpath = `/usr/src/app/websites_files/6_sextets/${filename}.mid`;
                                                break;
                                            case "septet":
                                                sendpath = `/usr/src/app/websites_files/7_septets/${filename}.mid`;
                                                break;
                                            case "octet":
                                                sendpath = `/usr/src/app/websites_files/8_octets/${filename}.mid`;
                                                break;
                                        }
                                        pushfile.website = true;
                                        try {
                                            logger.debug(`Sending file to website ${sendpath}`);
                                            const sendFileToRemote = require('./upload_modules/website_push_file');
                                            pushfile.website_file_path = await sendFileToRemote(midiCache, sendpath);
                                            logger.info(`File ${file.md5} sent to website.`);
                                        }
                                        catch (error) {
                                            logger.error(`Error sending website file: ${error.message}`);
                                            embed.updateEmbedField('website push:', 'Failed');
                                            clearInterval(interval);
                                            try {
                                                return inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                            } catch (error) {
                                                logger.error(`Error sending message: ${error}`);
                                                return
                                            }
                                        }


                                        embed.updateEmbedField('website push:', link);
                                        try {
                                            await inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                        } catch (error) {
                                            logger.error(`Error sending message: ${error}`);
                                        }
                                    } catch (error) {
                                        logger.error(`Error creating website file: ${error.message}`);
                                        embed.updateEmbedField('website push:', 'Failed');
                                        try {
                                            clearInterval(interval);
                                            return inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                        } catch (error) {
                                            logger.error(`Error sending message: ${error}`);
                                            return
                                        }
                                        return
                                    }
                                }
                                if (file.discord_message_id == "Enabled") {
                                    try {
                                        let discord_file = {
                                            md5: file.md5,
                                            artist: sanitizeString(file.artist),
                                            title: sanitizeString(file.title),
                                            performer: file.performer.toLowerCase(),
                                            editor: sanitizeString(file.editor),
                                            sources: file.sources,
                                            comments: file.comments,
                                            editor_discord_id: file.editor_discord_id,
                                            discord_message_id: "",
                                            link: "",
                                            tracks: file.tracks
                                        }
                                        discord_file = await push_discord(discord_file, midiCache, filename);
                                        pushfile.discord_message_id = discord_file.discord_message_id;
                                        pushfile.discord_link = discord_file.link;
                                        const link = `[link](${discord_file.link})`;
                                        embed.updateEmbedField('discord push:', link);
                                        pushfile.discord = true;
                                        try{
                                            await inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                        } catch (error) {
                                            logger.error(`Error sending message: ${error}`);
                                        }
                                    } catch (error) {
                                        clearInterval(interval);
                                        logger.error(`Error creating discord file: ${error.message}`);
                                        embed.updateEmbedField('discord push:', 'Failed');
                                        try {
                                            return inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                        } catch (error) {
                                            logger.error(`Error sending message: ${error}`);
                                            return;
                                        }
                                        return;
                                    }
                                }
                                if (file.editor_channel_id == "Enabled") {
                                    try {
                                        await get_user(id).then(async (user) => {
                                            logger.debug(`Editor Channel ID: ${user.editor_channel_id}`);
                                            file.editor_channel_id = user.editor_channel_id;
                                        

                                            let editor_channel_file = {
                                                md5: file.md5,
                                                artist: sanitizeString(file.artist),
                                                title: sanitizeString(file.title),
                                                performer: file.performer.toLowerCase(),
                                                editor: sanitizeString(file.editor),
                                                sources: file.sources,
                                                comments: file.comments,
                                                editor_discord_id: file.editor_discord_id,
                                                editor_channel_id: file.editor_channel_id,
                                                link: "",
                                                tracks: file.tracks
                                            }
                                            editor_channel_file = await push_editor_channel(editor_channel_file, midiCache, filename);
                                            pushfile.editor_channel_id = editor_channel_file.editor_channel_id;
                                            pushfile.editor_channel_link = editor_channel_file.link;
                                            const link = `[link](${editor_channel_file.link})`;
                                            embed.updateEmbedField('editor channel push:', link);
                                            pushfile.editor_channel = true;
                                            await inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                        });
                                    } catch (error) {
                                        logger.error(`Error creating editor channel file: ${error.message}`);
                                        clearInterval(interval);
                                        embed.updateEmbedField('editor channel push:', 'Failed');
                                        try {
                                            return inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                        } catch (error) {
                                            logger.error(`Error sending message: ${error}`);
                                            return;
                                        }
                                        return;
                                    }
                                }
                                const { setfile, updatefile } = require('../../utils/file_db_tools');
                                logger.debug('Starting file creation process...');
                                try {
                                    logger.debug(`pushfile: ${JSON.stringify(pushfile, null, 2)}`);
                                    if (md5status.newfile) {
                                        try {
                                            logger.debug('Setting file in the database...');
                                            await setfile(pushfile);
                                            logger.debug('File set in the database.');
                                        } catch (error) {
                                            logger.error(`Error creating file ${file.md5}: ${error.message}`);
                                            return embed.updateEmbedField("status:", "Upload Failed!")

                                        }
                                    } else {
                                        try {
                                            logger.debug('Updating file in the database...');
                                            await updatefile(pushfile);
                                            logger.debug('File updated in the database.');
                                        } catch (error) {
                                            logger.error(`Error updating file ${file.md5}: ${error.message}`);
                                            return embed.updateEmbedField("status:", "Upload Failed!")
                                        }
                                    }
                                    logger.debug("File added to the database.")
                                    logger.debug("clearing interval")
                                    clearInterval(interval);
                                    embed.updateEmbedField("status:", "Uploaded successfully!")
                                    try {
                                        await interaction.editReply({ embeds: [embed], components: [], ephemeral: true });
                                    } catch (error) {
                                        logger.error(`Error sending message: ${error}`);
                                    }
                                    logger.info(`File ${file.md5} added to the database.`);
                                } catch (error) {
                                    logger.error(`Error adding file ${file.md5} to the database: ${error.message}`);
                                    embed.updateEmbedField('discord push:', discord_push ? 'Failed' : 'Disabled');
                                    embed.updateEmbedField('website push:', website_push ? 'Failed' : 'Disabled');
                                    embed.updateEmbedField('editor channel push:', editor_channel_push ? 'Failed' : 'Disabled');
                                    clearInterval(interval);
                                    embed.updateEmbedField("status:", "Upload Failed!");
                                    try {
                                        return interaction.editReply({ embeds: [embed], components: [], ephemeral: true });
                                    } catch (error) {
                                        logger.error(`Error sending message: ${error}`);
                                    }
                                }
                                collector.stop();
                                
                            } else if (interaction.customId === 'cancel') {
                                embed.spliceFields(10, 1);
                                embed.updateEmbedField('discord push:', discord_push ? 'Canceled' : 'Disabled');
                                embed.updateEmbedField('website push:', website_push ? 'Canceled' : 'Disabled');
                                embed.updateEmbedField('editor channel push:', editor_channel_push ? 'Canceled' : 'Disabled');
                                try {
                                    await inter.editReply({embeds: [], content: 'Upload cancelled!\nUse up arrow to update', components: [], ephemeral: true});
                                } catch (error) {
                                    logger.error(`Error sending message: ${error}`);
                                }
                                logger.info(`Upload canceled by ${interaction.user.tag} / ${interaction.user.id}`);
                                collector.stop();
                                return;
                            }
                        });  
                        collector.on('end', async collected => {
                            clearInterval(interval0);
                            embed.setTitle("MIDI upload Status")
                            embed.setDescription("Here is a status of your upload:")
                            logger.debug(`Collected: ${collected.size}`);
                            if (collected.size == 0) {
                                embed.updateEmbedField('discord push:', discord_push ? 'Canceled' : 'Disabled');
                                embed.updateEmbedField('website push:', website_push ? 'Canceled' : 'Disabled');
                                embed.updateEmbedField('editor channel push:', editor_channel_push ? 'Canceled' : 'Disabled');
                                embed.updateEmbedField(" ", `TimeOut: 0s`);
                                logger.debug('Embed fields updated successfully.');
                                try {
                                    await inter.editReply({embeds: [embed], content: 'No confirmation received!', components: [], ephemeral: true });
                                } catch (error) {
                                    logger.error(`Error sending message: ${error}`);
                                }
                                logger.info(`No confirmation received.`);
                                return;
                            }
                            
                        });    
                    }    
                }
            });      
        }) 
    }
};