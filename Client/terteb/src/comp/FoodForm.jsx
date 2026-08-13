import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function FoodForm({
  onClose,
  onSuccess,
  editingFood = null,
}) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    featured: false,
    available: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchCategories();

    if (editingFood) {
      setFormData({
        name: editingFood.name,
        description: editingFood.description || "",
        price: editingFood.price,
        image: editingFood.image || "",
        categoryId: editingFood.categoryId,
        featured: editingFood.featured || false,
        available: editingFood.available !== undefined ? editingFood.available : true,
      });
      if (editingFood.image) {
        setImagePreview(editingFood.image);
      }
    }
  }, [editingFood]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);

    try {
      let imageUrl = formData.image;

      if (selectedFile) {
        setUploadProgress(30);
        imageUrl = await uploadImage(selectedFile);
        setUploadProgress(70);
      }

      const url = editingFood
        ? `${API_URL}/api/menu/${editingFood.id}`
        : `${API_URL}/api/menu`;

      const method = editingFood ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          image: imageUrl,
        }),
      });

      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save food item");
      }

      onSuccess();
    } catch (error) {
      console.log("Error saving food:", error);
      alert(error.message || "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative mx-2 sm:mx-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          disabled={submitting}
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 pr-8">
          {editingFood ? "Edit Food" : "Add New Food"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Name *
            </label>
            <input
              name="name"
              placeholder="Enter food name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              rows="3"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (Birr) *
            </label>
            <input
              type="number"
              name="price"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              required
              min="0"
              step="0.01"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Image
            </label>
            <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 pb-4 sm:pt-5 sm:pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
              <div className="space-y-1 text-center w-full">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-lg"
                    />
                    {!submitting && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview("");
                          setFormData({ ...formData, image: "" });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-600 text-xs sm:text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex flex-col items-center text-sm text-gray-600">
                      <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={submitting}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {formData.image && !selectedFile && !imagePreview && (
              <p className="mt-2 text-xs sm:text-sm text-gray-500 truncate">
                Current image: {formData.image}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              required
              disabled={submitting}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-green-600"
                disabled={submitting}
              />
              <span className="text-sm text-gray-700">Featured Item</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-4 h-4 text-green-600"
                disabled={submitting}
              />
              <span className="text-sm text-gray-700">Available</span>
            </label>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm sm:text-base"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={submitting}
            >
              {submitting ? "Saving..." : editingFood ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}