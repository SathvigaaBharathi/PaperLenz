import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AuthFormProps {
  onBack?: () => void;
}

export function AuthForm({ onBack }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          toast.error('Please enter a username');
          setLoading(false);
          return;
        }
        await signUp(email, password, username.trim(), 'undergraduate');
        setShowEmailVerification(true);
        toast.success('Account created! Please check your email to verify your account.');
      } else {
        await signIn(email, password);
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-amber-900 px-8 py-8 text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-amber-100">Verification link sent!</p>
            </div>
            
            <div className="p-8 text-center">
              <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Account Created Successfully!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                We've sent a verification link to <strong>{email}</strong>. 
                Please check your email and click the link to verify your account.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Check your spam folder if you don't see the email in your inbox.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setShowEmailVerification(false);
                  setIsSignUp(false);
                }}
                className="w-full bg-amber-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-amber-800 transition-all shadow-lg"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-amber-900 px-8 py-8 text-center relative">
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-4 top-4 text-white text-opacity-80 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="bg-white bg-opacity-20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">PaperLenz</h2>
            <p className="text-amber-100">See Science Clearly</p>
          </div>

          <div className="p-8">
            {/* Form Title */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {isSignUp ? 'Join thousands of researchers' : 'Sign in to continue your research'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter your email"
                />
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="Choose a username"
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-amber-800 focus:ring-2 focus:ring-amber-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-amber-900 hover:text-amber-800 font-medium transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>

            {isSignUp && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Email Verification Required:</strong> After creating your account, 
                    you'll receive a verification email. Please check your inbox and click the 
                    verification link to activate your account.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}