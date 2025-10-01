import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiClipboard,
  FiFolder,
  FiSettings,
  FiX,
} from 'react-icons/fi';
import { selectCurrentUser } from '../features/auth/authSlice';

const Sidebar = ({ isOpen, onClose }) => {
  const user = useSelector(selectCurrentUser);

  const navigation = [
    { name: 'Dashboard', to: '/', icon: FiHome, roles: ['Admin', 'JR', 'SR', 'MWO'] },
    { name: 'Patients', to: '/patients', icon: FiUsers, roles: ['Admin', 'JR', 'SR', 'MWO'] },
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
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between h-16 px-4 border-b lg:hidden">
            <h2 className="text-xl font-bold text-primary-600">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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

          {/* User info (mobile) */}
          <div className="border-t p-4 lg:hidden">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Role: {user?.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

