import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Message",
  tableName: "messages",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    sender_id: {
      type: Number,
    },
    receiver_id: {
      type: Number,
    },
    content: {
      type: String,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    edited_at: {
      type: "timestamp",
      nullable: true,
    },
    deleted_at: {
      type: "timestamp",
      nullable: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
});
