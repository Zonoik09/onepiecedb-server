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
const { groups, members } = data;

// Endpoint POST para agregar un nuevo miembro
app.post('/api/members', (req, res) => {
  const { name, role, crew, bounty, devilFruit, weapon, image, group } = req.body;

  // Verificar si el grupo existe
  if (!groups.includes(group)) {
    return res.status(400).json({ error: 'Grupo no encontrado' });
  }

  // Crear el nuevo miembro
  const newMember = { name, role, crew, bounty, devilFruit, weapon, image };

  // Agregar el nuevo miembro al grupo correspondiente
  members[group].push(newMember);

  // Guardar los datos actualizados en el archivo JSON
  fs.writeFileSync('one_piece_characters.json', JSON.stringify({ groups, members }, null, 2));

  res.status(201).json(newMember);
});

// Endpoint GET para obtener los grupos
app.get('/api/groups', (req, res) => {
  res.json(groups);
});

// Endpoint GET para obtener los miembros de un grupo específico
app.get('/api/members/:group', (req, res) => {
  const group = req.params.group;
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
