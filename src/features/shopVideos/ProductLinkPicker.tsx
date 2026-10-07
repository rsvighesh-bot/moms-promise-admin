import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { api } from "../../lib/api";
import { formatMoney } from "../../lib/format";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  sellingPrice: number;
}

function useProductSearch(search: string) {
  return useQuery({
    queryKey: ["shop-video-product-search", search],
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

interface ProductLinkPickerProps {
  value: { _id: string; name: string; images: string[] } | null;
  onChange: (product: SearchResult | null) => void;
}

export function ProductLinkPicker({ value, onChange }: ProductLinkPickerProps) {
  const [search, setSearch] = useState("");
  const { data: results = [], isFetching } = useProductSearch(search);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        Link to product (optional)
      </label>

      {value ? (
        <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-surface">
          {value.images[0] ? (
            <img
              src={value.images[0]}
              alt=""
              className="w-9 h-9 rounded-md object-cover ring-1 ring-border shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-md bg-bg ring-1 ring-border shrink-0" />
          )}
          <span className="flex-1 text-sm font-medium truncate">
            {value.name}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted hover:text-red-500 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
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
                results.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => {
                      onChange(product);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg text-left transition-colors border-b border-border last:border-0"
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
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
