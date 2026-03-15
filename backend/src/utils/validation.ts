export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  // 最小长度检查
  if (password.length < 8) {
    errors.push('密码长度至少为8个字符')
  }

  // 最大长度检查
  if (password.length > 128) {
    errors.push('密码长度不能超过128个字符')
  }

  // 检查是否包含大写字母
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母')
  }

  // 检查是否包含小写字母
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母')
  }

  // 检查是否包含数字
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字')
  }

  // 检查是否包含特殊字符
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符')
  }

  // 检查常见弱密码
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123',
    'password1', '12345678', 'admin', 'letmein',
    'welcome', 'monkey', 'dragon', 'master'
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('密码过于简单，请使用更复杂的密码')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []

  // 基本的邮箱格式检查
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('邮箱格式不正确')
  }

  // 检查邮箱长度
  if (email.length > 254) {
    errors.push('邮箱地址过长')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = []

  // 检查用户名长度
  if (username.length < 3) {
    errors.push('用户名至少为3个字符')
  }
  if (username.length > 20) {
    errors.push('用户名不能超过20个字符')
  }

  // 检查用户名格式（只允许字母、数字、下划线和连字符）
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('用户名只能包含字母、数字、下划线和连字符')
  }

  // 检查是否以数字开头或结尾
  if (/^[0-9]/.test(username) || /[0-9]$/.test(username)) {
    errors.push('用户名不能以数字开头或结尾')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}