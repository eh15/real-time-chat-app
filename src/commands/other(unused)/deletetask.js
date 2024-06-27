const { SlashCommandBuilder } = require('discord.js');
const schema = require('../../schemas.test');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('delete-task')
       .setDescription('delete a task')
       .addStringOption(option => option.setName('task').setDescription('task name or id').setRequired(true)),
    async execute(interaction) {
        const taskname = interaction.options.getString('task');
        const task = await schema.findOne({ task: taskname });
        if (!task) return await interaction.reply('Task not found');
        await schema.deleteOne({ task: task });
        
        await interaction.reply('Task deleted');
    }
}