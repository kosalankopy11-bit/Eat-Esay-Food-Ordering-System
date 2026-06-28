import { LogOut, ShoppingCart, UserCircle, UtensilsCrossed } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-orange-100 text-tomato" : "text-slate-700 hover:bg-slate-100"}`;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { count, clearLocalCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearLocalCart();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to={user?.role === "admin" ? "/admin" : "/"} className="flex items-center gap-2 text-lg font-bold text-ink">
            <span className="rounded-md bg-tomato p-2 text-white">
              <UtensilsCrossed size={20} />
            </span>
            EATEASY
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            {user?.role === "admin" ? (
              <>
                <NavLink className={navClass} to="/admin">Dashboard</NavLink>
                <NavLink className={navClass} to="/admin/foods">Foods</NavLink>
                <NavLink className={navClass} to="/admin/orders">Orders</NavLink>
              </>
            ) : (
              <>
                <NavLink className={navClass} to="/">Menu</NavLink>
                <NavLink className={navClass} to="/orders">Orders</NavLink>
                <NavLink className={navClass} to="/cart">
                  <ShoppingCart size={16} />
                  Cart
                  {count > 0 && <span className="rounded-full bg-tomato px-2 py-0.5 text-xs text-white">{count}</span>}
                </NavLink>
              </>
            )}
            {user && (
              <NavLink className={navClass} to="/profile">
                {user.profile_image_url ? (
                  <img className="h-6 w-6 rounded-full object-cover" src={user.profile_image_url} alt={user.username} />
                ) : (
                  <UserCircle size={18} />
                )}
                Profile
              </NavLink>
            )}
            {user ? (
              <button className="btn-secondary" onClick={handleLogout} type="button">
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <>
                <NavLink className={navClass} to="/login">Login</NavLink>
                <NavLink className={navClass} to="/register">Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
