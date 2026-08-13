import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function CategoryForm({
  onClose,
  onSuccess,
  editingCategory = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    section: "FOOD",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        section: editingCategory.section,
      });
    }
  }, [editingCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
   const url = editingCategory
  ? `${API_URL}/api/categories/${editingCategory.id}`
  : `${API_URL}/api/categories`;

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      onSuccess();

    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white w-full max-w-md rounded-xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {editingCategory ? "Edit Category" : "Add Category"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="block mb-2 font-medium">
              Category Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Section
            </label>

            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="FOOD">Food</option>
              <option value="DRINK">Drink</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800"
            >
              {submitting
                ? "Saving..."
                : editingCategory
                ? "Update"
                : "Save"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}