const supabase = require("../config/supabaseConfig");

const usuarioModel = {
  // AUTENTICACIÓN
  // Busca un usuario por su email para el proceso de login
  login: async (email) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();
    return { data, error };
  },

  // CREACIÓN DE USUARIO
  // Inserta un nuevo usuario en la base de datos
  crear: async (userData) => {
    const { data, error } = await supabase
      .from("usuarios")
      .insert([userData])
      .select();
    return { data, error };
  },

  // OBTENCIÓN DE USUARIOS
  // Recupera todos los usuarios, opcionalmente filtrados por rol
  obtenerTodos: async (rol) => {
    const query = supabase.from("usuarios").select("*");
    if (rol) {
      query.eq("rol", rol);
    }
    return await query;
  },

  obtenerClientesDeVendedor: async (vendedorId) => {
    const { data, error } = await supabase
      .from('vendedores_clientes')
      .select(`
        cliente:cliente_id (
          id,
          nombre,
          email,
          imagen_url
        )
      `)
      .eq('vendedor_id', vendedorId);

    if (error) {
      return { data: null, error };
    }

    // Transformar los datos para obtener solo la información del cliente
    const clientes = data.map(item => item.cliente);
    return { data: clientes, error: null };
  },

  // ACTUALIZACIÓN DE USUARIO
  // Actualiza los datos de un usuario específico
  actualizar: async (id, updateData) => {
    const { data, error } = await supabase
      .from("usuarios")
      .update(updateData)
      .eq("id", id)
      .select();
    return { data, error };
  },

  // ELIMINACIÓN DE USUARIO
  eliminar: async (id) => {
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);
    return { error };
  },

  // OBTENCIÓN DE USUARIO INDIVIDUAL
  obtenerUsuario: async (id) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // VERIFICACIÓN DE VENDEDOR
  // Comprueba si un usuario es un vendedor válido
  verificarVendedor: async (vendedorId) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", vendedorId)
      .eq("rol", "vendedor")
      .single();
    return { data, error };
  },

  // CREACIÓN DE RELACIÓN VENDEDOR-CLIENTE
  // Establece una relación entre un vendedor y un cliente
  crearRelacionVendedorCliente: async (vendedorId, clienteId) => {
    const { error } = await supabase
      .from("vendedores_clientes")
      .insert([{ vendedor_id: vendedorId, cliente_id: clienteId }]);
    return { error };
  },

  // SUBIDA DE IMAGEN
  // Sube una imagen al almacenamiento de Supabase
  subirImagen: async (fileName, fileBuffer, contentType) => {
    try {
      const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(`uploads/${fileName}`, fileBuffer, {
          contentType: contentType
        });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return { data: null, error };
    }
  },

  // ELIMINACIÓN DE IMAGEN
  eliminarImagen: async (imagePath) => {
    const { error } = await supabase.storage
      .from("imagenes")
      .remove([imagePath]);
    return { error };
  },
};

module.exports = usuarioModel;
