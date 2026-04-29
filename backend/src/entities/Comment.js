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
    content: {
      type: String,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      eager: true,
    },
    project: {
      type: "many-to-one",
      target: "Project",
      joinColumn: { name: "project_id" },
      eager: false,
    },
  },
});