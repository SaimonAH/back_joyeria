const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const verificarToken = require("../middlewares/authMiddleware");

// RUTAS DE PEDIDOS
// Define las rutas para las operaciones CRUD de pedidos

// Ruta para crear un nuevo pedido (requiere autenticación)
router.post("/", verificarToken, pedidoController.crear);

// Ruta para obtener todos los pedidos (requiere autenticación)
router.get("/", verificarToken, pedidoController.obtenerTodos);

// Ruta para obtener un pedido específico (requiere autenticación)
router.get("/:id", verificarToken, pedidoController.obtenerPorId);

// Ruta para actualizar un pedido (requiere autenticación)
router.put("/:id", verificarToken, pedidoController.actualizar);

// Ruta para eliminar un pedido (requiere autenticación)
router.delete("/:id", verificarToken, pedidoController.eliminar);

// Ruta para actualizar el estado de un pedido (requiere autenticación)
router.put("/:id/estado", verificarToken, pedidoController.actualizarEstado);

// Ruta para cancelar un pedido (requiere autenticación)
router.put("/:id/cancelar", verificarToken, pedidoController.cancelarPedido);

// Ruta para reactivar un pedido (requiere autenticación)
router.put("/:id/reactivar", verificarToken, pedidoController.reactivarPedido);

// Nueva ruta para obtener todos los pedidos de los clientes de un vendedor (requiere autenticación)
router.get('/vendedor/:vendedorId', verificarToken, pedidoController.obtenerPedidosClientesVendedor);

module.exports = router;
