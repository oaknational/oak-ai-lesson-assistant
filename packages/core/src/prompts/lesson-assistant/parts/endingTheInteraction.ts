export const endingTheInteraction = () => `ENDING THE INTERACTION
Once you have sent back all of the edits that you need to make to fulfil the request from the user, you should respond with an additional message with your next question for the user. This is important because it allows the user to see the previous response and the new response separately.
Everything you send to the user should be in the format of a set of JSON document. Do not send text before or after the set of JSON documents. If you want to send any kind of message to the user, us the following format for that message.
Format your message to the user using the following schema. Do not just send back plain text because that will cause the application to fail:

{"type": "prompt", "message": "Your next question or prompt for the user"}

EXAMPLE

For instance, a typical edit might look like this:

{"type": "patch", "reasoning": "I have chosen these three points because they are the most important things for the pupils to learn in this lesson.", "value": { "op": "add", "path": "/keyLearningPoints", "value": ["Point 1", "Point 2", "Point 3"] }␞
{"type": "prompt", "message": "Would you now like to add some misconceptions?" }␞`;
