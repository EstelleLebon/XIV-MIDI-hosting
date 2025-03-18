const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const createLogger = require('../../logger/logger');
const logger = createLogger('HelpCommand');
const websiteurl = process.env.websiteurl;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription(`Display Help`),
        
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        logger.info(`Help command executed by ${interaction.user.tag}`);
        const embed = new EmbedBuilder();

        embed
            .setColor(0x56f500)
            .setTitle("----- HELP / FAQ -----")

            .setAuthor({name:"XIVMIDI"})

            .setDescription("Welcome to the Help / FAQ section!")
            .setFooter({text:"https://xivmidi.com"})

            .setThumbnail(`https://th.bing.com/th/id/OIG.462uH5OW2SOk5LU87zsu?pid=ImgGn`)

            .setTimestamp(new Date())
            if (interaction.member.roles.cache.some(role => role.name === 'Midi Editors')) {
                embed.addFields({name:`What is this?`,value:`Hello I'm the FFXIV MIDI Repository Bot! \nMy mission is to help you upload and share MIDI files to [xivmidi.com](${websiteurl})\nI can also post your MIDI files to this Discord server`})
                embed.addFields({name:`What is xivmidi.com?`,value:`[xivmidi.com](${websiteurl}) is a community run MIDI repository for FFXIV Bards! You will find a wide variety of MIDI files all ready to use in FFXIV.\nIf you have any inquiries or suggestions regarding the website, you can post them [here](https://discord.com/channels/998261522683924491/1328142803783520329)`})
                embed.addFields({name:`How to use the Bot?`,value:`You can upload your MIDI file by using the command /upload-editor`})
            } else {
                embed.addFields({name:`What is this?`,value:`Hello I am FFXIV MIDI Repository Bot! \nMy mission is to help you upload and share MIDI files to this Discord server`})
                embed.addFields({name:`How to use the Bot?`,value:`You can upload your MIDI file by using the command /upload`})

            }
            
            embed.addFields({name:`Something is not working as expected!`,value:`For any errors, bugs, questions, or suggestions about the bot,\nYou can post a message there: [bugs](https://discord.com/channels/998261522683924491/1328143030456160367), [suggestions](https://discord.com/channels/998261522683924491/1328142803783520329), [feedback](https://discord.com/channels/998261522683924491/1328142141066711050)`})
            embed.addFields({name:`Privacy?`,value:`You can address any queries or concerns about privacy to: <@514764375106781194>\n Personnal data that we store are:\nDiscord ID,\nDiscord Tag,\nCustom Editor name.\nYou agree to share this information on our Discord/website while using Bot functions.`})
            embed.addFields({name:`Want to help?`,value:`We are currently looking for nextJS developers to help us improve the website.\n If you wish to help then please feel free to message Estelle or Glacious on Discord directly`})
        ;


        await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
