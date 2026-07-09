import { Router } from 'express'
import { categoriaController, subcategoriaController } from '../controllers/catalogController'
import { requireAuth, requireAdmin } from '../middlewares/auth'

const router = Router()

router.get('/categorias', categoriaController.list)
router.post('/categorias', requireAuth, requireAdmin, categoriaController.create)
router.patch('/categorias/:id', requireAuth, requireAdmin, categoriaController.update)
router.delete('/categorias/:id', requireAuth, requireAdmin, categoriaController.remove)

router.get('/subcategorias', subcategoriaController.list)
router.post('/subcategorias', requireAuth, requireAdmin, subcategoriaController.create)
router.patch('/subcategorias/:id', requireAuth, requireAdmin, subcategoriaController.update)
router.delete('/subcategorias/:id', requireAuth, requireAdmin, subcategoriaController.remove)

export default router
