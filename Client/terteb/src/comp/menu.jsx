import { useEffect, useState } from "react";
import FoodForm from "./FoodForm";

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const fetchFoods = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/menu");

      if (!response.ok) {
        throw new Error("Failed to fetch foods");
      }

      const data = await response.json();
      setFoods(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleAddFood = () => {
    setEditingFood(null);
    setShowForm(true);
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFood(null);
  };

  const handleFormSuccess = () => {
    fetchFoods();
    setShowForm(false);
    setEditingFood(null);
  };

  const handleDeleteFood = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/menu/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete food");
      }

      alert("Food deleted successfully");
      fetchFoods();
    } catch (error) {
      console.log("Delete error:", error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-500 font-medium">Loading foods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
            Menu Items
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Manage your restaurant products, pricing, and availability.
          </p>
        </div>
        <button
          onClick={handleAddFood}
          className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-medium px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-xl transition shadow-sm active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <span className="text-lg sm:text-xl">+</span>
          <span>Add Food</span>
        </button>
      </div>

      {/* Empty State */}
      {foods.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 text-center border shadow-sm">
          <div className="text-4xl sm:text-5xl mb-3">🍽️</div>
          <p className="text-gray-500 text-sm sm:text-base">
            No menu items found. Click the "Add Food" button to get started!
          </p>
        </div>
      ) : (
        <>
          {/* 1. MOBILE CARD VIEW (Shown on small screens, hidden on md+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:hidden">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {food.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {food.category?.name || "Uncategorized"}
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-green-700 mt-0.5">
                      {food.price} Birr
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  {food.available ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                      Unavailable
                    </span>
                  )}

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleEditFood(food)}
                      className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this item?"
                          )
                        ) {
                          handleDeleteFood(food.id);
                        }
                      }}
                      className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. TABLE VIEW (Hidden on mobile, shown on md+ screens) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {foods.map((food) => (
                    <tr
                      key={food.id}
                      className="hover:bg-gray-50/50 transition"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-14 h-14 rounded-xl object-cover border"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {food.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {food.category?.name || "Uncategorized"}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                        {food.price} Birr
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {food.available ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEditFood(food)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3 transition px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this item?"
                              )
                            ) {
                              handleDeleteFood(food.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 font-medium text-sm transition px-2 py-1 rounded hover:bg-red-50"
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
        </>
      )}

      {/* Render FoodForm as a modal */}
      {showForm && (
        <FoodForm
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          editingFood={editingFood}
        />
      )}
    </div>
  );
}