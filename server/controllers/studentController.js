const Student = require('../models/Student');
const Analysis = require('../models/Analysis');

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ nome: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Estudante não encontrado' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  console.log("POST /api/students PAYLOAD RECEBIDO:", req.body);
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Estudante não encontrado' });
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    // Cascade delete análises
    await Analysis.deleteMany({ aluno: studentId });
    
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) return res.status(404).json({ message: 'Estudante não encontrado' });
    
    res.json({ message: 'Estudante removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
