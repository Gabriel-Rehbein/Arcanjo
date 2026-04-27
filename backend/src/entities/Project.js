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
      nullable: true,
    },
    image_url: {
      type: String,
      nullable: true,
    },
    category: {
      type: String,
      nullable: true,
    },
    tags: {
      type: String,
      nullable: true, // JSON string de tags
    },
    link: {
      type: String,
      nullable: true,
    },
    is_public: {
      type: Boolean,
      default: true,
    },
    likes_count: {
      type: Number,
      default: 0,
    },
    comments_count: {
      type: Number,
      default: 0,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
      },
      nullable: true,
    },
  },
});
