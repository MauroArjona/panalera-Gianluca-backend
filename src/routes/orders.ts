import { Router } from 'express'
import { orderController } from '../controllers/orderController'
import { requireAuth, requireAdmin } from '../middlewares/auth'

const router = Router()

// ── Públicas ────────────────────────────────────────────────────────────────
router.get('/', orderController.list) // GET /orders
router.get('/estado/:estado', orderController.listByEstado) // GET /orders/estado/:estado
router.get('/:id', orderController.getById) // GET /orders/:id
router.post('/', orderController.create) // POST /orders

// ── Admin ───────────────────────────────────────────────────────────────────
router.patch('/:id/status', requireAuth, requireAdmin, orderController.updateStatus) // PATCH /orders/:id/status

export default router
