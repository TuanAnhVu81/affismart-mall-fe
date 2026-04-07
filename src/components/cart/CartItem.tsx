"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, type CartItem as CartItemType } from "@/store/cart.store";

interface CartItemProps {
  item: CartItemType;
}

const passthroughImageLoader = ({ src }: { src: string }) => src;

export function CartItem({ item }: CartItemProps) {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  return (
    <article className="grid grid-cols-[72px_1fr] gap-3 rounded-xl border border-border/70 bg-card/40 p-3">
      <Link
        href={`/products/${item.slug}`}
        className="relative h-[72px] w-[72px] overflow-hidden rounded-lg border border-border/70 bg-muted/40"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            loader={passthroughImageLoader}
            unoptimized
            className="object-cover"
            sizes="72px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            className="line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {item.name}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name} from cart`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <p className="text-sm font-semibold text-foreground">
          {formatCurrency(item.price)}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            aria-label={`Decrease quantity of ${item.name}`}
          >
            <Minus className="size-3.5" />
          </Button>
          <Input
            type="number"
            min={1}
            inputMode="numeric"
            value={item.quantity}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (!nextValue.trim()) {
                return;
              }

              updateQuantity(item.productId, Number(nextValue));
            }}
            className="h-8 w-16 text-center"
            aria-label={`Quantity of ${item.name}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            aria-label={`Increase quantity of ${item.name}`}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

