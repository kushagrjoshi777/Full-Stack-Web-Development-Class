import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "http://localhost:8081/api/students";
const empty = { name: "", email: "", course: "", year: 1 };

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadStudents() {
    const response = await fetch(API);
    if (!response.ok) throw new Error("Could not load students.");
    setStudents(await response.json());
  }

  useEffect(() => {
    loadStudents().catch(() => {
      setMessage("Start the Spring Boot service first.");
    });
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  function editStudent(student) {
    setEditingId(student.id);
    setForm(student);
    setMessage("");
  }

  async function submit(event) {
    event.preventDefault();
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year) })
      });
      if (!response.ok) {
        setMessage("Could not save the student. Check the details and try again.");
        return;
      }
      setForm(empty);
      setEditingId(null);
      setMessage(editingId ? "Student updated." : "Student added.");
      await loadStudents();
    } catch {
      setMessage("Could not complete the request. Check that the Spring Boot service is running.");
    }
  }

  async function remove(id) {
    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        setMessage("Could not delete this student. Refresh and try again.");
        return;
      }
      if (editingId === id) {
        setEditingId(null);
        setForm(empty);
      }
      setMessage("Student deleted.");
      await loadStudents();
    } catch {
      setMessage("Could not complete the request. Check that the Spring Boot service is running.");
    }
  }

  return (
    <main>
      <h1>Student Management</h1>
      <p className="subtitle">React.js client · Spring Boot Student Service</p>
      <form onSubmit={submit}>
        <input name="name" aria-label="Name" placeholder="Name" required
          value={form.name} onChange={handleChange} />
        <input name="email" aria-label="Email" placeholder="Email" type="email" required
          value={form.email} onChange={handleChange} />
        <input name="course" aria-label="Course" placeholder="Course" required
          value={form.course} onChange={handleChange} />
        <input name="year" aria-label="Year" placeholder="Year" type="number" min="1" required
          value={form.year} onChange={handleChange} />
        <button type="submit">{editingId ? "Update student" : "Add student"}</button>
        {editingId && (
          <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>
        )}
      </form>
      {message && <p className="message" role="status">{message}</p>}
      <section>
        <h2>Registered students</h2>
        {students.length === 0 ? (
          <p>No students registered.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Course</th><th>Year</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.year}</td>
                  <td>
                    <button onClick={() => editStudent(student)}>Edit</button>{" "}
                    <button className="danger" onClick={() => remove(student.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
