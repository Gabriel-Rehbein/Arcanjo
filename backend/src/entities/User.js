import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'User',
  tableName: 'users',
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
    role: {
      type: String,
      nullable: true,
    },
    technologies: {
      type: String,
      nullable: true,
    },
    available_for_work: {
      type: Boolean,
      default: false,
    },
    github_url: {
      type: String,
      nullable: true,
    },
    linkedin_url: {
      type: String,
      nullable: true,
    },
    portfolio_url: {
      type: String,
      nullable: true,
    },
    resume_url: {
      type: String,
      nullable: true,
    },
    reputation: {
      type: Number,
      default: 0,
    },
    badges: {
      type: String,
      nullable: true,
    },
    selos: {
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
    is_bot: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
});
