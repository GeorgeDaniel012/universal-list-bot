// import authorized_users from "../../config.json";
const addDB = require('../utils/addDB');
const openaiCheck = require('../utils/openaiCheck');

// module.exports = {
//     name: 'add',
//     description: 'Configure universe and character to be added to DB',
//     async execute(message, args) {
//         if(!args[0]) {
//             return message.channel.send("Please provide a name for this universe.");
//         }

//         let universe = args[0];

//         let checkedUniverse;

//         try {
//             checkedUniverse = await openaiCheck.openaiUniverseCheck(message, args);
//         } catch(err) {
//             console.error(err);
//         }

//         const universeCheckSentMesage = await message.channel.send(
//             `Alright, ${checkedUniverse} it is?`
//         );

//         await universeCheckSentMesage.react('🔃');
//         await universeCheckSentMesage.react('✔️');
//         await universeCheckSentMesage.react('❌');
        
//         const reactionInitialCollectorFilter = (reaction, user) => {
//             return ['🔃', '✔️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
//         };

//         const reactionCharacterCollectorFilter = (reaction, user) => {
//             return ['🔃', '❓', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
//         };

//         const messageCollectorFilter = (msg) => {
//             return message.author.id === msg.author.id;
//         }

//         // Flags to track if one of the collectors has triggered
//         let interactionHandled = false;

//         // Create collectors
//         const reactionInitialCollector = universeCheckSentMesage.createReactionCollector({
//             filter: reactionInitialCollectorFilter,
//             time: 10000 // timeout = 10 seconds
//         });

//         const reactionCharacterCollector = universeCheckSentMesage.createReactionCollector({
//             filter: reactionCharacterCollectorFilter,
//             time: 10000 // timeout = 10 seconds
//         });

//         const messageCollector = message.channel.createMessageCollector({
//             filter: messageCollectorFilter,
//             time: 10000 // timeout = 10 seconds
//         });

//         reactionInitialCollector.on('collect', (reaction) => {
//             if (reaction.emoji.name === '🔃'){
//                 message.reply(`Alright, ${universe} it is.`)
//             } else if (reaction.emoji.name === '✔️') {
//                 message.reply(`Alright, ${universe} it is.`);
//                 universe = checkedUniverse;
//             } else if (reaction.emoji.name === '❌') {
//                 message.reply('Creation cancelled.');
//             }
//             reactionInitialCollector.stop(); // Stop the reaction collector
//         });

//         // Handle reactions
//         reactionCharacterCollector.on('collect', (reaction) => {
//             if (interactionHandled) return; // Ignore if already handled
//             interactionHandled = true; // Set flag to indicate interaction

//             if (reaction.emoji.name === '🔃'){
//                 //"Alright, "
//             } else if (reaction.emoji.name === '❓') {
//                 message.reply(
//                     "It seems like you don't know the name of the character...\n" // +
//                     //`Would you like to add ??? to ${universe}?`
//                 );
//                 addDB.addDB(message, universe, "???");
//             } else if (reaction.emoji.name === '❌') {
//                 message.reply('Creation cancelled.');
//             }
//             reactionCharacterCollector.stop(); // Stop the reaction collector
//             messageCollector.stop(); // Stop the message collector
//         });

//         // Handle messages
//         messageCollector.on('collect', (reply) => {
//             if (interactionHandled) return; // Ignore if already handled
//             interactionHandled = true; // Set flag to indicate interaction

//             // message.reply(`You said: ${reply.content}`);
//             addDB.addDB(message, universe, reply.content);
//             reactionCharacterCollector.stop(); // Stop the reaction collector
//             messageCollector.stop(); // Stop the message collector
//         });

//         // Handle timeout
//         reactionCharacterCollector.on('end', (collected, reason) => {
//             if (reason === 'time' && !interactionHandled) {
//                 message.reply('I shall not wait any further. Creation cancelled.');
//             }
//         });
//     }
// };

