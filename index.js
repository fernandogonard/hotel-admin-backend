const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Lógica de autenticación simulada
  if (email === 'admin@hotel.com' && password === 'admin123') {
    return res.json({ token: 'fake-jwt-token', role: 'admin' });
  }
  if (email === 'recepcion@hotel.com' && password === 'recep123') {
    return res.json({ token: 'fake-jwt-token', role: 'receptionist' });
  }
  return res.status(401).json({ message: 'Credenciales inválidas' });
});

app.listen(2117, () => {
  console.log('Servidor backend escuchando en puerto 2117');
});
