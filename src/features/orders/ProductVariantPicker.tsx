import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { api } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";

interface Variant {
    _id: string;
    sku: string;
    age: string;
    color?: string;
    size?: string;
    stockQuantity: number;
    status: string;
}

interface ProductResult {
    _id: string;
    name: string;
    sku: string;
    images: string[];
    sellingPrice: number;
    categoryId: { _id: string; name: string } | null;
}

interface SelectedVariant {
    productId: string;
    variantId: string;
    productName: string;
    variantLabel: string;
    image?: string;
    price: number;
}

interface ProductVariantPickerProps {
    value: { productId: string; variantId: string };
    onChange: (value: { productId: string; variantId: string }) => void;
    onMetaChange?: (meta: SelectedVariant | null) => void;
    error?: string;
    index: number;
}

function useProductSearch(search: string) {
    return useQuery({
        queryKey: ["product-search", search],
        queryFn: async () => {
            const { data } = await api.get("/products/admin", {
                params: { search, limit: 8, page: 1, status: "active" },
            });
            return data.docs as ProductResult[];
        },
        enabled: search.length >= 2,
        staleTime: 30_000,
    });
}

function useVariants(productId: string) {
    return useQuery({
        queryKey: ["variants-picker", productId],
        queryFn: async () => {
            const { data } = await api.get("/variants/admin", {
                params: { productId, status: "active" },
            });
            return data.variants as Variant[];
        },
        enabled: !!productId,
    });
}

const formatVariantLabel = (v: Variant) =>
    [v.age ? `${v.age} yrs` : null, v.color, v.size, `(${v.sku})`]
        .filter(Boolean)
        .join(" · ");

const formatMoney = (paise: number) =>
    `₹${(paise / 100).toLocaleString("en-IN")}`;

export function ProductVariantPicker({
    value, onChange, onMetaChange, error, index,
}: ProductVariantPickerProps) {
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const { data: searchResults = [], isFetching } = useProductSearch(search);
    const { data: variants = [] } = useVariants(value.productId);

    // When productId changes externally, clear local state
    useEffect(() => {
        if (!value.productId) {
            setSelectedProduct(null);
            setSearch("");
        }
    }, [value.productId]);

    const handleSelectProduct = (product: ProductResult) => {
        setSelectedProduct(product);
        setSearch(product.name);
        setShowDropdown(false);
        onChange({ productId: product._id, variantId: "" });
        onMetaChange?.(null);
    };

    const handleSelectVariant = (variant: Variant) => {
        if (!selectedProduct) return;
        const meta: SelectedVariant = {
            productId: selectedProduct._id,
            variantId: variant._id,
            productName: selectedProduct.name,
            variantLabel: formatVariantLabel(variant),
            image: selectedProduct.images[0],
            price: selectedProduct.sellingPrice,
        };
        onChange({ productId: selectedProduct._id, variantId: variant._id });
        onMetaChange?.(meta);
    };

    const handleClear = () => {
        setSelectedProduct(null);
        setSearch("");
        onChange({ productId: "", variantId: "" });
        onMetaChange?.(null);
    };

    return (
        <div className="space-y-2">
            {/* Product search */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                    Product {index + 1}
                </label>
                <div className="relative">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setShowDropdown(true);
                                if (!e.target.value) handleClear();
                            }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Search product name or SKU..."
                            className="font-data w-full pl-8 pr-8 py-2.5 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {(search || selectedProduct) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Search results dropdown */}
                    {showDropdown && search.length >= 2 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                            {isFetching ? (
                                <div className="px-3 py-2.5 text-sm text-muted">Searching...</div>
                            ) : searchResults.length === 0 ? (
                                <div className="px-3 py-2.5 text-sm text-muted">No products found</div>
                            ) : (
                                searchResults.map((product) => (
                                    <button
                                        key={product._id}
                                        type="button"
                                        onClick={() => handleSelectProduct(product)}
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
                                            <div className="text-sm font-medium truncate">{product.name}</div>
                                            <div className="text-xs text-muted font-data">
                                                {product.sku} · {product.categoryId?.name ?? "—"} · {formatMoney(product.sellingPrice)}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Variant picker — shows once product selected */}
            {value.productId && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Variant</label>
                    {variants.length === 0 ? (
                        <p className="text-xs text-muted py-2">No active variants for this product.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {variants.map((variant) => {
                                const isSelected = value.variantId === variant._id;
                                const isOutOfStock = variant.stockQuantity === 0;
                                return (
                                    <button
                                        key={variant._id}
                                        type="button"
                                        disabled={isOutOfStock}
                                        onClick={() => handleSelectVariant(variant)}
                                        className={`text-left px-3 py-2 rounded-md border text-xs transition-colors
                      ${isSelected
                                                ? "border-primary bg-primary/10 text-primary"
                                                : isOutOfStock
                                                    ? "border-border bg-bg text-muted opacity-50 cursor-not-allowed"
                                                    : "border-border bg-surface hover:border-primary hover:bg-primary/5"
                                            }`}
                                    >
                                        <div className="font-medium">{formatVariantLabel(variant)}</div>
                                        <div className={`text-xs mt-0.5 font-data ${isOutOfStock ? "text-red-400" : "text-muted"}`}>
                                            {isOutOfStock ? "Out of stock" : `${variant.stockQuantity} in stock`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}