import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiClipboard,
  FiFolder,
  FiSettings,
  FiX,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiChevronUp,
  FiUserPlus,
  FiUserCheck,
  FiCalendar,
} from 'react-icons/fi';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { apiSlice } from '../app/api/apiSlice';
import Button from '../components/Button';
import PGI_Logo from '../assets/PGI_Logo.png';

// MWO Sidebar Navigation Component
const MWONavigation = ({ onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Dashboard */}
      <NavLink
        to="/"
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
          }`
        }
      >
        <div className={`p-2 rounded-lg mr-3 transition-colors ${
          location.pathname === '/'
            ? 'bg-white/20'
            : 'bg-gray-100 group-hover:bg-primary-100'
        }`}>
          <FiHome className="h-5 w-5" />
        </div>
        <span>Dashboard</span>
      </NavLink>

      {/* Register New Patient */}
      <NavLink
        to="/patients/new"
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
          }`
        }
      >
        <div className={`p-2 rounded-lg mr-3 transition-colors ${
          location.pathname === '/outpatient/new'
            ? 'bg-white/20'
            : 'bg-gray-100 group-hover:bg-primary-100'
        }`}>
          <FiUserPlus className="h-5 w-5" />
        </div>
        <span>Register New Patient</span>
      </NavLink>

      {/* All Patient Records */}
      <NavLink
        to="/patients"
        onClick={onClose}
        end
        className={({ isActive }) =>
          `group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
          }`
        }
      >
        <div className={`p-2 rounded-lg mr-3 transition-colors ${
          location.pathname === '/patients'
            ? 'bg-white/20'
            : 'bg-gray-100 group-hover:bg-primary-100'
        }`}>
          <FiClipboard className="h-5 w-5" />
        </div>
        <span>All Patient Records</span>
      </NavLink>

      

      {/* Existing Patient */}
      <NavLink
        to="/patients/select"
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
          }`
        }
      >
        <div className={`p-2 rounded-lg mr-3 transition-colors ${
          location.pathname === '/outpatient/select'
            ? 'bg-white/20'
            : 'bg-gray-100 group-hover:bg-primary-100'
        }`}>
          <FiUserCheck className="h-5 w-5" />
        </div>
        <span>Existing Patients</span>
      </NavLink>
    </>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    onClose(); // Close sidebar on mobile after logout
    navigate('/login', { replace: true });
    setTimeout(() => window.location.replace('/login'), 0);
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigation = [
    { name: 'Dashboard', to: '/', icon: FiHome, roles: ['Admin', 'JR', 'SR', 'MWO'] },
    { name: 'Patients', to: '/patients', icon: FiUsers, roles: ['Admin', 'JR', 'SR', 'MWO'] },
    { name: "Today's Patients", to: '/today-patients', icon: FiCalendar, roles: ['Admin', 'JR', 'SR'] },
    { name: 'Outpatient Records', to: '/outpatient', icon: FiClipboard, roles: ['Admin', 'MWO'] },
    { name: 'Clinical Proforma', to: '/clinical', icon: FiFileText, roles: ['Admin', 'JR', 'SR'] },
    { name: 'ADL Files', to: '/adl-files', icon: FiFolder, roles: ['Admin', 'JR', 'SR'] },
    { name: 'Users', to: '/users', icon: FiSettings, roles: ['Admin'] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 glass-sidebar shadow-2xl transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:fixed lg:inset-y-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo and Title Section */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img src={PGI_Logo} alt="PGIMER Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-primary-900">PGIMER PSY</h1>
                <p className="text-xs text-gray-600"> Psychiatry Department - PGIMER Chandigarh</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white/20"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation - scrollable middle section */}
          <nav className="flex-1 px-4 py-6 pb-48 space-y-2 overflow-y-auto min-h-0">
            {user?.role === 'MWO' ? (
              // MWO-specific beautiful navigation
              <MWONavigation onClose={onClose} />
            ) : (
              // Other roles navigation (Admin, JR, SR)
              filteredNavigation.map((item) => {
                const location = window.location.pathname;
                const isActive = location === item.to || location.startsWith(item.to + '/');

                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : 'text-gray-700 hover:bg-white/40 hover:text-primary-700 hover:shadow-md'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`p-2 rounded-lg mr-3 transition-colors ${
                          isActive
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-primary-100'
                        }`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })
            )}
          </nav>

          {/* User info and actions - ABSOLUTELY FIXED at bottom - NOT scrollable */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white/80 backdrop-blur-md p-4 space-y-3 shadow-lg">
            {/* User Profile Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <FiUser className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mt-1">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <NavLink
                to="/profile"
                onClick={onClose}
                className="group flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm border border-gray-200 backdrop-blur-sm"
              >
                <div className="p-1.5 rounded-lg bg-gray-200 group-hover:bg-gray-300 mr-3 transition-colors">
                  <FiUser className="h-4 w-4" />
                </div>
                Profile Settings
              </NavLink>

              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md border border-red-600 backdrop-blur-sm"
              >
                <div className="p-1.5 rounded-lg bg-red-600 group-hover:bg-red-700 mr-3 transition-colors">
                  <FiLogOut className="h-4 w-4" />
                </div>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

