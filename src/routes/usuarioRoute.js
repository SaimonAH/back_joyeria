const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/authMiddleware');

// RUTAS DE USUARIO
// Define las rutas para las operaciones CRUD de usuarios

// Ruta de inicio de sesión
router.post('/login', usuarioController.login);

// Ruta para crear un nuevo usuario (requiere autenticación)
router.post('/', verificarToken, upload.single('imagen'), usuarioController.crear);

// Ruta para obtener todos los usuarios (requiere autenticación)
router.get('/', verificarToken, usuarioController.obtenerTodos);

// Ruta para actualizar un usuario (requiere autenticación)
router.put('/:id', verificarToken, upload.single('imagen'), usuarioController.actualizar);

// Ruta para eliminar un usuario (requiere autenticación)
router.delete('/:id', verificarToken, usuarioController.eliminar);

// Ruta para obtener todos los clientes de un vendedor (requiere autenticación)
router.get('/vendedor/:vendedorId/clientes', verificarToken, usuarioController.obtenerClientesDeVendedor);

module.exports = router;