import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const apiClient = axios.create({ baseURL: API });

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    name: "",
    departmentHead: "",
  });

  const token = localStorage.getItem("token");

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get("/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDepartments(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addDepartment = async (e) => {
    e.preventDefault();

    try {
      await apiClient.post(
        "/departments",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setForm({
        name: "",
        departmentHead: "",
      });

      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm("Delete Department?")) return;

    await apiClient.delete(`/departments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchDepartments();
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-8">
        Department Management
      </h1>

      <form
        onSubmit={addDepartment}
        className="bg-white p-6 rounded-xl shadow mb-8 space-y-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Department Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />

        <input
          type="text"
          name="departmentHead"
          placeholder="Department Head"
          value={form.departmentHead}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Add Department
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-blue-600 text-white">

            <tr>
              <th className="p-4">Department</th>
              <th className="p-4">Department Head</th>
              <th className="p-4">Action</th>
            </tr>

          </thead>

          <tbody>

            {departments.map((dept) => (

              <tr key={dept._id} className="border-b">

                <td className="p-4">{dept.name}</td>

                <td className="p-4">
                  {dept.departmentHead || "-"}
                </td>

                <td className="p-4">

                  <button
                    onClick={() => deleteDepartment(dept._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default DepartmentManagement;