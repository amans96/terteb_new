import { useEffect, useState } from "react";
import CategoryForm from "./CategoryForm.jsx";
const API_URL = import.meta.env.VITE_API_URL;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    fetchCategories();
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      alert("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-lg">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Categories
        </h1>

        <button
          onClick={handleAddCategory}
          className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800"
        >
          Add Category
        </button>
      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Section</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-8 text-gray-500"
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t"
                >
                  <td className="p-4 font-medium">
                    {category.name}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        category.section === "FOOD"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {category.section}
                    </span>
                  </td>

                  <td className="p-4">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        handleEditCategory(category)
                      }
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteCategory(category.id)
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {/* Modal */}

      {showForm && (
        <CategoryForm
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          editingCategory={editingCategory}
        />
      )}

    </div>
  );
}