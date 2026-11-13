import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Chatbot } from './components/Chatbot';
import { VisualSearchModal } from './components/VisualSearchModal';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { WishlistView } from './views/WishlistView';
import { AccountView } from './views/AccountView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AboutView, ContactView, FAQView, PolicyView } from './views/StaticPages';
import { AIFashionLabHub } from './components/ai/AIFashionLabHub';
import { TextileHeritageExplorer } from './components/ai/TextileHeritageExplorer';

const AppContent: React.FC = () => {
  const { currentView, selectedProductId, aiStudioTab, aiStudioProductId } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'women':
        return <ShopView initialCategory="women" />;
      case 'men':
        return <ShopView initialCategory="men" />;
      case 'jewelry':
        return <ShopView initialCategory="jewelry" />;
      case 'spiritual':
        return <ShopView initialCategory="spiritual" />;
      case 'product-detail':
        return <ProductDetailView productId={selectedProductId || 'prod-001'} />;
      case 'ai-studio':
        return (
          <div className="py-10 space-y-12">
            <AIFashionLabHub initialTab={aiStudioTab} initialProductId={aiStudioProductId} />
            <TextileHeritageExplorer />
          </div>
        );
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'confirmation':
        return <OrderConfirmationView />;
      case 'tracking':
        return <OrderTrackingView />;
      case 'wishlist':
        return <WishlistView />;
      case 'account':
        return <AccountView />;
      case 'admin':
        return <AdminDashboardView />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'faq':
        return <FAQView />;
      case 'shipping':
        return <PolicyView type="shipping" />;
      case 'returns':
        return <PolicyView type="returns" />;
      case 'privacy':
        return <PolicyView type="privacy" />;
      case 'terms':
        return <PolicyView type="terms" />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E252B] selection:bg-[#E2D2B0] selection:text-[#0C2B4E]">
      <Navbar />
      <main className="flex-1">{renderCurrentView()}</main>
      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <AuthModal />
      <Toast />
      <Chatbot />
      <VisualSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
