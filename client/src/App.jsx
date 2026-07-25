import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './authContext';
import { CartProvider } from './cartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Verify from './pages/Verify';
import Login from './pages/account/Login';
import Register from './pages/account/Register';
import AccountHome from './pages/account/AccountHome';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order/:orderNumber" element={<OrderConfirmation />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="account" element={<AccountHome />} />
              <Route path="account/login" element={<Login />} />
              <Route path="account/register" element={<Register />} />
              {/* Hidden from nav for launch; routes remain for internal use */}
              <Route path="verify" element={<Verify />} />
              <Route path="testing" element={<Navigate to="/verify#testing" replace />} />
              <Route path="admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
