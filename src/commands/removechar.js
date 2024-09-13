// import authorized_users from "../../config.json";
const removeDB = require('../utils/removeDB');

module.exports = {
    name: 'removechar',
    description: 'Remove all character apparitions from DB',
    async execute(message, args) {
        if(!args[0]) {
            return message.channel.send("Please provide a name for the character.");
        }

        const characterId = args[0];

        removeDB.removeDB(message, characterId, 'c');
    }
};