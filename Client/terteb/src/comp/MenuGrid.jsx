import { useEffect, useState } from "react";

export default function MenuGrid({ section, selectedCategory }) {

  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Array of colors for different categories
  const categoryColors = {
    'Appetizer': 'bg-blue-500',
    'Main Course': 'bg-green-500',
    'Dessert': 'bg-pink-500',
    'Beverage': 'bg-purple-500',
    'Salad': 'bg-yellow-500',
    'Soup': 'bg-orange-500',
    'Seafood': 'bg-cyan-500',
    'Vegetarian': 'bg-emerald-500',
    'Breakfast': 'bg-amber-500',
    'Lunch': 'bg-indigo-500',
    'Dinner': 'bg-red-500',
    'Snack': 'bg-fuchsia-500',
    'Default': 'bg-gray-500'
  };

  // Text colors for contrast
  const textColors = {
    'bg-blue-500': 'text-white',
    'bg-green-500': 'text-white',
    'bg-pink-500': 'text-white',
    'bg-purple-500': 'text-white',
    'bg-yellow-500': 'text-black',
    'bg-orange-500': 'text-white',
    'bg-cyan-500': 'text-white',
    'bg-emerald-500': 'text-white',
    'bg-amber-500': 'text-black',
    'bg-indigo-500': 'text-white',
    'bg-red-500': 'text-white',
    'bg-fuchsia-500': 'text-white',
    'bg-gray-500': 'text-white'
  };

  // Function to get color based on category
  const getCategoryColor = (category) => {
    const categoryName = typeof category === 'object' ? category?.name : category;
    return categoryColors[categoryName] || categoryColors['Default'];
  };

  // Function to get text color based on background
  const getTextColor = (bgColor) => {
    return textColors[bgColor] || 'text-white';
  };

  // Function to get category display name
  const getCategoryName = (category) => {
    if (typeof category === 'object' && category !== null) {
      return category.name || 'Uncategorized';
    }
    return category || 'Uncategorized';
  };

  useEffect(() => {

    const fetchFoods = async () => {

      try {

        const res = await fetch(
          "http://localhost:5000/api/menu"
        );

        if (!res.ok) {
          throw new Error("Failed to fetch menu");
        }

        const data = await res.json();

        setFoods(data);


      } catch(error){

        console.log(error);

      } finally {

        setLoading(false);

      }

    };


    fetchFoods();

  }, []);



  const addToCart = (food)=>{

    const existing = cart.find(
      item => item.id === food.id
    );


    if(existing){

      setCart(
        cart.map(item =>
          item.id === food.id
          ? {
              ...item,
              quantity:item.quantity + 1
            }
          :
          item
        )
      );


    }else{

      setCart([
        ...cart,
        {
          ...food,
          quantity:1
        }
      ]);

    }

  };



  const removeFromCart = (id)=>{

    setCart(
      cart.filter(item=>item.id !== id)
    );

  };



  const total = cart.reduce(
    (sum,item)=>
      sum + item.price * item.quantity,
    0
  );



  if(loading){

    return (
      <div className="text-center py-20">
        Loading menu...
      </div>
    );

  }
  const placeOrder = async () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const orderData = {
    tableNumber: 1, // Change later to user input
    customerName: "Guest",
    customerPhone: "",
    isTakeaway: false,
    notes: "",
    items: cart.map((item) => ({
      menuItemId: item.id,
      quantity: item.quantity,
    })),
  };

  try {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to place order");
    }

    alert("Order placed successfully!");

    console.log(data);

    // Empty cart after success
    setCart([]);

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};



  return (

    <section className="max-w-7xl mx-auto px-6 py-10">


      {/* FOOD GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">


        {foods.map((food) => {
          const categoryColor = getCategoryColor(food.category);
          const textColor = getTextColor(categoryColor);
          const categoryName = getCategoryName(food.category);

          return (
            <div
              key={food.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden relative"
            >
              {/* Image Container with Badge */}
              <div className="relative">
                <img
                  src={food.image}
                  alt={food.name}
                  className="h-52 w-full object-cover"
                />
                
                {/* Category Badge on Image */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor} ${textColor} shadow-lg`}>
                    {categoryName}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold">
                  {food.name}
                </h2>

                <p className="text-gray-500 mt-2">
                  {food.description}
                </p>

                <div className="mt-5 flex justify-between items-center">
                  <span className="font-bold text-green-700">
                    {food.price} Birr
                  </span>

                  <button
                    onClick={() => addToCart(food)}
                    className="bg-green-900 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}


      </div>




      {/* CART */}

      {cart.length > 0 && (

        <div className="mt-12 bg-white shadow-xl rounded-2xl p-6">


          <h2 className="text-2xl font-bold mb-5">
            Your Order
          </h2>



          <div className="space-y-4">


            {cart.map(item=>(


              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-3"
              >


                <div>

                  <h3 className="font-bold">
                    {item.name}
                  </h3>

                  <p>
                    {item.quantity} x {item.price} Birr
                  </p>

                </div>



                <button
                  onClick={()=>removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>


              </div>


            ))}


          </div>



          <div className="mt-5 flex justify-between items-center">


            <h3 className="text-xl font-bold">
              Total: {total} Birr
            </h3>


           <button
              onClick={placeOrder}
              className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
            >
              Place Order
            </button>


          </div>


        </div>

      )}



    </section>

  );

}