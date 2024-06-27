const { SlashCommandBuilder } = require('discord.js');
const schema = require('../../schemas.test');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('read')
       .setDescription('read task list'),
    async execute(interaction) {
        const data = await schema.find();

        var values = [];
        await data.forEach(async d => {
            values.push(`Task: ${d.task}\nDescription: ${d.description}\nDate: ${d.date}\n`);
        });

        await interaction.reply({ content: `${values.join('\n')}`});
    }
}