import { Hono } from 'hono'
import type { Env } from '../types'
import { CategoryService } from '../services/categoryService'

const categoriesRouter = new Hono<{ Bindings: Env }>()

categoriesRouter.get('/', async (c) => {
  try {
    const categoryService = new CategoryService(c.env.DB)
    const categories = await categoryService.findAll()
    return c.json(categories)
  } catch (error: any) {
    return c.json({ error: error.message || '获取分类列表失败' }, 500)
  }
})

categoriesRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const categoryService = new CategoryService(c.env.DB)
    const category = await categoryService.findById(id)

    if (!category) {
      return c.json({ error: '分类不存在' }, 404)
    }

    return c.json(category)
  } catch (error: any) {
    return c.json({ error: error.message || '获取分类失败' }, 500)
  }
})

export default categoriesRouter