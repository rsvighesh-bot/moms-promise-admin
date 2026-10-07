import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { api } from "../../lib/api";
import { formatMoney } from "../../lib/format";
import { type ComboOfferProduct } from "./comboOfferApi";

interface SearchResult {
  _id: string;
  name: string;
  images: string[];
  sellingPrice: number;
}

function useProductSearch(search: string) {
  return useQuery({
    queryKey: ["combo-product-search", search],
    queryFn: async () => {
      const { data } = await api.get("/products/admin", {
        params: { search, limit: 8, page: 1, status: "active" },
      });
      return data.docs as SearchResult[];
    },
    enabled: search.length >= 2,
    staleTime: 30_000,
  });
}

interface ComboProductPickerProps {
  value: ComboOfferProduct[];
  onChange: (products: ComboOfferProduct[]) => void;
  error?: string;
}

export function ComboProductPicker({
  value,
  onChange,
  error,
}: ComboProductPickerProps) {
  const [search, setSearch] = useState("");
  const { data: results = [], isFetching } = useProductSearch(search);

  const selectedIds = new Set(value.map((p) => p._id));

  const handleAdd = (product: SearchResult) => {
    if (selectedIds.has(product._id)) return;
    onChange([
      ...value,
      {
        _id: product._id,
        name: product.name,
        images: product.images,
        sellingPrice: product.sellingPrice,
      },
    ]);
    setSearch("");
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((p) => p._id !== id));
  };

  const combinedPrice = value.reduce((sum, p) => sum + p.sellingPrice, 0);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Products in this combo
      </label>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product name or SKU..."
          className="font-data w-full pl-8 pr-3 py-2.5 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {search.length >= 2 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
            {isFetching ? (
              <div className="px-3 py-2.5 text-sm text-muted">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2.5 text-sm text-muted">
                No products found
              </div>
            ) : (
              results.map((product) => {
                const isSelected = selectedIds.has(product._id);
                return (
                  <button
                    key={product._id}
                    type="button"
                    disabled={isSelected}
                    onClick={() => handleAdd(product)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-border last:border-0 ${
                      isSelected
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-bg"
                    }`}
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-9 h-9 rounded-md object-cover ring-1 ring-border shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-bg ring-1 ring-border shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-muted font-data">
                        {formatMoney(product.sellingPrice)}
                        {isSelected ? " · already added" : ""}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="border border-border rounded-lg divide-y divide-border">
          {value.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-3 px-3 py-2"
            >
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt=""
                  className="w-9 h-9 rounded-md object-cover ring-1 ring-border shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-md bg-bg ring-1 ring-border shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {product.name}
                </div>
                <div className="text-xs text-muted font-data">
                  {formatMoney(product.sellingPrice)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(product._id)}
                className="p-1 rounded-md text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted">
              Combined price ({value.length} products)
            </span>
            <span className="font-data font-semibold">
              {formatMoney(combinedPrice)}
            </span>
          </div>
        </div>
      )}

      {value.length === 0 && (
        <p className="text-xs text-muted">
          Search and add at least 2 products to bundle into this combo.
        </p>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
