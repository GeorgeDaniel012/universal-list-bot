// Required imports
require('dotenv').config();
const OpenAIApi = require('openai');
const config = require('../../config.json'); // Adjust the path if needed

// Initialize OpenAI
// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_TOKEN,
// });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_TOKEN,
})

module.exports = {
    name: 'openaiCheck',
    description: 'Module using OpenAI to check names',
    async openaiUniverseCheck(message, query) {
        // Send a request to OpenAI to check the name
        try {
            const openaiResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // You can change this to another model if needed
                //prompt: `What is the name of this series or fandom? "${query}". Write just the name of the series or fandom.`,
                messages: [
                    {
                        role: "user",
                        content: `What is the name of this series or fandom? "${query}". Write just the name of the series or fandom.`,
                    },
                ],
                max_tokens: 100,
            });

            const aiResponse = openaiResponse.choices[0].message.content;
            //console.log(aiResponse);
            //message.channel.send(`AI Response: ${aiResponse}`);
            return aiResponse;
        } catch (error) {
            console.error('Error with OpenAI API:', error);
            message.channel.send('There was an issue reaching the AI service.');
        }
    },
    async openaiCharacterCheck(message, universe, query) {
        // Send a request to OpenAI to check the name
        try {
            const openaiResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // You can change this to another model if needed
                //prompt: `What is the name of this series or fandom? "${query}". Write just the name of the series or fandom.`,
                messages: [
                    {
                        role: "user",
                        content: `What is the name of this character from the series or fandom ${universe}? "${query}". Write just the name of the character.`,
                    },
                ],
                max_tokens: 100,
            });

            const aiResponse = openaiResponse.choices[0].message.content;
            //console.log(aiResponse);
            //message.channel.send(`AI Response: ${aiResponse}`);
            return aiResponse;
        } catch (error) {
            console.error('Error with OpenAI API:', error);
            message.channel.send('There was an issue reaching the AI service.');
        }
    }
};