module.exports = {
    name: 'add',
    description: 'Add universe to the DB',
    async execute(message, args) {
        if (!args[0]) {
            return message.channel.send("Please provide a name for the universe.");
        }

        let universe = args[0];
        let checkedUniverse;
        try {
            // Call OpenAI function to check the universe
            checkedUniverse = await openaiCheck.openaiUniverseCheck(message, universe);
        } catch (err) {
            console.error(err);
            return message.channel.send('There was an issue reaching the AI service.');
        }

        // Send initial message with AI response
        const universeCheckSentMessage = await message.channel.send(
            `Alright, is "${checkedUniverse}" the correct universe? React with:
            ✔️ to confirm, 🔃 to use the original universe, or ❌ to cancel.`
        );

        // Add initial reactions
        await universeCheckSentMessage.react('🔃');
        await universeCheckSentMessage.react('✔️');
        await universeCheckSentMessage.react('❌');

        // Filter for the initial reactions
        const reactionInitialCollectorFilter = (reaction, user) => {
            return ['✔️', '🔃', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const reactionInitialCollector = universeCheckSentMessage.createReactionCollector({
            filter: reactionInitialCollectorFilter,
            max: 1,
            time: 15000 // Timeout in 15 seconds
        });

        // Handle user's decision based on initial reactions
        reactionInitialCollector.on('collect', async (reaction) => {
            if (reaction.emoji.name === '✔️') {
                // Universe confirmed, proceed to character input
                await message.reply("Understood.");
                await handleCharacterInput(message, checkedUniverse);
            } else if (reaction.emoji.name === '🔃') {
                // Retry universe check
                await message.reply('Alright, using the original name.');
                // You could trigger another AI check here if needed
                checkedUniverse = universe;
                await handleCharacterInput(message, checkedUniverse); // Proceed anyway for now
            } else if (reaction.emoji.name === '❌') {
                // Cancel creation
                message.reply('Creation cancelled.');
            }
        });

        reactionInitialCollector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                message.reply('I shall not wait any further. Creation cancelled.');
            }
        });

        // Function to handle character input or reactions
        async function handleCharacterInput(message, universe) {
            const characterPromptMessage = await message.channel.send(
                `Now who did you see in ${universe}? React with ❓ if you don't know their name.`
            );
            await characterPromptMessage.react('❓');
            await characterPromptMessage.react('❌');

            const reactionCharacterCollectorFilter = (reaction, user) => {
                return ['❓', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            const messageCollectorFilter = (msg) => {
                return msg.author.id === message.author.id;
            };

            const reactionCharacterCollector = characterPromptMessage.createReactionCollector({
                filter: reactionCharacterCollectorFilter,
                max: 1,
                time: 15000 // Timeout in 15 seconds
            });

            const messageCollector = message.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 15000 // Timeout in 15 seconds
            });

            // Handle character reaction (❓ or ❌)
            reactionCharacterCollector.on('collect', (reaction) => {
                if (reaction.emoji.name === '❓') {
                    message.reply("It seems like you don't know the name of the character...");
                    addDB.addDB(message, universe, '???');
                } else if (reaction.emoji.name === '❌') {
                    message.reply('Creation cancelled.');
                }
                reactionCharacterCollector.stop();
                messageCollector.stop();
            });

            // Handle user input for character name
            messageCollector.on('collect', (msg) => {
                //message.reply(`Adding "${msg.content}" to "${universe}".`);
                addDB.addDB(message, universe, msg.content);
                reactionCharacterCollector.stop();
                messageCollector.stop();
            });

            reactionCharacterCollector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    message.reply('I shall not wait any further. Creation cancelled.');
                }
            });

            // messageCollector.on('end', (collected, reason) => {
            //     if (reason === 'time') {
            //         message.reply('I shall not wait any further. Creation cancelled.');
            //     }
            // });
        }

        // async function handleFinal(message, universe, character){
        //     let checkedCharacter;

        //     try {
        //         // Call OpenAI function to check the character
        //         checkedCharacter = await openaiCheck.openaiCharacterCheck(message, universe, character);
        //     } catch (err) {
        //         console.error(err);
        //         return message.channel.send('There was an issue reaching the AI service.');
        //     }

        //     // Send initial message with AI response
        //     const characterCheckSentMessage = await message.channel.send(
        //         `Alright, is "${checkedUniverse}" the correct name? React with:
        //         ✔️ to confirm, 🔃 to use the original name, or ❌ to cancel.`
        //     );

        //     // Add initial reactions
        //     await characterCheckSentMessage.react('🔃');
        //     await characterCheckSentMessage.react('✔️');
        //     await characterCheckSentMessage.react('❌');

        //     // Filter for the initial reactions
        //     const reactionCharacterCheckCollectorFilter = (reaction, user) => {
        //         return ['✔️', '🔃', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        //     };

        //     const reactionCharacterCheckCollector = characterCheckSentMessage.createReactionCollector({
        //         filter: reactionCharacterCheckCollectorFilter,
        //         max: 1,
        //         time: 15000 // Timeout in 15 seconds
        //     });

        //     // Handle user's decision based on initial reactions
        //     reactionCharacterCheckCollector.on('collect', async (reaction) => {
        //         if (reaction.emoji.name === '✔️') {
        //             // Universe confirmed, proceed to character input
        //             await message.reply("Understood.");
        //             await handleCharacterInput(message, checkedUniverse);
        //         } else if (reaction.emoji.name === '🔃') {
        //             // Retry universe check
        //             await message.reply('Alright, using the original name.');
        //             // You could trigger another AI check here if needed
        //             checkedUniverse = universe;
        //             await handleCharacterInput(message, checkedUniverse); // Proceed anyway for now
        //         } else if (reaction.emoji.name === '❌') {
        //             // Cancel creation
        //             message.reply('Creation cancelled.');
        //         }
        //     });

        // }
    }
};

