import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Story",
  tableName: "stories",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    user_id: {
      type: Number,
    },
    image_url: {
      type: String,
    },
    content: {
      type: String,
      nullable: true,
    },
    expires_at: {
      type: "timestamp",
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});
