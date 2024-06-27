const envVars = require("./envVars.json") //delete this if in replit
const fs = require('fs');
const path = require('path');
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');
const schema = require('./schemas/test.js');

const commands = [
  {
    name: 'add-task',
    description: 'add a task',
    options: [
        {
          name: 'task',
          description: 'task name or id',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'description',
          description: 'task description',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
  },
  {
    name: 'list-tasks',
    description: 'list all tasks',
  },
  {
    name: 'delete-task',
    description: 'delete a task',
    options: [
        {
          name: 'task',
          description: 'task name or id',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
  },
  {
    name: 'update-task',
    description: 'update a task',
    options: [
        {
          name: 'task',
          description: 'task name or id',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'description',
          description: 'new task description',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
  },
  {
    name: 'clear-tasks',
    description: 'clear all tasks',
  },
];



const rest = new REST({ version: '10' }).setToken(envVars.token);

(async () => {
    try {
      console.log('Registering slash commands...');
  
      await rest.put(
        Routes.applicationGuildCommands(
          envVars.clientId,
          envVars.guildId,
        ),
        { body: commands }
      );

    await rest.put(
      Routes.applicationGuildCommands(
        envVars.clientId,
        envVars.guildId
      ),
      { body: commands }
    );

    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();