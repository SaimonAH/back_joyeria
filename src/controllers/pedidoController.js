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

  // ACTUALIZACIÓN DE ESTADO DE PEDIDO
  actualizarEstado: async (req, res) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    // Verificar que el nuevo estado sea válido
    if (!['solicitado', 'descargado', 'capturado'].includes(nuevoEstado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // Obtener el estado actual del pedido
    const { data: pedidoActual, error: fetchError } = await pedidoModel.obtenerPorId(id);
    if (fetchError) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    // Verificar la transición de estado válida
    if (
      (pedidoActual.estado === 'solicitado' && nuevoEstado !== 'descargado') ||
      (pedidoActual.estado === 'descargado' && nuevoEstado !== 'capturado') ||
      pedidoActual.estado === 'capturado'
    ) {
      return res.status(400).json({ error: 'Transición de estado no permitida.' });
    }

    // Actualizar el estado del pedido
    const { data, error } = await pedidoModel.actualizarEstado(id, nuevoEstado);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data[0]);
  },

  // CANCELACIÓN DE PEDIDO
  cancelarPedido: async (req, res) => {
    const { id } = req.params;

    const { data, error } = await pedidoModel.cancelarPedido(id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json({ message: 'Pedido cancelado exitosamente.', pedido: data[0] });
  },

  // REACTIVACIÓN DE PEDIDO
  reactivarPedido: async (req, res) => {
    const { id } = req.params;

    const { data, error } = await pedidoModel.reactivarPedido(id);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json({ message: 'Pedido reactivado exitosamente.', pedido: data[0] });
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

  // OBTENCIÓN DE PEDIDOS DE CLIENTES DE UN VENDEDOR
  obtenerPedidosDeClientesDeVendedor: async (req, res) => {
    const { vendedorId } = req.params;
    try {
      const pedidos = await pedidoModel.obtenerPedidosDeClientesDeVendedor(vendedorId);
      res.status(200).json(pedidos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = pedidoController;
