const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// CONFIGURACIÓN DE SUPABASE
// Crea y exporta el cliente de Supabase utilizando las variables de entorno

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;