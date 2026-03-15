interface ApiError {
  code: string
  message: string
  details?: string
}

// 错误代码映射
const ERROR_CODES = {
  // 认证错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // 验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // 资源错误
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  FORBIDDEN: 'FORBIDDEN',

  // 速率限制
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // 服务器错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
}

// 错误消息映射（不包含敏感信息）
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.UNAUTHORIZED]: '未授权访问',
  [ERROR_CODES.INVALID_TOKEN]: '无效的令牌',
  [ERROR_CODES.TOKEN_EXPIRED]: '令牌已过期',
  [ERROR_CODES.VALIDATION_ERROR]: '输入验证失败',
  [ERROR_CODES.INVALID_INPUT]: '无效的输入',
  [ERROR_CODES.MISSING_FIELD]: '缺少必要字段',
  [ERROR_CODES.NOT_FOUND]: '资源不存在',
  [ERROR_CODES.ALREADY_EXISTS]: '资源已存在',
  [ERROR_CODES.FORBIDDEN]: '权限不足',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: '请求过于频繁',
  [ERROR_CODES.INTERNAL_ERROR]: '服务器内部错误',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [ERROR_CODES.DATABASE_ERROR]: '数据库操作失败',
}

export class AppError extends Error {
  code: string
  statusCode: number
  details?: string

  constructor(code: string, statusCode: number = 500, details?: string) {
    super(ERROR_MESSAGES[code] || '未知错误')
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.name = 'AppError'
  }
}

// 创建错误实例的辅助函数
export const createError = {
  unauthorized: (details?: string) => new AppError(ERROR_CODES.UNAUTHORIZED, 401, details),
  invalidToken: (details?: string) => new AppError(ERROR_CODES.INVALID_TOKEN, 401, details),
  tokenExpired: (details?: string) => new AppError(ERROR_CODES.TOKEN_EXPIRED, 401, details),
  validationError: (details?: string) => new AppError(ERROR_CODES.VALIDATION_ERROR, 400, details),
  invalidInput: (details?: string) => new AppError(ERROR_CODES.INVALID_INPUT, 400, details),
  missingField: (details?: string) => new AppError(ERROR_CODES.MISSING_FIELD, 400, details),
  notFound: (details?: string) => new AppError(ERROR_CODES.NOT_FOUND, 404, details),
  alreadyExists: (details?: string) => new AppError(ERROR_CODES.ALREADY_EXISTS, 409, details),
  forbidden: (details?: string) => new AppError(ERROR_CODES.FORBIDDEN, 403, details),
  rateLimitExceeded: (details?: string) => new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 429, details),
  internalError: (details?: string) => new AppError(ERROR_CODES.INTERNAL_ERROR, 500, details),
  serviceUnavailable: (details?: string) => new AppError(ERROR_CODES.SERVICE_UNAVAILABLE, 503, details),
  databaseError: (details?: string) => new AppError(ERROR_CODES.DATABASE_ERROR, 500, details),
}

// 错误处理函数
export function handleError(error: unknown): ApiError {
  // 如果是我们定义的 AppError
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    }
  }

  // 如果是标准的 JavaScript 错误
  if (error instanceof Error) {
    // 在生产环境中，不返回详细的错误信息
    const environment = (globalThis as any).ENVIRONMENT || 'development'
    if (environment === 'production') {
      return {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
      }
    }

    // 在开发环境中，返回错误详情
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message,
      details: error.stack,
    }
  }

  // 未知错误
  return {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
  }
}

// 格式化错误响应
export function formatErrorResponse(error: ApiError, statusCode: number = 500) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
    timestamp: new Date().toISOString(),
  }
}

// 日志记录函数（在生产环境中应该使用专业的日志服务）
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const errorInfo = handleError(error)

  console.error(`[${timestamp}] ${context || 'Error'}:`, {
    code: errorInfo.code,
    message: errorInfo.message,
    ...(errorInfo.details && { details: errorInfo.details }),
    ...(error instanceof Error && { stack: error.stack }),
  })
}