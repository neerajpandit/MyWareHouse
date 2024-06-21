import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: String,
    recipientId: String,
    timestamp: Date,
    content: String,
    status: String,
    conversationId: String,
    reactions: [String],
    threadId: String,
    forwardedFrom: String,
  });
  
export const Message = mongoose.model("Message", messageSchema);