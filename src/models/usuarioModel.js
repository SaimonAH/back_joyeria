const supabase = require('../config/supabaseConfig');

const usuarioModel = {
  // AUTENTICACIÓN
  // Busca un usuario por su email para el proceso de login
  login: async (email) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  },

  // CREACIÓN DE USUARIO
  // Inserta un nuevo usuario en la base de datos
  crear: async (userData) => {
    const { data, error } = await supabase
      .from('usuarios')
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
  // Elimina un usuario de la base de datos
  eliminar: async (id) => {
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);
    return { error };
  },

  // OBTENCIÓN DE USUARIO INDIVIDUAL
  // Recupera la información de un usuario específico
  obtenerUsuario: async (id) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("imagen_url")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // VERIFICACIÓN DE VENDEDOR
  // Comprueba si un usuario es un vendedor válido
  verificarVendedor: async (vendedorId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', vendedorId)
      .eq('rol', 'vendedor')
      .single();
    return { data, error };
  },

  // CREACIÓN DE RELACIÓN VENDEDOR-CLIENTE
  // Establece una relación entre un vendedor y un cliente
  crearRelacionVendedorCliente: async (vendedorId, clienteId) => {
    const { error } = await supabase
      .from('vendedores_clientes')
      .insert([{ vendedor_id: vendedorId, cliente_id: clienteId }]);
    return { error };
  },

  // SUBIDA DE IMAGEN
  // Sube una imagen al almacenamiento de Supabase
  subirImagen: async (fileName, fileBuffer, contentType) => {
    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(`uploads/${fileName}`, fileBuffer, {
        contentType: contentType
      });
    return { data, error };
  },

  // ELIMINACIÓN DE IMAGEN
  // Elimina una imagen del almacenamiento de Supabase
  eliminarImagen: async (imagePath) => {
    const { error } = await supabase.storage
      .from("imagenes")
      .remove([imagePath]);
    return { error };
  }
};

module.exports = usuarioModel;