// module.exports = {
//     name: 'add',
//     description: 'Add universe to the DB',
//     async execute(message, args) {
//         if (!args[0]) {
//             return message.channel.send("Please provide a name for the universe.");
//         }

//         let universe = args[0];
//         let checkedUniverse;
//         try {
//             // Call OpenAI function to check the universe
//             checkedUniverse = await openaiCheck.openaiUniverseCheck(message, universe);
//         } catch (err) {
//             console.error(err);
//             return message.channel.send('There was an issue reaching the AI service.');
//         }

//         // Send initial message with AI response
//         const universeCheckSentMessage = await message.channel.send(
//             `Alright, is "${checkedUniverse}" the correct universe? React with:
//             ✔️ to confirm, 🔃 to retry checking the universe, or ❌ to cancel.`
//         );

//         // Add initial reactions
//         await universeCheckSentMessage.react('🔃');
//         await universeCheckSentMessage.react('✔️');
//         await universeCheckSentMessage.react('❌');

//         // Filter for the initial reactions
//         const reactionInitialCollectorFilter = (reaction, user) => {
//             return ['✔️', '🔃', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
//         };

//         const reactionInitialCollector = universeCheckSentMessage.createReactionCollector({
//             filter: reactionInitialCollectorFilter,
//             max: 1,
//             time: 15000 // Timeout in 15 seconds
//         });

//         // Handle user's decision based on initial reactions
//         reactionInitialCollector.on('collect', async (reaction) => {
//             if (reaction.emoji.name === '✔️') {
//                 // Universe confirmed, proceed to character input
//                 await message.reply("Understood.");
//                 await handleCharacterInput(message, checkedUniverse);
//             } else if (reaction.emoji.name === '🔃') {
//                 // Retry universe check
//                 await message.reply('Alright, using the original name.');
//                 // You could trigger another AI check here if needed
//                 checkedUniverse = universe;
//                 await handleCharacterInput(message, checkedUniverse); // Proceed anyway for now
//             } else if (reaction.emoji.name === '❌') {
//                 // Cancel creation
//                 message.reply('Creation cancelled.');
//             }
//         });

//         reactionInitialCollector.on('end', (collected, reason) => {
//             if (reason === 'time' && collected.size === 0) {
//                 message.reply('I shall not wait any further. Creation cancelled.');
//             }
//         });

//         // Function to handle character input or reactions
//         async function handleCharacterInput(message, universe) {
//             const characterPromptMessage = await message.channel.send(
//                 `Now who did you see in ${universe}? React with ❓ if you don't know their name.`
//             );
//             await characterPromptMessage.react('❓');
//             await characterPromptMessage.react('❌');

//             const reactionCharacterCollectorFilter = (reaction, user) => {
//                 return ['❓', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
//             };

//             const messageCollectorFilter = (msg) => {
//                 return msg.author.id === message.author.id;
//             };

//             const reactionCharacterCollector = characterPromptMessage.createReactionCollector({
//                 filter: reactionCharacterCollectorFilter,
//                 max: 1,
//                 time: 15000 // Timeout in 15 seconds
//             });

//             const messageCollector = message.channel.createMessageCollector({
//                 filter: messageCollectorFilter,
//                 max: 1,
//                 time: 15000 // Timeout in 15 seconds
//             });

//             // Handle character reaction (❓ or ❌)
//             reactionCharacterCollector.on('collect', (reaction) => {
//                 if (reaction.emoji.name === '❓') {
//                     message.reply("It seems like you don't know the name of the character...");
//                     addDB.addDB(message, universe, '???');
//                 } else if (reaction.emoji.name === '❌') {
//                     message.reply('Creation cancelled.');
//                 }
//                 reactionCharacterCollector.stop();
//                 messageCollector.stop();
//             });

//             // Handle user input for character name
//             messageCollector.on('collect', async (msg) => {
//                 let checkedCharacter;
//                 try {
//                     // Call OpenAI function to check the character name
//                     checkedCharacter = await openaiCheck.openaiCharacterCheck(message, checkedUniverse, msg.content);
//                 } catch (err) {
//                     console.error(err);
//                     return message.channel.send('There was an issue reaching the AI service.');
//                 }

//                 // Send confirmation to user
//                 await message.reply(`Adding "${checkedCharacter}" to "${universe}".`);
//                 addDB.addDB(message, universe, checkedCharacter);
//                 reactionCharacterCollector.stop();
//                 messageCollector.stop();
//             });

//             reactionCharacterCollector.on('end', (collected, reason) => {
//                 if (reason === 'time') {
//                     message.reply('I shall not wait any further. Creation cancelled.');
//                 }
//             });
//         }
//     }
// };
