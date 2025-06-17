import { Message } from "../graphql";

export function createDummyMessage(partials: Partial<Message>): Message {
  return {
    _id: "",
    role: "assistant",
    content: [{ type: "text", text: "" }],
    createdAt: new Date().toString(),
    attachments: [],
    branchId: "",
    index: 0,
    isEdited: false,
    ...partials,
  };
}
