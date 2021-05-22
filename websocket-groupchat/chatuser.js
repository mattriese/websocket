/** Functionality related to chatting. */

// Room is an abstraction of a chat channel
const Room = require("./Room");

/** ChatUser is a individual connection from client -> server to chat. */

class ChatUser {
  /** Make chat user: store connection-device, room.
   *
   * @param send {function} callback to send message to this user
   * @param room {Room} room user will be in
   * */

  constructor(send, roomName) {
    this._send = send; // "send" function for this user
    this.room = Room.get(roomName); // room user will be in
    this.name = null; // becomes the username of the visitor

    console.log(`created chat in ${this.room.name}`);
  }

  /** Send msgs to this client using underlying connection-send-function.
   *
   * @param data {string} message to send
   * */

  send(data) {
    try {
      this._send(data);
    } catch {
      // If trying to send to a user fails, ignore it
    }
  }

  /** Handle joining: add to room members, announce join.
   *
   * @param name {string} name to use in room
   * */

  handleJoin(name) {
    this.name = name;
    this.room.join(this);
    this.room.broadcast({
      type: "note",
      text: `${this.name} joined "${this.room.name}".`,
    });
  }

  /** Handle a chat: broadcast to room.
   *
   * @param text {string} message to send
   * */

  handleChat(text) {
    this.room.broadcast({
      name: this.name,
      type: "chat",
      text: text,
    });
  }

  /** Handle messages from client:
   *
   * @param jsonData {string} raw message data
   *
   * @example<code>
   * - {type: "join", name: username} : join
   * - {type: "chat", text: msg }     : chat
   * </code>
   */

  handleMessage(jsonData) {
    console.log("handleMessage", jsonData)
    let msg = JSON.parse(jsonData);
    console.log("msg", msg)

    if (msg.type === "join") this.handleJoin(msg.name);
    else if (msg.type === "chat") this.handleChat(msg.text);
    else if (msg.type === "joke") this.handleJoke();
    else if (msg.type === "private") this.handlePrivateMessage(msg.recipient, msg.text);
    else if (msg.type === "members") this.handleMemberList();
    else throw new Error(`bad message: ${msg.type}`);
  }

  /** Connection was closed: leave room, announce exit to others. */

  handleClose() {
    this.room.leave(this);
    this.room.broadcast({
      type: "note",
      text: `${this.name} left ${this.room.name}.`,
    });
  }
  /** Handles a joke by sending joke to user
  * @param jsonData {type: "joke"} 
  * returns {type: "note", text: "joke here", name: "Server"}
  */
  handleJoke() {
    //for (let member of this.members) {
    this.send(JSON.stringify({
      type: "note",
      text: "What do you call eight hobbits? A hob-byte!",
      name: "Server"
    }));
  }

  /** Handles a request for a list of users in room. sends back to user
  * @param jsonData {type: "members"} 
  * returns {type: "note", text: "list of members", name: "Server"}
  */
  handleMemberList() {
    console.log("handleMemberList");
    const members = this.room.members;
    let membersList = "";
    for (let member of members) {
      membersList = membersList + " " + member.name;
    }
    this.send(JSON.stringify({
      type: "note",
      text: membersList,
      name: "Server"
    }));
  }

  handlePrivateMessage(recipient, text) {
    console.log("handlePrivateMessage")
    const members = this.room.members;

    for (let member of members) {
      if (member.name === recipient) {
        member.send(JSON.stringify({
          type: "chat",
          text,
          name: "FakeName"
        }));
      }
    }
  }
}



module.exports = ChatUser;
