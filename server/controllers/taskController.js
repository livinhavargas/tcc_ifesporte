const Task = require('../models/Task');

// Buscar tarefas do usuário autenticado
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ criador: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar nova tarefa vinculada ao usuário autenticado
const createTask = async (req, res) => {
  try {
    const { text, descricao, prazo, done } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
    }

    const newTask = new Task({
      text: text.trim(),
      descricao: descricao ? descricao.trim() : '',
      prazo: prazo || '',
      done: Boolean(done),
      criador: req.userId
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Atualizar tarefa
const updateTask = async (req, res) => {
  try {
    const { text, descricao, prazo, done } = req.body;
    const task = await Task.findOne({ _id: req.params.id, criador: req.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada ou não autorizada.' });
    }

    if (text !== undefined) task.text = text.trim();
    if (descricao !== undefined) task.descricao = descricao ? descricao.trim() : '';
    if (prazo !== undefined) task.prazo = prazo;
    if (done !== undefined) task.done = Boolean(done);

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Excluir tarefa
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, criador: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada ou não autorizada.' });
    }
    res.json({ message: 'Tarefa excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
};
