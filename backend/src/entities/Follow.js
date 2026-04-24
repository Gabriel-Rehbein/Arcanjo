import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Follow",
  tableName: "follows",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    follower_id: {
      type: Number,
    },
    following_id: {
      type: Number,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  uniques: [
    {
      columns: ["follower_id", "following_id"],
    },
  ],
});
