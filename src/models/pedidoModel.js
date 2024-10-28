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
      return { cliente: null, error: new Error('ID de cliente es requerido') };
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', clienteId)
      .eq('rol', 'cliente')
      .single();
    
    if (data && !error) {
      return { cliente: data, error: null };
    } else {
      return { cliente: null, error: error || new Error('Cliente no encontrado') };
    }
  },
};

module.exports = pedidoModel;
