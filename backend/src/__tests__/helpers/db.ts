import type { D1Database } from '@cloudflare/workers-types'

export function createMockD1Database(): D1Database {
  const tables: Map<string, any[]> = new Map()

  const db = {
    tables,

    prepare: (sql: string) => {
      const tableName = extractTableName(sql)
      const operation = extractOperation(sql)

      return {
        bind: (...params: any[]) => {
          return {
            first: async <T = any>() => {
              const rows = tables.get(tableName) || []

              if (operation === 'SELECT') {
                if (sql.includes('WHERE email = ?')) {
                  return rows.find((r: any) => r.email === params[0]) as T
                }
                if (sql.includes('WHERE username = ?')) {
                  return rows.find((r: any) => r.username === params[0]) as T
                }
                if (sql.includes('WHERE id = ?')) {
                  return rows.find((r: any) => r.id === params[0]) as T
                }
                if (sql.includes('WHERE user_id = ?')) {
                  if (sql.includes('is_read = 0')) {
                    return rows.find((r: any) => r.user_id === params[0] && !r.is_read) as T
                  }
                  return rows.find((r: any) => r.user_id === params[0]) as T
                }
                if (sql.includes('WHERE post_id = ?')) {
                  return rows.find((r: any) => r.post_id === params[0]) as T
                }
                return rows[0] as T
              }

              return null
            },
            all: async <T = any>() => {
              const rows = tables.get(tableName) || []
              let filteredRows = [...rows]

              if (operation === 'SELECT') {
                if (sql.includes('WHERE post_id = ?')) {
                  filteredRows = rows.filter((r: any) => r.post_id === params[0])
                }
                if (sql.includes('WHERE user_id = ?')) {
                  filteredRows = rows.filter((r: any) => r.user_id === params[0])
                  if (sql.includes('is_read = 0')) {
                    filteredRows = filteredRows.filter((r: any) => !r.is_read)
                  }
                }
                if (sql.includes('WHERE category_id = ?')) {
                  filteredRows = rows.filter((r: any) => r.category_id === params[0])
                }
                if (sql.includes('WHERE author_id = ?')) {
                  filteredRows = rows.filter((r: any) => r.author_id === params[0])
                }
              }

              return { results: filteredRows as T[] }
            },
            run: async () => {
              if (operation === 'INSERT') {
                const newRecord = {
                  id: params[0],
                  ...createRecordFromParams(tableName, params),
                }
                const currentRows = tables.get(tableName) || []
                tables.set(tableName, [...currentRows, newRecord])
              } else if (operation === 'UPDATE') {
                const currentRows = tables.get(tableName) || []
                const updatedRows = currentRows.map((row: any) => {
                  if (row.id === params[params.length - 1]) {
                    return { ...row, updated_at: new Date().toISOString() }
                  }
                  return row
                })
                tables.set(tableName, updatedRows)
              } else if (operation === 'DELETE') {
                const currentRows = tables.get(tableName) || []
                const filteredRows = currentRows.filter((row: any) => row.id !== params[0])
                tables.set(tableName, filteredRows)
              }
              return { success: true, meta: {} }
            },
          }
        },
      }
    },
    batch: async (statements: any[]) => {
      return statements.map(() => ({ success: true, meta: {} }))
    },
    exec: async (sql: string) => {
      return { success: true, meta: {} }
    },
    dump: async () => {
      return ''
    },
  }

  return db as unknown as D1Database
}

function extractTableName(sql: string): string {
  const match = sql.match(/FROM\s+(\w+)/i) || sql.match(/INSERT INTO\s+(\w+)/i) || sql.match(/UPDATE\s+(\w+)/i) || sql.match(/DELETE FROM\s+(\w+)/i)
  return match ? match[1].toLowerCase() : 'unknown'
}

function extractOperation(sql: string): string {
  if (sql.trim().startsWith('SELECT')) return 'SELECT'
  if (sql.trim().startsWith('INSERT')) return 'INSERT'
  if (sql.trim().startsWith('UPDATE')) return 'UPDATE'
  if (sql.trim().startsWith('DELETE')) return 'DELETE'
  return 'UNKNOWN'
}

function createRecordFromParams(tableName: string, params: any[]): any {
  if (tableName === 'users') {
    return {
      username: params[1],
      email: params[2],
      password_hash: params[3],
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  if (tableName === 'posts') {
    return {
      title: params[1],
      content: params[2],
      author_id: params[3],
      category_id: params[4],
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  if (tableName === 'comments') {
    return {
      post_id: params[1],
      author_id: params[2],
      content: params[3],
      parent_id: params[4] || null,
      like_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  if (tableName === 'notifications') {
    return {
      user_id: params[1],
      type: params[2],
      title: params[3],
      message: params[4],
      link: params[5] || null,
      is_read: false,
      created_at: new Date().toISOString(),
    }
  }
  if (tableName === 'categories') {
    return {
      name: params[1],
      description: params[2] || null,
      created_at: new Date().toISOString(),
    }
  }
  if (tableName === 'post_tags') {
    return {
      post_id: params[1],
      tag_id: params[2],
    }
  }
  if (tableName === 'tags') {
    return {
      name: params[1],
      created_at: new Date().toISOString(),
    }
  }
  if (tableName === 'likes') {
    return {
      user_id: params[1],
      target_id: params[2],
      target_type: params[3],
      created_at: new Date().toISOString(),
    }
  }
  return {}
}

export function setupMockData(db: any, tableName: string, data: any[]) {
  db.tables.set(tableName, data)
}