module.exports = {
    name: 'addDB',
    description: 'Add universe to the DB',
    async addDB(message, universe, character) {
        const sentMessage = await message.reply(`Would you like to add ${character} to ${universe}?`);

        await sentMessage.react('✔️');
        await sentMessage.react('❌');
        
        const reactionCollectorFilter = (reaction, user) => {
            return ['✔️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        sentMessage.awaitReactions({ filter: reactionCollectorFilter, max: 1, time: 10_000, errors: ["time"] })
            .then(collected => {
                const reaction = collected.first();

                if(reaction.emoji.name === '✔️') {
                    message.channel.send(`Alright, adding ${character} to ${universe}...`);
                } else {
                    message.reply('Stop wasting my time then. Creation cancelled.');
                }
            })
    }
}