import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import Button from '../components/Button';

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-md z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center ml-2 lg:ml-0">
              <h1 className="text-2xl font-bold text-primary-600">PGI EMRS</h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/profile" title="Profile Settings">
                <Button variant="ghost" size="sm">
                  <FiUser className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                title="Sign Out"
                className="text-gray-600 hover:text-red-600"
              >
                <FiLogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

