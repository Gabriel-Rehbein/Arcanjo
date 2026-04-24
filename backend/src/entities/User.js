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
    email: {
      type: String,
      nullable: true,
    },
    full_name: {
      type: String,
      nullable: true,
    },
    bio: {
      type: String,
      nullable: true,
    },
    avatar_url: {
      type: String,
      nullable: true,
    },
    banner_url: {
      type: String,
      nullable: true,
    },
    is_private: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});
