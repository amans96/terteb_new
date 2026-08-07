import { useEffect, useState } from "react";


export default function Sales() {

  const [sales, setSales] = useState({
    today: 0,
    orders: 0,
    revenue: 0
  });


  useEffect(()=>{


    const fetchSales = async()=>{

      try{

        const response = await fetch(
          "http://localhost:5000/api/sales"
        );


        const data = await response.json();

        setSales(data);


      }catch(error){

        console.log(error);

      }

    };


    fetchSales();


  },[]);




  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">
        Sales Overview
      </h1>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-gray-500">
            Today's Sales
          </h2>

          <p className="text-3xl font-bold text-green-700">
            {sales.today} Birr
          </p>

        </div>



        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-gray-500">
            Total Orders
          </h2>

          <p className="text-3xl font-bold">
            {sales.orders}
          </p>

        </div>




        <div className="bg-white shadow rounded-xl p-6">

          <h2 className="text-gray-500">
            Revenue
          </h2>

          <p className="text-3xl font-bold text-green-700">
            {sales.revenue} Birr
          </p>

        </div>



      </div>



    </div>

  );

}