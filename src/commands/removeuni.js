// import authorized_users from "../../config.json";
const removeDB = require('../utils/removeDB');

module.exports = {
    name: 'removeuni',
    description: 'Remove universe from DB',
    async execute(message, args) {
        if(!args[0]) {
            return message.channel.send("Please provide a name for the universe.");
        }

        const universeId = args[0];

        removeDB.removeDB(message, universeId, 'u');
    }
};