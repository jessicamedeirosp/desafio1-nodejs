const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui]
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if(!user) {
    return response.status(400).json({error: "user not found"});
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).send({error: 'Todo not found'});
  }
  request.todo = todo;
  return next();
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } = request.body;
  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({error: "user already exists"})
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  return response.json(user.todos);
  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);

  return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  // Complete aqui
  let { todo, user } = request;
  const { title, deadline } = request.body; 
  todo = {
    ...todo,
    title,
    deadline
  }

  const indexTodo = user.todos.findIndex(item => item.id === todo.id);

  user.todos[indexTodo] = todo

  return response.status(201).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  // Complete aqui
  let { todo } = request;
  todo.done = true;

  return response.status(201).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(todo => todo.id === id);
 
  user.todos.splice(todo, 1);
  return response.status(204).send();
});

module.exports = app;