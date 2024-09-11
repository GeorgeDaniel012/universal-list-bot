module.exports = {
    name: 'add',
    description: 'Add universe to the DB',
    async execute(message, args) {
        if(!args[0]) {
            return message.channel.send("Please provide a name for this universe.");
        }

        const sentMessage = await message.channel.send(args[0]);

        await sentMessage.react('❓');
        await sentMessage.react('❌');
        
        const reactionCollectorFilter = (reaction, user) => {
            // console.log(`Reaction: ${reaction.emoji.name}, User: ${user.id}`);
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
            time: 6000
        });

        const messageCollector = message.channel.createMessageCollector({
            filter: messageCollectorFilter,
            time: 6000
        });

        // Handle reactions
        reactionCollector.on('collect', (reaction) => {
            if (interactionHandled) return; // Ignore if already handled
            interactionHandled = true; // Set flag to indicate interaction

            if (reaction.emoji.name === '❓') {
                message.reply("You don't know the name of the character...");
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

            message.channel.send(`You said: ${reply.content}`);
            reactionCollector.stop(); // Stop the reaction collector
            messageCollector.stop(); // Stop the message collector
        });

        // Handle timeouts
        reactionCollector.on('end', (collected, reason) => {
            if (reason === 'time' && !interactionHandled) {
                message.reply('ba da si tu reply sau react naiba ca ma faci sa astept atata');
            }
        });

        // messageCollector.on('end', (collected, reason) => {
        //     if (reason === 'time' && !interactionHandled) {
        //         message.reply('ba da si tu reply naiba ca ma faci sa astept atata');
        //     }
        // });


        // sentMessage.awaitReactions({ filter: reactionCollectorFilter, max: 1, time: 6_000, errors: ['time'] })
        //     .then(collected => {
        //         const reaction = collected.first();
        //         userHasReacted = true;
        //         //console.log(reaction);

        //         if (reaction.emoji.name === '❓') {
        //             message.reply("You don't know the name of the character...");
        //         } else {
        //             message.reply('Creation cancelled.');
        //         }
        //         console.log(collected.size);
        //     })
        //     .catch(collected => {
        //         message.reply('a ok');
        //     });

        // message.channel.awaitMessages({ filter: messageCollectorFilter, max: 1, time: 6_000, errors: ['time'] })
        //     .then(collected => {
        //         const reply = collected.first();

        //         message.channel.send(reply.content);
        //         //console.log(collected.first());
        //     })
        //     .catch(collected => {
        //         message.channel.send('ba da si tu reply naiba ca ma faci sa astept atata');
        //     });
    }
};