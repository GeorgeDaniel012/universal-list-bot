// Load environment variables from the .env file
require('dotenv').config();

// Import the Discord.js Client
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Initialize the bot client
// with intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// Load command files from the commands folder
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const prefix = '.';

client.once('ready', () => {
    console.log("it's on!", client.user.tag);
});

client.on('messageCreate', (message) => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ (.+)/);
    console.log("Args:", args);
    const commandName = args.shift().toLowerCase();

    // Check if the command exists in the collection
    const command = client.commands.get(commandName);

    if (!command) return; // If the command is not found, ignore it

    // Try to execute the command
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

// Bot startup
client.login(process.env.BOT_TOKEN).then(() => {
    console.log('Bot is logged in and ready!');
}).catch(console.error);
