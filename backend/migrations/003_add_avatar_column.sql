-- 迁移文件：为用户表添加头像字段

-- 为 users 表添加 avatar 字段（可为空）
ALTER TABLE users ADD COLUMN avatar TEXT;

-- 为现有用户设置默认头像
UPDATE users SET avatar = 'https://ui-avatars.com/api/?name=User&background=random&color=fff' WHERE avatar IS NULL;
