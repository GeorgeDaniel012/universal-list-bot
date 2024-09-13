const http = require('http');

module.exports = {
    name: 'get',
    description: 'Get all characters and universes from DB',
    async execute(message, args) {
        // Fetch characters
        const fetchCharacters = new Promise((resolve, reject) => {
            http.get('http://' + process.env.BACKEND_HOST 
                + ':' + process.env.BACKEND_PORT + '/characters', (resp) => {
                let data = '';
                
                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received.
                resp.on('end', () => {
                    try {
                        resolve(JSON.parse(data)); // Convert to JSON if necessary
                    } catch (e) {
                        reject(e);
                    }
                });

            }).on('error', (err) => {
                reject(err);
            });
        });

        // Fetch universes
        const fetchUniverses = new Promise((resolve, reject) => {
            http.get('http://' + process.env.BACKEND_HOST 
                + ':' + process.env.BACKEND_PORT + '/universes', (resp) => {
                let data = '';
                
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });

            }).on('error', (err) => {
                reject(err);
            });
        });

        try {
            const characters = await fetchCharacters;
            const universes = await fetchUniverses;

            console.log('characters\n', characters);
            console.log('universes\n', universes);

            // Send the response back to Discord
            // message.channel.send(`Characters: ${characters.map(c => c.name).join(', ')}`);
            // message.channel.send(`Universes: ${universes.map(u => u.name).join(', ')}`);

            // Assuming characters is an array of objects with id, name, and apparitions
            message.channel.send('Characters:\n' + characters.map(character => 
                `- ID: ${character._id}, Name: ${character.name}, Apparitions: ${character.apparitions}`
            ).join('\n'));

            // Assuming universes is an array of objects with id and name
            message.channel.send('Universes:\n' + universes.map(universe => 
                `- ID: ${universe._id}, Name: ${universe.name}`
            ).join('\n'));

            // message.channel.send('Characters:\n' + JSON.stringify(characters));
            // message.channel.send('Universes:\n' + JSON.stringify(universes));

        } catch (error) {
            console.error(error);
            message.channel.send('Error fetching data from the API.');
        }
    }
};