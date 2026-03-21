import type { User } from '../db/models'
import { generateId, hashPassword, verifyPassword } from '../utils/crypto'
import { generateToken } from '../utils/jwt'
import { createError } from '../utils/errorHandler'

export interface CreateUserInput {
  username: string
  email: string
  password: string
  role?: 'user' | 'admin' | 'moderator'
}

export interface LoginInput {
  email: string
  password: string
}

export class UserService {
  constructor(private db: D1Database) {}

  async create(input: CreateUserInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // 检查邮箱是否已存在
    const existingUser = await this.findByEmail(input.email)
    if (existingUser) {
      throw new Error('邮箱已被注册')
    }

    const id = generateId()
    const password_hash = await hashPassword(input.password)
    // 生成默认头像占位符（使用配置的头像服务）
    const avatarServiceUrl = process.env.AVATAR_SERVICE_URL || 'https://ui-avatars.com/api/'
    
    // 生成默认头像，确保正确处理查询参数
    const separator = avatarServiceUrl.includes('?') ? '&' : '?'
    const defaultAvatar = `${avatarServiceUrl}${separator}name=${encodeURIComponent(input.username)}&background=random&color=fff`

    await this.db
      .prepare('INSERT INTO users (id, username, email, password_hash, avatar, role) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, input.username, input.email, password_hash, defaultAvatar, input.role || 'user')
      .run()

    const user = await this.findById(id)
    if (!user) throw new Error('创建用户失败')

    const token = await generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    })

    const { password_hash: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  async login(input: LoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const result = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(input.email).first<User>()

    if (!result) {
      throw createError.unauthorized('邮箱或密码错误')
    }

    const isValid = await verifyPassword(input.password, result.password_hash)
    if (!isValid) {
      throw createError.unauthorized('邮箱或密码错误')
    }

    const token = await generateToken({
      userId: result.id,
      username: result.username,
      role: result.role,
    })

    const { password_hash: _, ...userWithoutPassword } = result
    return { user: userWithoutPassword, token }
  }

  async findById(id: string): Promise<User | null> {
    return this.db.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').bind(id).first<User>()
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.db.prepare('SELECT * FROM users WHERE username = ? AND deleted_at IS NULL').bind(username).first<User>()
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.prepare('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL').bind(email).first<User>()
  }

  async getPublicUser(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.findById(userId)
    if (!user) return null

    const { password_hash: _, ...publicUser } = user
    return publicUser
  }
}