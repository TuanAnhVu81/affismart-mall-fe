"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackEventInBackground } from "@/services/ai.service";
import { useCartStore } from "@/store/cart.store";
import type { Product } from "@/types/product.types";

interface ProductAddToCartProps {
  product: Product;
}

export function ProductAddToCart({ product }: ProductAddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  
  const isOutOfStock = product.stockQuantity <= 0;
  const isInactive = !product.isActive;
  const canAddToCart = !isOutOfStock && !isInactive;

  const handleAddToCart = () => {
    if (!canAddToCart) {
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      slug: product.slug,
      quantity: 1,
    });
    
    openDrawer();
    trackEventInBackground("ADD_TO_CART", product.id);
    toast.success(`${product.name} added to cart.`);
  };

  return (
    <Button 
      type="button"
      disabled={!canAddToCart} 
      onClick={handleAddToCart}
      className="h-11 w-full sm:w-auto sm:px-8"
    >
      <ShoppingCart className="mr-2 size-4" />
      {isOutOfStock ? "Unavailable" : "Add to cart"}
    </Button>
  );
}
