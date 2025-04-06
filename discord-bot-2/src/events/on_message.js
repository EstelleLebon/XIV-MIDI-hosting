import MessageCheck from "../classes/messagecheck/messagecheck.js";

async function check_message(message) {
    const msg = new MessageCheck(message);
    msg.check_message()
        .then(() => {
            msg.logger.info('Message processed successfully');
        })
        .catch(err => {
            msg.logger.error(`Error processing message: ${err}`);
        });
}

export default check_message;