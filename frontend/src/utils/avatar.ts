export const getDefaultAvatar = (username: string): string => {
  const baseUrl = import.meta.env.VITE_AVATAR_SERVICE_URL || 'https://ui-avatars.com/api/'
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}name=${encodeURIComponent(username || 'User')}&background=random&color=fff`
}
