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
    const { nombre, email, password, rol, vendedorId } = req.body;
    const { data: usuario, error } = await usuarioModel.crear({ nombre, email, password, rol });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (rol === 'cliente') {
      const { data: vendedor, error: vendedorError } = await usuarioModel.verificarVendedor(vendedorId);

      if (vendedorError || !vendedor) {
        await usuarioModel.eliminar(usuario[0].id);
        return res.status(400).json({ error: 'Vendedor no encontrado o inválido. Cliente eliminado.' });
      }

      const { error: relacionError } = await usuarioModel.crearRelacionVendedorCliente(vendedorId, usuario[0].id);

      if (relacionError) {
        await usuarioModel.eliminar(usuario[0].id);
        return res.status(500).json({ error: 'Error al crear la relación cliente-vendedor. Cliente eliminado.' });
      }
    }

    if (req.file) {
      const { buffer, originalname } = req.file;
      const fileName = `${Date.now()}_${originalname}`;
      const { data: imagenData, error: uploadError } = await usuarioModel.subirImagen(fileName, buffer, req.file.mimetype);

      if (uploadError) {
        await usuarioModel.eliminar(usuario[0].id);
        return res.status(500).json({ error: 'Error al subir la imagen, usuario eliminado.' });
      }

      const imagenUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/imagenes/${imagenData.path}`;
      const { error: updateError } = await usuarioModel.actualizar(usuario[0].id, { imagen_url: imagenUrl });

      if (updateError) {
        return res.status(500).json({ error: 'Error al actualizar la URL de la imagen en el usuario.' });
      }
    }

    res.status(201).json(usuario[0]);
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

  // ACTUALIZACIÓN DE USUARIO
  // Maneja la actualización de la información de un usuario
  actualizar: async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, password } = req.body;

    const { data: usuario, error: fetchError } = await usuarioModel.obtenerUsuario(id);

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    let imagen_url = usuario.imagen_url;

    if (req.file) {
      if (imagen_url) {
        const imagePath = imagen_url.split("/storage/v1/object/public/imagenes/")[1];
        const { error: deleteImageError } = await usuarioModel.eliminarImagen(imagePath);

        if (deleteImageError) {
          return res.status(500).json({ error: deleteImageError.message });
        }
      }

      const { originalname, buffer } = req.file;
      const fileName = `${Date.now()}_${originalname}`;
      const { data: newImageData, error: uploadError } = await usuarioModel.subirImagen(fileName, buffer, req.file.mimetype);

      if (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }

      imagen_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/imagenes/${newImageData.path}`;
    }

    const updateData = { imagen_url };
    if (nombre) updateData.nombre = nombre;
    if (correo) updateData.correo = correo;
    if (password) updateData.password = password;

    const { data, error } = await usuarioModel.actualizar(id, updateData);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  },

  // ELIMINACIÓN DE USUARIO
  // Maneja el proceso de eliminación de un usuario
  eliminar: async (req, res) => {
    const { id } = req.params;

    const { data: usuario, error: fetchError } = await usuarioModel.obtenerUsuario(id);

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    if (usuario.imagen_url) {
      const imagePath = usuario.imagen_url.split("/storage/v1/object/public/imagenes/")[1];
      const { error: deleteImageError } = await usuarioModel.eliminarImagen(imagePath);

      if (deleteImageError) {
        return res.status(500).json({ error: deleteImageError.message });
      }
    }

    const { error } = await usuarioModel.eliminar(id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Usuario eliminado exitosamente." });
  }
};

module.exports = usuarioController;