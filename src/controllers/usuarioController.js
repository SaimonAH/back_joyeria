const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

const usuarioController = {
  // INICIO DE SESIÓN
  // Maneja el proceso de autenticación de usuarios
  login: async (req, res) => {
    const { email, password } = req.body;
    const { data: usuario, error } = await usuarioModel.login(email);

    if (error || !usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    if (usuario.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1w' }
    );

    res.status(200).json({ token, usuario });
  },

  // CREACIÓN DE USUARIO
  // Maneja el proceso de registro de nuevos usuarios
  crear: async (req, res) => {
    try {
      const { nombre, email, password, rol, vendedorId } = req.body;
      let imagen_url = null;

      // Si hay un archivo de imagen, súbelo primero
      if (req.file) {
        const { buffer, originalname } = req.file;
        const fileName = `${Date.now()}_${originalname}`;
        const { data: imagenData, error: uploadError } = await usuarioModel.subirImagen(fileName, buffer, req.file.mimetype);

        if (uploadError) {
          return res.status(500).json({ error: 'Error al subir la imagen.' });
        }

        imagen_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/imagenes/${imagenData.path}`;
      }

      // Crear el usuario con la URL de la imagen
      const { data: usuario, error } = await usuarioModel.crear({ 
        nombre, 
        email, 
        password, 
        rol,
        imagen_url // Incluimos la URL de la imagen aquí
      });

      if (error) {
        // Si hubo un error al crear el usuario y se subió una imagen, elimínala
        if (imagen_url) {
          await usuarioModel.eliminarImagen(imagen_url.split('/').pop());
        }
        return res.status(400).json({ error: error.message });
      }

      if (rol === 'cliente') {
        const { data: vendedor, error: vendedorError } = await usuarioModel.verificarVendedor(vendedorId);

        if (vendedorError || !vendedor) {
          await usuarioModel.eliminar(usuario[0].id);
          if (imagen_url) {
            await usuarioModel.eliminarImagen(imagen_url.split('/').pop());
          }
          return res.status(400).json({ error: 'Vendedor no encontrado o inválido. Cliente eliminado.' });
        }

        const { error: relacionError } = await usuarioModel.crearRelacionVendedorCliente(vendedorId, usuario[0].id);

        if (relacionError) {
          await usuarioModel.eliminar(usuario[0].id);
          if (imagen_url) {
            await usuarioModel.eliminarImagen(imagen_url.split('/').pop());
          }
          return res.status(500).json({ error: 'Error al crear la relación cliente-vendedor. Cliente eliminado.' });
        }
      }

      res.status(201).json(usuario[0]);
    } catch (error) {
      console.error('Error en la creación de usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // OBTENCIÓN DE USUARIOS
  // Recupera la lista de usuarios, opcionalmente filtrada por rol
  obtenerTodos: async (req, res) => {
    const { rol } = req.query;
    const { data, error } = await usuarioModel.obtenerTodos(rol);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  },

  obtenerClientesDeVendedor: async (req, res) => {
    try {
      const { vendedorId } = req.params;

      // Verificar si el vendedor existe
      const { data: vendedor, error: vendedorError } = await usuarioModel.obtenerUsuario(vendedorId);

      if (vendedorError || !vendedor) {
        return res.status(404).json({ error: 'Vendedor no encontrado.' });
      }

      if (vendedor.rol !== 'vendedor') {
        return res.status(400).json({ error: 'El ID proporcionado no corresponde a un vendedor.' });
      }

      // Obtener los clientes del vendedor
      const { data: clientes, error } = await usuarioModel.obtenerClientesDeVendedor(vendedorId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json(clientes);
    } catch (error) {
      console.error('Error al obtener clientes del vendedor:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // ACTUALIZACIÓN DE USUARIO
  // Maneja la actualización de la información de un usuario
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, email, password } = req.body;

      // Obtener el usuario actual
      const { data: usuarioActual, error: fetchError } = await usuarioModel.obtenerUsuario(id);

      if (fetchError) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      let imagen_url = usuarioActual.imagen_url;

      // Si se proporciona una nueva imagen
      if (req.file) {
        // Eliminar la imagen anterior si existe
        if (imagen_url) {
          const imagePath = imagen_url.split("/storage/v1/object/public/imagenes/")[1];
          await usuarioModel.eliminarImagen(imagePath);
        }

        // Subir la nueva imagen
        const { buffer, originalname } = req.file;
        const fileName = `${Date.now()}_${originalname}`;
        const { data: imagenData, error: uploadError } = await usuarioModel.subirImagen(fileName, buffer, req.file.mimetype);

        if (uploadError) {
          return res.status(500).json({ error: 'Error al subir la nueva imagen.' });
        }

        imagen_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/imagenes/${imagenData.path}`;
      }

      // Actualizar los datos del usuario
      const updateData = { imagen_url };
      if (nombre) updateData.nombre = nombre;
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const { data, error } = await usuarioModel.actualizar(id, updateData);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error en la actualización de usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // ELIMINACIÓN DE USUARIO
  // Maneja el proceso de eliminación de un usuario
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener el usuario actual
      const { data: usuario, error: fetchError } = await usuarioModel.obtenerUsuario(id);

      if (fetchError) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      // Si el usuario tiene una imagen, eliminarla
      if (usuario.imagen_url) {
        const imagePath = usuario.imagen_url.split("/storage/v1/object/public/imagenes/")[1];
        const { error: deleteImageError } = await usuarioModel.eliminarImagen(imagePath);

        if (deleteImageError) {
          console.error('Error al eliminar la imagen:', deleteImageError);
        }
      }

      const { error: deleteError } = await usuarioModel.eliminar(id);

      if (deleteError) {
        return res.status(500).json({ error: deleteError.message });
      }

      res.status(200).json({ message: "Usuario eliminado exitosamente." });
    } catch (error) {
      console.error('Error en la eliminación de usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = usuarioController;