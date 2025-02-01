const { Client, GatewayIntentBits, ActivityType, Events, Collection } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();
const mongourl = process.env.mongoURL;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

const envVars = require("../envVars.json"); // delete this if in replit

const CharacterAI = require('node_characterai');
const characterAI = new CharacterAI();

// Connect to MongoDB
(async () => {
    try {
        if (!mongourl) return;
        await mongoose.connect(mongourl || '');
        if (mongoose.connection.readyState === 1) {
            console.log("Connected to MongoDB");
        } else {
            console.log("Failed to connect to MongoDB");
        }
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const userId = interaction.user.id;
    const userDb = mongoose.connection.useDb(`user_${userId}`);
    const schema = userDb.model('Task', new mongoose.Schema({
        task: String,
        description: String,
        date: Date
    }));

    if (interaction.commandName === 'add-task') {
        await add(interaction, schema);
    }

    if (interaction.commandName === 'list-tasks') {
        await read(interaction, schema);
    }

    if (interaction.commandName === 'delete-task') {
        await deleteTask(interaction, schema);
    }

    if (interaction.commandName === 'update-task') {
        await updateTask(interaction, schema);
    }

    if (interaction.commandName === 'clear-tasks') {
        await schema.deleteMany({});
        await interaction.reply('Tasks cleared');
    }
});

// Calls schema to create a task
async function add(interaction, schema) {
    await schema.create({
        task: interaction.options.getString('task'),
        description: interaction.options.getString('description'),
        date: new Date()
    });
    await interaction.reply('Task saved');
}

async function read(interaction, schema) {
    const data = await schema.find();
    const values = data.map(d => `Task: ${d.task}\nDescription: ${d.description}\nDate: ${d.date}\n`);
    if (!values) return await interaction.reply('No tasks found');
    await interaction.reply({ content: values.join('\n') });
}

async function deleteTask(interaction, schema) {
    const taskname = interaction.options.getString('task');
    const task = await schema.findOneAndDelete({ task: taskname });
    if (!task) return await interaction.reply('Task not found');
    await interaction.reply('Task deleted');
}

async function updateTask(interaction, schema) {
    const taskname = interaction.options.getString('task');
    const description = interaction.options.getString('description');
    const task = await schema.findOneAndUpdate({ task: taskname }, { description: description }, { new: true });
    if (!task) return await interaction.reply('Task not found');
    await interaction.reply('Task updated');
}

// Chatbot functions
client.on("messageCreate", async message => {
    // When the bot is "ready":
    client.once("ready", async () => {
        console.log(`${client.user.username} is online.`); // Log it in the console.
        client.user.setPresence({ activities: [{ name: `and sleeping`, type: ActivityType.Playing }], status: 'online' }); // Set an activity.
    });

    // If the code retrieves a message from a bot user, it stops the code.
    if (message.author.bot) return;

    // Makes it so the bot only runs when the conversation happens in a set discord channel.
    if (message.channel.id !== envVars.chatID) return; // Change this in botConfig.json OR remove this line if you want it to function in all chats.

    // Specify the message sent to the character.ai chat.
    const msgText = message.content.split(" ").slice(0).join(" ");
    if (!msgText) return; // Prevent the code from sending an empty message to the AI.

    // Displays the "YourBotsName is typing.." text in the discord channel.
    message.channel.sendTyping();

    async function aiMSG() {
        // If the connection isn't authenticated, it authenticates it with the await function.
        if (!characterAI.isAuthenticated()) {
            await characterAI.authenticateWithToken(envVars.authToken);
            // To authenticate as a guest use .authenticateAsGuest()
            // To authenticate as a user use .authenticateWithToken(botConfig.authToken)
        }

        // Create or Continue in the character.ai chat (Uses the ChatID set in botConfig.json)
        const chat = await characterAI.createOrContinueChat(envVars.characterID);

        // Send a message
        const response = await chat.sendAndAwaitResponse(`${msgText}`, true);

        // Return the retrieved response to the code.
        return response;
    }

    try {
        const response = await aiMSG(); // Get the response data by running the aiMSG() function.
        message.reply(`${response.text}`); // Send the character.ai bot response in the discord channel.

        // Reminds user after a certain amount of time (timer)
        const timer = (1 + Math.floor(Math.random() * 10)) * 1000;
        /*
        setTimeout(() => {
            message.reply(`${"Remember to drink water and sleep early today!"}`); // Send the character.ai bot response in the discord channel.
        }, timer);
        */
    } catch (error) { // This runs if something goes wrong trying to send the response.
        console.log(error); // This logs it in the console.
        await message.reply("Error handling the command."); // This sends a message in the discord channel.
    }
});

client.login(envVars.token); // Connects the bot.
