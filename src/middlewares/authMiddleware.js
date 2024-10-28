const jwt = require('jsonwebtoken');

// MIDDLEWARE DE AUTENTICACIÓN
// Verifica el token JWT en las solicitudes

function verificarToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No se proporcionó un token.' });
  }

  const jwtToken = token.split(' ')[1];

  jwt.verify(jwtToken, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    req.user = decoded;
    next();
  });
}

module.exports = verificarToken;