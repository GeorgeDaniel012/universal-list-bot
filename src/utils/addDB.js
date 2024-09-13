require('dotenv').config();
const http = require('http');

module.exports = {
    name: 'addDB',
    description: 'Add character apparition to the DB',
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

                    // Create the POST data
                    const postData = JSON.stringify({
                        name: character,
                        universe: universe
                    });

                    // Set up the POST request options
                    const options = {
                        hostname: process.env.BACKEND_HOST, // Replace with the actual API endpoint
                        port: process.env.BACKEND_PORT, // Default HTTPS port
                        path: '/create/characters', // Replace with the actual endpoint path
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length
                        }
                    };

                    // Create the request
                    const req = http.request(options, (res) => {
                        let data = '';

                        // Handle incoming data
                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        // Handle end of the response
                        res.on('end', () => {
                            message.channel.send('Character added successfully!');
                        });
                    });

                    // Handle request error
                    req.on('error', (e) => {
                        console.error(e);
                        message.reply('Failed to add the character. Please try again later.');
                    });

                    // Write the data to the request body
                    req.write(postData);
                    req.end();

                } else {
                    message.reply('Stop wasting my time then. Creation cancelled.');
                }
            })
            .catch((err) => {
                console.error(err);
                message.reply('Connection terminated.');
            });
    }
}