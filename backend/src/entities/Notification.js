import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Notification",
  tableName: "notifications",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    user_id: {
      type: Number,
    },
    from_user_id: {
      type: Number,
    },
    type: {
      type: String, // 'like', 'comment', 'follow', 'message'
    },
    project_id: {
      type: Number,
      nullable: true,
    },
    message: {
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
  },
});
