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

                    // Encode the universe and character for the URL query
                    const queryParams = new URLSearchParams({
                        name: character,
                        universe: universe
                    }).toString();

                    // Set up the DELETE request options with query parameters in the URL
                    const options = {
                        hostname: 'example.com',  // Replace with the actual hostname
                        port: 443, // Use 80 for HTTP, 443 for HTTPS
                        path: `/api/remove?${queryParams}`,  // Add query params to the URL path
                        method: 'DELETE', // The DELETE method
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };

                    // Create the request
                    const req = https.request(options, (res) => {
                        let data = '';

                        // Handle the response data
                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        // When the response has ended
                        res.on('end', () => {
                            if (res.statusCode === 200) {
                                message.channel.send(`Character "${character}" removed from "${universe}" successfully!`);
                            } else {
                                message.channel.send('Failed to remove the character. Please try again later.');
                            }
                        });
                    });

                    // Handle request errors
                    req.on('error', (e) => {
                        console.error(e);
                        message.reply('There was an error reaching the server.');
                    });

                    // End the request (since we are not sending a body)
                    req.end();
                } else {
                    message.reply('Stop wasting my time then. Removal cancelled.');
                }
            })
            .catch(() => {
                message.reply('Connection terminated.');
            });
    }
}