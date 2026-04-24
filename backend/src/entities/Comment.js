import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Comment",
  tableName: "comments",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    user_id: {
      type: Number,
    },
    project_id: {
      type: Number,
    },
    content: {
      type: String,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});
