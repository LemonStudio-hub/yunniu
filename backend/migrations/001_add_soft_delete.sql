-- 迁移文件：添加软删除机制
-- 为关键表添加 deleted_at 字段

-- 为 users 表添加 deleted_at 字段
ALTER TABLE users ADD COLUMN deleted_at DATETIME;

-- 为 posts 表添加 deleted_at 字段
ALTER TABLE posts ADD COLUMN deleted_at DATETIME;

-- 为 comments 表添加 deleted_at 字段
ALTER TABLE comments ADD COLUMN deleted_at DATETIME;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);