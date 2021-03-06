/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);


const name = prompt("Username?");


/** called when connection opens, sends join info to server. */

ws.onopen = function (evt) {
  console.log("open", evt);

  let data = { type: "join", name: name };
  ws.send(JSON.stringify(data));
};

/**
 *
 * define ws.onjoke to send {type: "get-joke"}
 */


/** called when msg received from server; displays it. */

ws.onmessage = function (evt) {
  console.log("message", evt);

  let msg = JSON.parse(evt.data);
  let item;

  if (msg.type === "note") {
    item = $(`<li><i>${msg.text}</i></li>`);
  } else if (msg.type === "chat") {
    item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
  } else {
    return console.error(`bad message Front End: ${msg}`);
  }

  $("#messages").append(item);
};


/** called on error; logs it. */

ws.onerror = function (evt) {
  console.error(`err ${evt}`);
};


/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
  console.log("close", evt);
};


/** send message when button pushed. */

$("form").submit(function (evt) {
  evt.preventDefault();

  // if ($("#m").val() === "/joke") {
  //   let joke  = $(`<li><i>"What do you call eight hobbits? A hob-byte!"</i></li>`);
  //   $("#messages").append(joke);
  //   return;
  // }
  let data;
  if ($("#m").val() === "/joke") {
    data = { type: "joke" };
    ws.send(JSON.stringify(data));
    return;
  }
  if ($("#m").val() === "/members") {
    data = { type: "members" };
    ws.send(JSON.stringify(data));
    return;
  }
  if ($("#m").val().startsWith("/priv ")) {
    console.log("/priv message seen")
    const message = $("#m").val();
    data = privMessageParser(message);
    console.log("data", data)

    ws.send(JSON.stringify(data));
    return;
  }

  data = { type: "chat", text: $("#m").val() };
  ws.send(JSON.stringify(data));

  $("#m").val("");
});


function privMessageParser(message) {
  console.log("privMessageParser")
  let messageArray = message.split(" ");
  const recipient = messageArray[1];
  const text = messageArray.splice(0, 2).join(" ");

  return { type: "private", recipient, text };
}
