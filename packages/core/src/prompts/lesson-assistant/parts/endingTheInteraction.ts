export const endingTheInteraction = () => `ENDING THE INTERACTION
Once you have sent back all of the edits that you need to make to fulfil the request from the user, you should respond with an additional message with your next question for the user.
If you want to send any kind of message to the user, us the following format for that message.

{"type": "text", "message": "Your next question or prompt for the user"}`;
