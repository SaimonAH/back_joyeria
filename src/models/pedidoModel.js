const supabase = require("../config/supabaseConfig");

const pedidoModel = {
  // CREACIÓN DE PEDIDO
  // Crea un nuevo pedido en la base de datos
  crear: async (pedidoData) => {
    const { data, error } = await supabase
      .from("pedidos")
      .insert([pedidoData])
      .select();
    return { data, error };
  },

  // OBTENCIÓN DE TODOS LOS PEDIDOS
  // Recupera todos los pedidos, opcionalmente filtrados por cliente_id
  obtenerTodos: async (cliente_id) => {
    let query = supabase.from("pedidos").select("*");
    if (cliente_id) {
      query = query.eq("cliente_id", cliente_id);
    }
    const { data, error } = await query;
    return { data, error };
  },

  // OBTENCIÓN DE UN PEDIDO ESPECÍFICO
  // Recupera un pedido por su ID
  obtenerPorId: async (id) => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // ACTUALIZACIÓN DE PEDIDO
  // Actualiza un pedido existente
  actualizar: async (id, pedidoData) => {
    const { data, error } = await supabase
      .from("pedidos")
      .update(pedidoData)
      .eq("id", id)
      .select();
    return { data, error };
  },

  // ACTUALIZACIÓN DE ESTADO DE PEDIDO
  actualizarEstado: async (id, nuevoEstado) => {
    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado: nuevoEstado })
      .eq("id", id)
      .select();
    return { data, error };
  },

  // CANCELACIÓN DE PEDIDO
  cancelarPedido: async (id) => {
    const { data, error } = await supabase
      .from("pedidos")
      .update({ cancelado: true })
      .eq("id", id)
      .select();
    return { data, error };
  },

  // REACTIVACIÓN DE PEDIDO
  reactivarPedido: async (id) => {
    const { data, error } = await supabase
      .from("pedidos")
      .update({ cancelado: false })
      .eq("id", id)
      .select();
    return { data, error };
  },

  // ELIMINACIÓN DE PEDIDO
  // Elimina un pedido de la base de datos
  eliminar: async (id) => {
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    return { error };
  },

  // VERIFICACIÓN DE CLIENTE
  // Verifica si un usuario es un cliente válido
  verificarCliente: async (clienteId) => {
    if (!clienteId) {
      return { cliente: null, error: new Error("ID de cliente es requerido") };
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", clienteId)
      .eq("rol", "cliente")
      .single();

    if (data && !error) {
      return { cliente: data, error: null };
    } else {
      return {
        cliente: null,
        error: error || new Error("Cliente no encontrado"),
      };
    }
  },

  // OBTENCIÓN DE PEDIDOS DE CLIENTES DE UN VENDEDOR
  obtenerPedidosClientesVendedor: async (vendedorId) => {
    // Primero, obtenemos los IDs de los clientes del vendedor
    const { data: clientes, error: clientesError } = await supabase
      .from("vendedores_clientes")
      .select("cliente_id")
      .eq("vendedor_id", vendedorId);

    if (clientesError) {
      return { data: null, error: clientesError };
    }

    // Extraemos los IDs de los clientes
    const clienteIds = clientes.map((c) => c.cliente_id);

    // Ahora, obtenemos los pedidos de estos clientes
    const { data, error } = await supabase
      .from("pedidos")
      .select(
        `
      *,
      cliente:cliente_id (
        id,
        nombre,
        email
      )
    `
      )
      .in("cliente_id", clienteIds);

    return { data, error };
  },
};

module.exports = pedidoModel;
