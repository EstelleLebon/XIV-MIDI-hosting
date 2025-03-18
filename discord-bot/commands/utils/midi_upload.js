const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const createLogger = require('../../logger/logger');
const logger = createLogger('uploadCommand-public');
const { add_user, get_user, update_user } = require('../../utils/user_db_tools');
const crypto = require('crypto');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const push_discord = require('./upload_modules/discord');
const checkMidi = require('./upload_modules/file_checks');
const { midi_file } = require('./upload_modules/midi_file');


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
        .setDefaultMemberPermissions(0x0000000800000000)
        .setName('upload')
        .setDescription("Upload MIDI files to discord.")
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

        // function to sanitize string
        function sanitizeString(str) {
            return str.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
        }

        // USER PART
        // define user_discord_id in id:
        const id = interaction.user.id;

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
            file.editor = user.editor_name;
            file.editor_discord_id = user.discord_id;
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
        let discord_push = true;
        let website_push = true;
        let editor_channel_push = true;
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
        handle_md5_result(md5, md5status)
        .then(async (md5status) => {
            logger.debug(`MD5 status: ${JSON.stringify(md5status, null, 2)}`);
            if (md5status.globalstatus == false) {
                discord_push = false;
                website_push = false;
                editor_channel_push = false;
            }
            if (md5status.discordstatus == false) {
                discord_push = false;
                return interaction.editReply({ content: 'File already exists in discord!', ephemeral: true });
            }
            website_push = false;
            editor_channel_push = false;
            

            if (discord_push) {
                file.discord_message_id = "Enabled";
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
                    {name: "Editor Name:",value: tmpeditorname || "N/A",inline: false},
                    {name: "Band Size:",value: file.performer || "N/A",inline: false},
                    // {name: "Tags:",value: embedtags || "N/A",inline: false},
                    {name: "Instruments:",value: trackInstruments || "N/A",inline: false},
                    {name: "Comments:",value: file.comments || "N/A",inline: false},
                    {name: "Source:",value: file.sources || "N/A",inline: false},
                    {name: "Discord Push:",value: file.discord_message_id,inline: true})


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
                    await interaction.deferUpdate();   
                    
                    embed.spliceFields(9, 1);
                    embed.setTitle("MIDI upload Status")
                    embed.setDescription("Here is a status of your upload:")
                    logger.debug(`Interaction: ${interaction.customId}`);
                    if (interaction.customId === 'confirm') {
                        embed.updateEmbedField('discord push:', discord_push ? 'Preparing upload...' : 'Disabled');
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
                        const pushfile = { md5: file.md5, discord: false };
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

                        if (file.discord_message_id == "Enabled") {
                            pushfile.discord = true;
                            try {
                                let discord_file = {
                                    md5: file.md5,
                                    artist: sanitizeString(file.artist),
                                    title: sanitizeString(file.title),
                                    performer: file.performer,
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
                                try{
                                    await inter.editReply({ embeds: [embed], components: [], ephemeral: true });
                                } catch (error) {
                                    logger.error(`Error sending message: ${error}`);
                                }
                            } catch (error) {
                                logger.error(`Error creating discord file: ${error.message}`);
                                embed.updateEmbedField('discord push:', 'Failed');
                                clearInterval(interval);
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
                        await new Promise((resolve) => setTimeout(resolve, 4000));
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
                                    clearInterval(interval);
                                    return embed.updateEmbedField("status:", "Upload Failed!")

                                }
                            } else {
                                try {
                                    logger.debug('Updating file in the database...');
                                    await updatefile(pushfile);
                                    logger.debug('File updated in the database.');
                                } catch (error) {
                                    logger.error(`Error updating file ${file.md5}: ${error.message}`);
                                    clearInterval(interval);
                                    return embed.updateEmbedField("status:", "Upload Failed!")
                                }
                            }
                            logger.debug("File added to the database.")
                            logger.debug("clearing interval")
                            clearInterval(interval);
                            await new Promise((resolve) => setTimeout(resolve, 1000));
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
                            clearInterval(interval);
                            await new Promise((resolve) => setTimeout(resolve, 2000));
                            embed.updateEmbedField("status:", "Upload Failed!");
                            try {
                                await interaction.editReply({ embeds: [embed], components: [], ephemeral: true });
                            } catch (error) {
                                logger.error(`Error sending message: ${error}`);
                            }
                        }
                        collector.stop();
                        
                    } else if (interaction.customId === 'cancel') {
                        embed.spliceFields(8, 1);
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
        }) 
    }
};