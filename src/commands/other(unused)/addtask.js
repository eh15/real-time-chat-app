const { SlashCommandBuilder } = require('discord.js');
const schema = require('../../schemas.test');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('add-task')
       .setDescription('add a task')
       .addStringOption(option => option.setName('task').setDescription('task name or id').setRequired(true))
       .addStringOption(option => option.setName('description').setDescription('task description').setRequired(true)),
    async execute(interaction) {
        await schema.create({
            task: interaction.options.getString('task'),
            description: interaction.options.getString('description'),
            date: new Date()
        });
        await interaction.reply('Task saved');
    }
}