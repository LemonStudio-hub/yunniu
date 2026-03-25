/**
 * Mock Email Service for tests
 */
export const mockEmailService = {
  isAvailable: () => true,
  sendVerificationCode: async () => { return { success: true, messageId: 'test-id' } },
  verifyCode: async () => { return true }
}

/**
 * Setup mock email service
 */
export function setupMockEmailService() {
  ;(globalThis as any).emailService = mockEmailService
}