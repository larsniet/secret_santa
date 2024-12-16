import React from "react";

export const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  return (
    <div className="border rounded-lg shadow hover:shadow-md p-4 bg-white">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-32 w-full object-cover rounded-md mb-4"
      />
      <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
      <p className="text-sm font-bold text-gray-900 mt-2">${product.price}</p>
    </div>
  );
};
