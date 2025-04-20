import MessageCheck from "../classes/messagecheck/messagecheck.js";

async function check_message(message) {
    const msg = new MessageCheck(message);
    await msg.check_message()
}

export default check_message;