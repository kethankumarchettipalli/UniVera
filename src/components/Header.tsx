// src/components/Header.tsx
import React, { useState } from "react";
import {
  GraduationCap,
  Menu,
  X,
  Heart,
  LogOut,
  Settings,
  LogIn,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import LoginPage from "./auth/LoginPage";
import UserProfile from "./auth/UserProfile";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const { user, userProfile, logout } = useAuth();

  const favoritesCount =
    (userProfile?.favorites?.colleges?.length || 0) +
    (userProfile?.favorites?.pgs?.length || 0);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "colleges", label: "Find Colleges" },
    { id: "accommodations", label: "Find PG/Hostels" },
    { id: "compare", label: "Compare" },
    { id: "about", label: "About" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      // handled in useAuth
    }
  };

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setActiveTab("home")}
            >
              <div className="bg-gradient-to-r from-saffron-500 to-gold-500 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-saffron-600 to-emerald-600 bg-clip-text text-transparent">
                  UniVera
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Smart Education Platform
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-saffron-500 to-gold-500 text-white shadow-md"
                      : "text-gray-700 hover:text-saffron-600 hover:bg-saffron-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right (desktop only) */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Favorites */}
              <button
                onClick={() => setActiveTab("favorites")}
                className="relative p-2 text-gray-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-colors"
              >
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* User / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2"
                  >
                    <span className="max-w-24 truncate font-medium">
                      {userProfile?.displayName || "User"}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                      <button
                        onClick={() => {
                          setShowUserProfile(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-saffron-500 to-gold-500 text-white px-4 py-2 rounded-lg"
                >
                  <span>Login</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t">
            <nav className="flex flex-col space-y-1 p-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-saffron-500 to-gold-500 text-white shadow-md"
                      : "text-gray-700 hover:text-saffron-600 hover:bg-saffron-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Favorites in mobile */}
              <button
                onClick={() => {
                  setActiveTab("favorites");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "favorites"
                    ? "bg-gradient-to-r from-saffron-500 to-gold-500 text-white shadow-md"
                    : "text-gray-700 hover:text-saffron-600 hover:bg-saffron-50"
                }`}
              >
                Favorites
                {favoritesCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 inline-flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* User / Login */}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setShowUserProfile(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium bg-gradient-to-r from-saffron-500 to-gold-500 text-white"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        )}

        {/* --- Stacked floating actions for mobile --- */}
        {!isMobileMenuOpen && (
          <div className="md:hidden fixed right-4 bottom-4 z-50 flex flex-col gap-3 items-center">
            {/* Login button */}
            {!user && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-saffron-500 to-gold-500 text-white h-11 w-11 rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
                aria-label="Login"
              >
                <LogIn className="h-5 w-5" />
              </button>
            )}

            {/* Chatbot button */}
            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className="bg-yellow-400 text-white h-11 w-11 rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
              aria-label="Chatbot"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </header>

      {/* Modals */}
      {showLoginModal && <LoginPage onClose={() => setShowLoginModal(false)} />}
      {showUserProfile && <UserProfile onClose={() => setShowUserProfile(false)} />}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Chatbot modal (optional) */}
      {showChatbot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowChatbot(false)}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-sm w-11/12 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Chatbot</h2>
            <p className="text-sm text-gray-600">
              (Your chatbot interface or component will go here)
            </p>
            <button
              onClick={() => setShowChatbot(false)}
              className="mt-3 bg-saffron-500 text-white px-3 py-1 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
