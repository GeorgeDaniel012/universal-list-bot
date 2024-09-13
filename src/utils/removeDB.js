module.exports = {
    name: 'removeDB',
    description: 'Remove apparition from the DB',
    async removeDB(message, universe, character) {
        const sentMessage = await message.reply(`Would you like to remove ${character} from ${universe}?`);

        await sentMessage.react('✔️');
        await sentMessage.react('❌');
        
        const reactionCollectorFilter = (reaction, user) => {
            return ['✔️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        sentMessage.awaitReactions({ filter: reactionCollectorFilter, max: 1, time: 10_000, errors: ["time"] })
            .then(collected => {
                const reaction = collected.first();

                if(reaction.emoji.name === '✔️') {
                    message.channel.send(`Alright, removing ${character} from ${universe}...`);
                } else {
                    message.reply('Stop wasting my time then. Removal cancelled.');
                }
            })
            .catch(() => {
                message.reply('Connection terminated.');
            });
    }
}