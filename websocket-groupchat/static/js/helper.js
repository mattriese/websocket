"use strict";

/* Takes in a string and parses the command, the recipient, and the message
returns in json format */

function privMessageParser(message) {
  let messageArray = message.split(" ");
  const recipient = messageArray[1];
  const text = messageArray.splice(0, 2).join(" ");

  return { type: "private", recipient, text };
}