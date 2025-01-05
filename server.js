const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir imágenes estáticas
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Middleware para el resto
app.use(cors());
app.use(express.json());

// Cargar datos desde el archivo JSON
const data = JSON.parse(fs.readFileSync('one_piece_characters.json', 'utf-8'));
const { groups, members } = data; // Declaramos `groups` y `members` como constantes.

// Endpoint POST para obtener los miembros de un grupo
app.post('/api/members', (req, res) => {
  const { group } = req.body;

  if (!members[group]) {
    return res.status(404).json({ error: 'Grupo no encontrado' });
  }

  res.json(members[group]);
});

// Endpoint POST para obtener información de un miembro específico
app.post('/api/members/item', (req, res) => {
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
app.post('/api/search', (req, res) => {
  const { query } = req.body;

  const results = [];
  for (const group in members) {
    results.push(...members[group].filter((m) =>
      Object.values(m).some((value) => value.toString().toLowerCase().includes(query.toLowerCase()))
    ));
  }

  res.json(results);
});

// Endpoint POST para obtener los grupos
app.post('/api/groups', (req, res) => {
  res.json(groups);
});


// Endpoint POST para obtener los miembros de un grupo específico
app.post('/api/members/group', (req, res) => {
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
