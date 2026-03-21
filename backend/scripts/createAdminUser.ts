import { UserService } from '../src/services/userService'
import { createMockD1Database } from '../src/__tests__/helpers/db'
import { initJWT } from '../src/utils/jwt'

async function createAdminUser() {
  try {
    // 初始化 JWT
    const jwtSecret = 'Yq3t6w9z$C&F)J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkYp3s6v9y$B&E)H@McQfTjWnZr4u7x!A%C*F-JaNdRgUkXp2s5v8y/B?E(H+MbQeThVmYq3t6w9z$C&F)J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkYp3s6v9y'
    initJWT(jwtSecret)

    // 获取数据库连接
    const db = createMockD1Database()
    const userService = new UserService(db)

    // 管理员用户信息
    const adminUser = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin@123456',
      role: 'admin' as const
    }

    // 检查用户是否已存在
    const existingUser = await userService.findByEmail(adminUser.email)
    if (existingUser) {
      console.log('管理员用户已存在:', existingUser.username)
      return
    }

    // 创建管理员用户
    const result = await userService.create(adminUser)
    console.log('管理员用户创建成功:')
    console.log('用户名:', result.user.username)
    console.log('邮箱:', result.user.email)
    console.log('角色:', result.user.role)
    console.log('令牌:', result.token)
  } catch (error) {
    console.error('创建管理员用户失败:', error)
  }
}

createAdminUser()
