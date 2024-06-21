import { asyncHandler } from "../utils/asyncHandler.js";
import { Message } from "../models/Chat.model.js";

const handleSocketConnection = (io) => {
    io.on("connection", (socket) => {
      console.log("a user connected");
  
      socket.on("sendMessage", async (msg) => {
        const newMessage = new Message({
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          timestamp: new Date(),
          content: msg.content,
          status: "sent",
          conversationId: msg.conversationId,
          reactions: [],
          threadId: msg.threadId,
          forwardedFrom: msg.forwardedFrom,
        });
  
        try {
          const savedMessage = await newMessage.save();
          io.emit("message", savedMessage);
        } catch (error) {
          console.error("Error saving message", error);
        }
      });
  
      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  };
  
  // Chat controller to handle fetching messages
  const chat = asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      });
      res.json(messages);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  export { chat, handleSocketConnection };