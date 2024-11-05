const { Client, GatewayIntentBits, ActivityType, Events, Collection } = require(`discord.js`);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
const schema = require('./schemas/test');
const mongoose = require("mongoose");
require('dotenv').config();
const mongourl = process.env.mongoURL;

//connect to mongoDB
(async () => {
    try {
        if (!mongourl) return;
        await mongoose.connect(mongourl || '');
            if (mongoose.connect){
            console.log("Connected to MongoDB");
            } else {
            console.log("Failed to connect to MongoDB");
            }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  })();
/* replit implementation:
const envVars = {
    "token": "",
    "chatID": "",
    "characterID": "",
    "authToken": ""
  }
*/
const envVars = require("../envVars.json") //delete this if in replit

const CharacterAI = require('node_characterai');
const characterAI = new CharacterAI();
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'add-task') {
      await add(interaction);
    }

    if (interaction.commandName ==='list-tasks') {
      await read(interaction);
    }

    if (interaction.commandName === 'delete-task') {
      await deleteTask(interaction);
    }

    if (interaction.commandName === 'update-task') {
      await updateTask(interaction);
    }

    if (interaction.commandName === 'clear-tasks') {
      await schema.deleteMany({});
      await interaction.reply('Tasks cleared');
    }
  });

// calls schema to create a task
async function add(interaction) {
  await schema.create({
      task: interaction.options.getString('task'),
      description: interaction.options.getString('description'),
      date: new Date()
  });
  await interaction.reply('Task saved');
}

async function read(interaction) {
 const data = await schema.find();
 var values = [];
 await data.forEach(async d => {
     values.push(`Task: ${d.task}\nDescription: ${d.description}\nDate: ${d.date}\n`);
 });
 await interaction.reply({ content: `${values.join('\n')}`});
}

async function deleteTask(interaction) {
  const taskname = interaction.options.getString('task');
  const task = await schema.findOneAndDelete({ task: taskname });
  if (!task) return await interaction.reply('Task not found');
  else await interaction.reply('Task deleted');
}

async function updateTask(interaction) {
  const taskname = interaction.options.getString('task');
  const description = interaction.options.getString('description');
  const task = await schema.findOneAndUpdate({ task: taskname }, { description: description }, { new: true });
  if (!task) return await interaction.reply('Task not found');
  else await interaction.reply('Task updated');
}
/*
const fs = require('node:fs');

client.commands = new Collection();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();
*/

//chatbot functions
client.on("messageCreate", async message => {
    // When the bot is "ready":
    client.once("ready", async () => {
      console.log(`${client.user.username} is online.`); // Log it in the console.
      client.user.setPresence({ activities: [{ name: `and sleeping`, type: ActivityType.Playing }], status: 'online' }) // Set a activity.
    });
    
    // If the code retrieves a message from a bot user, it stops the code.
    if (message.author.bot) return;

    // Makes it so the bot only runs when the conversation happens in a set discord channel.
    if (!message.channel.id == envVars.chatID) return // Change this in botConfig.json OR remove this line if you want it to function in all chats.

    // Specifify the message sent to the character.ai chat.
    var msgText = message.content.split(" ").slice(0).join(" ");
    if (!msgText) return // Prevent the code from sending an empty message to the ai.
    // Replace the 1 above with a 0 if you don't @mention the bot infront of your msgs (Reply ping / Removed the mention required)

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
        return response
    }

    try {

        let response = await aiMSG() // Get the response data by running the aiMSG() function.
        message.reply(`${response.text}`) // Send the character.ai bot reponse in the discord channel.

        // reminds user after a certain amount of time (timer)

        const timer = (1+Math.floor(Math.random()*10)) *1000
        /*
        setTimeout(() => {
            message.reply(`${"Remember to drink water and sleep early today!"}`); // Send the character.ai bot response in the discord channel.
        }, timer); 
        */
       
        // message.reply() 
        /*
        setTimeout(() => {
            message = "Tell me something random.";
        }, timer);   
        */      
    } catch (error) { // This runs if something goes wrong trying to send the reponse.
        console.log(error); // This logs it in the console.
        await message.reply("Error handling the command."); // This sends a msg in the discord channel.
    }

});

client.login(envVars.token) // connects the bot.

/*
randomizer:

num = (1+Math.floor(Math.random()*10)) *1000
function myFunction() {
   console.log("Hello World!");
}
setInterval(myFunction, num);
 */
