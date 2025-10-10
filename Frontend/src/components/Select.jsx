import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    const event = {
      target: {
        name,
        value: optionValue
      }
    };
    onChange(event);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Hidden native select for form submission */}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-10
            bg-white border-2 rounded-xl
            text-left font-medium
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            hover:border-primary-400
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:border-gray-300
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}
            ${!value ? 'text-gray-500' : 'text-gray-900'}
            ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}
            ${className}
          `}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </button>

        {/* Custom dropdown arrow */}
        <div className={`
          absolute right-3 top-1/2 -translate-y-1/2
          pointer-events-none
          transition-all duration-200
          ${isOpen ? 'rotate-180' : 'rotate-0'}
          ${disabled ? 'text-gray-400' : error ? 'text-red-500' : 'text-primary-600'}
        `}>
          <FiChevronDown className="h-5 w-5" />
        </div>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div
            className="absolute left-0 right-0 z-[9999] mt-2 bg-white border-2 border-primary-200 rounded-xl shadow-2xl overflow-hidden"
            style={{
              top: '100%'
            }}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options available
                </div>
              ) : (
                options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-3 text-left
                      flex items-center justify-between
                      transition-colors duration-150
                      ${value === option.value
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                      ${index !== 0 ? 'border-t border-gray-100' : ''}
                    `}
                  >
                    <span className="flex-1">{option.label}</span>
                    {value === option.value && (
                      <FiCheck className="h-5 w-5 text-primary-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;

