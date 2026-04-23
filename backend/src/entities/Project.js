import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Project",
  tableName: "projects",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
      nullable: true,
    },
    user_id: {
      type: Number,
    },
  },
});
