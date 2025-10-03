import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
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
} from 'react-icons/fi';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import Button from '../components/Button';

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    onClose(); // Close sidebar on mobile after logout
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
    { name: 'Patients', to: '/patients', icon: FiUsers, roles: ['Admin', 'JR', 'SR', 'MWO'], description: 'View patients only' },
    { name: 'Outpatient Records', to: '/outpatient', icon: FiClipboard, roles: ['Admin', 'MWO'], description: 'Create patients & records' },
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
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:fixed lg:inset-y-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo and Title Section */}
          <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0 bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-primary-600">PGI EMRS</h1>
                <p className="text-xs text-gray-500">Patient Management</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation - scrollable middle section */}
          <nav className="flex-1 px-4 py-6 pb-48 space-y-1 overflow-y-auto min-h-0">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User info and actions - ABSOLUTELY FIXED at bottom - NOT scrollable */}
          <div className="absolute bottom-0 left-0 right-0 border-t p-4 space-y-3 bg-white">
            {/* User Profile Section */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-primary-600 font-medium">{user?.role}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1">
              <NavLink
                to="/profile"
                onClick={onClose}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiUser className="h-4 w-4 mr-3" />
                Profile Settings
              </NavLink>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <FiLogOut className="h-4 w-4 mr-3" />
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

