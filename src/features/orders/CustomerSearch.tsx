import { useState } from "react";
import { Search, X, User } from "lucide-react";
import { api } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

interface CustomerSearchProps {
    value: Customer | null;
    onChange: (customer: Customer | null) => void;
}

function useCustomerSearch(search: string) {
    return useQuery({
        queryKey: ["customer-search", search],
        queryFn: async () => {
            const { data } = await api.get("/customers/admin", {
                params: { search, limit: 6, page: 1 },
            });
            return data.customers as Customer[];
        },
        enabled: search.length >= 2,
        staleTime: 30_000,
    });
}

export function CustomerSearch({ value, onChange }: CustomerSearchProps) {
    const [search, setSearch] = useState(value?.name ?? "");
    const [showDropdown, setShowDropdown] = useState(false);
    const { data: results = [], isFetching } = useCustomerSearch(search);

    const handleSelect = (customer: Customer) => {
        onChange(customer);
        setSearch(customer.name);
        setShowDropdown(false);
    };

    const handleClear = () => {
        onChange(null);
        setSearch("");
    };

    return (
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
                    placeholder="Search by name, email or phone..."
                    className="font-data w-full pl-8 pr-8 py-2.5 rounded-md border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {(search || value) && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Selected customer pill */}
            {value && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-md">
                    <User size={14} className="text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-primary">{value.name}</span>
                        <span className="text-xs text-muted ml-2">{value.email}</span>
                    </div>
                </div>
            )}

            {/* Dropdown */}
            {showDropdown && !value && search.length >= 2 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                    {isFetching ? (
                        <div className="px-3 py-2.5 text-sm text-muted">Searching...</div>
                    ) : results.length === 0 ? (
                        <div className="px-3 py-2.5 text-sm text-muted">No customers found</div>
                    ) : (
                        results.map((customer) => (
                            <button
                                key={customer._id}
                                type="button"
                                onClick={() => handleSelect(customer)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg text-left transition-colors border-b border-border last:border-0"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <User size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium">{customer.name}</div>
                                    <div className="text-xs text-muted">{customer.email}
                                        {customer.phone && ` · ${customer.phone}`}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}