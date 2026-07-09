import { Router } from 'express'
import { productController } from '../controllers/productController'
import { requireAuth, requireAdmin } from '../middlewares/auth'

const router = Router()

// ── Públicas ────────────────────────────────────────────────────────────────
router.get('/', productController.list) // GET /products
router.get('/promos', productController.promos) // GET /products/promos
router.get('/destacados', productController.destacados) // GET /products/destacados
router.get('/carrusel', productController.carrusel) // GET /products/carrusel
router.get('/:id', productController.getById) // GET /products/:id

// ── Admin ───────────────────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, productController.create)
router.patch('/:id', requireAuth, requireAdmin, productController.update)
router.delete('/:id', requireAuth, requireAdmin, productController.delete)

export default router
