import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

export default function SignupPage() {
  const { user, registerMutation } = useAuth();
  const [userData, setUserData] = React.useState({
    firstName: '',
    lastName: '',
    agencyName: '',
    country: '',
    phoneNumber: '',
    website: '',
    email: '',
    password: '',
    role: '',
  });

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert to the expected format for the API
    const registerData = {
      username: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      agencyName: userData.agencyName,
      country: userData.country,
      phoneNumber: userData.phoneNumber,
      website: userData.website,
      role: userData.role,
    };
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
        <p className="text-gray-600">Enter your details to register as an agent</p>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-1">Create an Account</h2>
        <p className="text-gray-600 text-sm mb-6">Join our network of global education agents</p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="John"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={userData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={userData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="agencyName" className="block text-gray-700 mb-2">
              Agency Name
            </label>
            <input
              type="text"
              id="agencyName"
              name="agencyName"
              placeholder="Global Education Services"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={userData.agencyName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="country" className="block text-gray-700 mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={userData.country}
                onChange={handleChange}
                required
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="IN">India</option>
                <option value="AU">Australia</option>
                <option value="AE">United Arab Emirates</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={userData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="website" className="block text-gray-700 mb-2">
              Website (Optional)
            </label>
            <input
              type="url"
              id="website"
              name="website"
              placeholder="https://www.example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={userData.website}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 mb-2">
              I am a
            </label>
            <select
              id="role"
              name="role"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={userData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select role</option>
              <option value="agent">Education Agent</option>
              <option value="counselor">Education Counselor</option>
              <option value="recruiter">Student Recruiter</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 rounded-md font-medium hover:bg-gray-800"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}