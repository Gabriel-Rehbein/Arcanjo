import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
  },
});
