import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useThemeStore } from "./lib/themeStore";
import { AdminLayout } from "./layouts/AdminLayout";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { CouponsPage } from "./features/coupons/CouponsPage";
import { CategoriesPage } from "./features/categories/CategoriesPage";
import { ProductsPage } from "./features/products/ProductsPage";
import { SubCategoriesPage } from "./features/subcategories/SubCategoriesPage";
import { ProductVariantsPage } from "./features/variants/ProductVariantsPage";
import { BannersPage } from "./features/banners/BannersPage";
import { TopScrollPage } from "./features/topscroll/TopScrollPage";
import { ShopByAgePage } from "./features/shopByAge/ShopByAgePage";
import { ComboOffersPage } from "./features/comboOffers/ComboOffersPage";
import { KpiImagesPage } from "./features/kpiImages/KpiImagesPage";
import { ReviewsPage } from "./features/reviews/ReviewsPage";
import { ShopVideosPage } from "./features/shopVideos/ShopVideosPage";
import { OrdersPage } from "./features/orders/OrdersPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ChangePasswordPage } from "./features/settings/ChangePasswordPage";
import { AdminUsersPage } from "./features/settings/AdminUsersPage";
import { SuperAdminRoute } from "./routes/SuperAdminRoute";
import { ShippingReturnPage } from "./features/content/ShippingReturnPage";
import { TermsPage } from "./features/content/TermsPage";
import { OrderDetailPage } from "./features/orders/OrderDetailPage";
import { ManualOrderPage } from "./features/orders/ManualOrderPage";

function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/subcategories" element={<SubCategoriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route
            path="/products/:id/variants"
            element={<ProductVariantsPage />}
          />
          <Route path="/banners" element={<BannersPage />} />
          <Route path="/top-scroll" element={<TopScrollPage />} />
          <Route path="/shop-by-age" element={<ShopByAgePage />} />
          <Route path="/combo-offers" element={<ComboOffersPage />} />
          <Route path="/kpi-images" element={<KpiImagesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/shop-videos" element={<ShopVideosPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/manual" element={<ManualOrderPage />} />
          <Route path="/orders/:orderNumber" element={<OrderDetailPage />} />
          <Route
            path="/content/shipping-return"
            element={<ShippingReturnPage />}
          />
          <Route path="/content/terms" element={<TermsPage />} />
          <Route path="/settings/password" element={<ChangePasswordPage />} />
          <Route element={<SuperAdminRoute />}>
            <Route path="/settings/admins" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
