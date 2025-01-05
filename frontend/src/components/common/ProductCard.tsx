import React from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  matchScore: number;
  description: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-contain bg-white p-4"
        />
        {product.matchScore > 0 && (
          <div className="absolute top-2 right-2 bg-[#B91C1C] text-white px-2 py-1 rounded-full text-sm font-medium">
            {product.matchScore}% Match
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>
        <p className="mt-2 text-lg font-semibold text-[#B91C1C]">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
};
