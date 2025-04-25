import { SlashCommandBuilder, MessageFlags } from "discord.js";
import Search from "../../classes/search/search.js";



const data = new SlashCommandBuilder()
	.setName('search')
    .setDescription("Search MIDI files.")

	.addStringOption(option => option
        .setName('band-size')
        .setDescription('[optional] Number of performers / tracks.')
        .setRequired(false)
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
		.setDescription('[optional] Artist of the song.')
		.setRequired(false)
	)

	.addStringOption(option => option
		.setName('title')
		.setDescription('[optional] Title of the song.')
		.setRequired(false)
	)

	.addStringOption(option => option
		.setName('editor')
		.setDescription('[optional] Editor of MIDI file.')
		.setRequired(false)
	)

	.addStringOption(option => 
        option.setName('instrument')
            .setDescription('[optional] Select one instrument inside the MIDI file.')
            .setRequired(false)
            .addChoices(
                { name: 'Piano', value: 'Piano' },
                { name: 'Harp', value: 'Harp' },
                { name: 'Fiddle', value: 'Fiddle' },
                { name: 'Lute', value: 'Lute' },
                { name: 'Fife', value: 'Fife' },
                { name: 'Flute', value: 'Flute' },
                { name: 'Oboe', value: 'Oboe' },
                { name: 'Panpipes', value: 'Panpipes' },
                { name: 'Clarinet', value: 'Clarinet' },
                { name: 'Trumpet', value: 'Trumpet' },
                { name: 'Saxophone', value: 'Saxophone' },
                { name: 'Trombone', value: 'Trombone' },
                { name: 'Horn', value: 'Horn' },
                { name: 'Tuba', value: 'Tuba' },
                { name: 'Violin', value: 'Violin' },
                { name: 'Viola', value: 'Viola' },
                { name: 'Cello', value: 'Cello' },
                { name: 'DoubleBass', value: 'DoubleBass' },
                { name: 'ElectricGuitarOverdriven', value: 'ElectricGuitarOverdriven' },
                { name: 'ElectricGuitarClean', value: 'ElectricGuitarClean' },
                { name: 'ElectricGuitarPowerChords', value: 'ElectricGuitarPowerChords' },
                { name: 'BassDrum', value: 'BassDrum' },
                { name: 'SnareDrum', value: 'SnareDrum' },
                { name: 'Cymbal', value: 'Cymbal' },
                { name: 'Timpani', value: 'Timpani' }
            )
    )

const execute = async (interaction) => {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	
	// Check if at least one option is provided
	let bandSize = interaction.options.getString('band-size');
	let artist = interaction.options.getString('artist');
	let title = interaction.options.getString('title');
	let editor = interaction.options.getString('editor');
	let instrument = interaction.options.getString('instrument');
	if (!bandSize && !artist && !title && !editor && !instrument) {
		await interaction.editReply({
			content: "Please provide at least one search option.",
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	bandSize = null;
	artist = null;
	title = null;
	editor = null;
	instrument = null;

	// Initialize search class
	const search = new Search(interaction);
	await search.worker();

}


export { data, execute };
export default {
	data: data,
	execute: execute,
};