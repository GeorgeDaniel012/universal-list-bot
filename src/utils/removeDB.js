require('dotenv').config();
const http = require('http');

module.exports = {
    name: 'removeDB',
    description: 'Remove character or universe from the DB',
    async removeDB(message, id, type) {
        const sentMessage = await message.reply(`Would you like to remove ${id}?`);

        await sentMessage.react('✔️');
        await sentMessage.react('❌');
        
        const reactionCollectorFilter = (reaction, user) => {
            return ['✔️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        sentMessage.awaitReactions({ filter: reactionCollectorFilter, max: 1, time: 10_000, errors: ["time"] })
            .then(collected => {
                const reaction = collected.first();

                if(reaction.emoji.name === '✔️') {
                    message.channel.send(`Alright, removing ${id} of type ${type}...`);

                    // Encode the universe and character for the URL query
                    const queryParams = new URLSearchParams({
                        id: id
                    }).toString();

                    let options;

                    // Set up the DELETE request options with query parameters in the URL
                    if(type === 'c') {
                        options = {
                            hostname: process.env.BACKEND_HOST,
                            port: process.env.BACKEND_PORT,
                            path: `/characters?${queryParams}`,  // Add query params to the URL path
                            method: 'DELETE', // The DELETE method
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                    } else {
                        options = {
                            hostname: process.env.BACKEND_HOST,
                            port: process.env.BACKEND_PORT,
                            path: `/universes?${queryParams}`,  // Add query params to the URL path
                            method: 'DELETE', // The DELETE method
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                    }

                    // Create the request
                    const req = http.request(options, (res) => {
                        let data = '';

                        // Handle the response data
                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        // When the response has ended
                        res.on('end', () => {
                            if (res.statusCode === 200) {
                                message.channel.send(`Id ${id} of type ${type} removed successfully!`);
                            } else {
                                message.channel.send('Failed to remove. Please try again later.');
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
            .catch((err) => {
                console.error(err);
                message.reply('Connection terminated.');
            });
    }
}