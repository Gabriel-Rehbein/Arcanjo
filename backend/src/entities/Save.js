import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Save",
  tableName: "saves",
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
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  uniques: [
    {
      columns: ["user_id", "project_id"],
    },
  ],
});
