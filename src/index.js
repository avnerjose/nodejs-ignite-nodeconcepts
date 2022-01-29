const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(404).json({
      error: "User not found"
    })
  }

  req.user = user;

  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return res.status(400).json({
      error: "User already exists"
    });
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return res.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user: { todos } } = req;

  return res.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  const userIndex = users.findIndex(item => item.id === user.id);

  users[userIndex].todos.push(todo);

  return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).json({
      error: "Todo not found"
    });
  }

  todo.title = title;
  todo.deadline = deadline;

  return res.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).json({
      error: "Todo not found"
    });
  }

  todo.done = true;

  return res.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todoIndex, 1);

  return res.status(204).send();
});

module.exports = app;