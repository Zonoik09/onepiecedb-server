const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir imágenes estáticas
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Middleware para manejar CORS y JSON
app.use(cors());
app.use(express.json());

// Verificar si se ha enviado algo en el cuerpo de la solicitud
const checkBody = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    console.log('Solicitud sin cuerpo');
    return res.status(400).json({ error: 'No se ha enviado ningún dato en el cuerpo de la solicitud' });
  }
  console.log('Cuerpo de la solicitud:', req.body);
  next();
};

// Cargar datos desde el archivo JSON
const data = JSON.parse(fs.readFileSync('one_piece_characters.json', 'utf-8'));
const { groups, members } = data; // Declaramos `groups` y `members` como constantes.

// Endpoint POST para obtener los miembros de un grupo
app.post('/api/members', checkBody, (req, res) => {
  const { group } = req.body;

  if (!members[group]) {
    return res.status(404).json({ error: 'Grupo no encontrado' });
  }

  res.json(members[group]);
});

// Endpoint POST para obtener información de un miembro específico
app.post('/api/members/item', checkBody, (req, res) => {
  const { name } = req.body;

  for (const group in members) {
    const member = members[group].find((m) => m.name.toLowerCase() === name.toLowerCase());
    if (member) {
      return res.json(member);
    }
  }

  res.status(404).json({ error: 'Miembro no encontrado' });
});

// Endpoint POST para buscar ítems según criterios
app.post('/api/search', checkBody, (req, res) => {
  const { query } = req.body;

  const results = [];
  for (const group in members) {
    results.push(...members[group].filter((m) =>
      Object.values(m).some((value) => value.toString().toLowerCase().includes(query.toLowerCase()))
    ));
  }

  res.json(results);
});

// Endpoint POST para obtener los grupos (sin necesidad de cuerpo)
app.post('/api/groups', (req, res) => {
  res.json(groups);
});

// Endpoint POST para obtener los miembros de un grupo específico
app.post('/api/members/group', checkBody, (req, res) => {
  const { group } = req.body;

  if (members[group]) {
    res.json(members[group]);
  } else {
    res.status(404).json({ error: 'Grupo no encontrado' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
