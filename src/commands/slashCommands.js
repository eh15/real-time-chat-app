const schema = require('../schemas/test');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'add-task') {
      await add(interaction);
    }

    if (interaction.commandName === 'hey') {
      return interaction.reply('hey!');
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
     values.push(`Task: ${d.task}\nDescription: ${d.description}\nDate Added: ${d.date}\n`);
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