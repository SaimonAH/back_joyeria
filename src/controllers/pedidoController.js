const pedidoModel = require("../models/pedidoModel");

const pedidoController = {
  // CREACIÓN DE PEDIDO
  // Maneja la creación de un nuevo pedido
  crear: async (req, res) => {
    const { cliente_id, ...pedidoData } = req.body;

    // Verificar que cliente_id esté presente
    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id es requerido para crear un pedido' });
    }
    
    // Verificar si el cliente existe
    const { cliente, error: clienteError } = await pedidoModel.verificarCliente(cliente_id);
    if (clienteError || !cliente) {
      return res.status(400).json({ error: clienteError ? clienteError.message : 'Cliente no encontrado o inválido.' });
    }

    // Crear el pedido
    const { data, error } = await pedidoModel.crear({ 
      cliente_id, 
      ...pedidoData, 
      estado: 'solicitado' 
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data[0]);
  },

  // OBTENCIÓN DE PEDIDOS
  // Recupera todos los pedidos o los pedidos de un cliente específico
  obtenerTodos: async (req, res) => {
    const { cliente_id } = req.query;
    const { data, error } = await pedidoModel.obtenerTodos(cliente_id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
  },

  // OBTENCIÓN DE UN PEDIDO ESPECÍFICO
  // Recupera un pedido por su ID
  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    const { data, error } = await pedidoModel.obtenerPorId(id);
    if (error) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }
    res.status(200).json(data);
  },

  // ACTUALIZACIÓN DE PEDIDO
  // Maneja la actualización de un pedido existente
  actualizar: async (req, res) => {
    const { id } = req.params;
    const pedidoData = req.body;

    // Verificar el estado actual del pedido
    const { data: pedidoActual, error: fetchError } =
      await pedidoModel.obtenerPorId(id);
    if (fetchError) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    // Si el pedido está capturado, no se puede editar
    if (pedidoActual.estado === "capturado") {
      return res
        .status(400)
        .json({ error: "No se puede editar un pedido capturado." });
    }

    // Actualizar el pedido
    const { data, error } = await pedidoModel.actualizar(id, pedidoData);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data[0]);
  },

  // ELIMINACIÓN DE PEDIDO
  // Maneja la eliminación de un pedido
  eliminar: async (req, res) => {
    const { id } = req.params;
    const { error } = await pedidoModel.eliminar(id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json({ message: "Pedido eliminado exitosamente." });
  },
};

module.exports = pedidoController;
