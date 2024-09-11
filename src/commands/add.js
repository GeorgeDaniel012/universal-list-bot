const addDB = require('../utils/addDB');

module.exports = {
    name: 'add',
    description: 'Configure universe and character to be added to DB',
    async execute(message, args) {
        if(!args[0]) {
            return message.channel.send("Please provide a name for this universe.");
        }

        const universe = args[0];

        const sentMessage = await message.channel.send(universe);

        await sentMessage.react('❓');
        await sentMessage.react('❌');
        
        const reactionCollectorFilter = (reaction, user) => {
            return ['❓', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const messageCollectorFilter = (message) => {
            return !message.author.bot;
        }

        // Flags to track if one of the collectors has triggered
        let interactionHandled = false;

        // Create collectors
        const reactionCollector = sentMessage.createReactionCollector({
            filter: reactionCollectorFilter,
            time: 10000 // timeout = 10 seconds
        });

        const messageCollector = message.channel.createMessageCollector({
            filter: messageCollectorFilter,
            time: 10000 // timeout = 10 seconds
        });

        // Handle reactions
        reactionCollector.on('collect', (reaction) => {
            if (interactionHandled) return; // Ignore if already handled
            interactionHandled = true; // Set flag to indicate interaction

            if (reaction.emoji.name === '❓') {
                message.reply(
                    "It seems like you don't know the name of the character...\n" // +
                    //`Would you like to add ??? to ${universe}?`
                );
                addDB.addDB(message, universe, "???");
            } else if (reaction.emoji.name === '❌') {
                message.reply('Creation cancelled.');
            }
            reactionCollector.stop(); // Stop the reaction collector
            messageCollector.stop(); // Stop the message collector
        });

        // Handle messages
        messageCollector.on('collect', (reply) => {
            if (interactionHandled) return; // Ignore if already handled
            interactionHandled = true; // Set flag to indicate interaction

            // message.reply(`You said: ${reply.content}`);
            addDB.addDB(message, universe, reply.content);
            reactionCollector.stop(); // Stop the reaction collector
            messageCollector.stop(); // Stop the message collector
        });

        // Handle timeout
        reactionCollector.on('end', (collected, reason) => {
            if (reason === 'time' && !interactionHandled) {
                message.reply('I shall not wait any further. Creation cancelled.');
            }
        });
    }
};