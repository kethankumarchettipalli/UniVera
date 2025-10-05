// src/components/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Calendar,
  MapPin,
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SocialLogin from './SocialLogin';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { safeSignUp } from '../../lib/authHelpers';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  interests?: string[];
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

interface ForgotPasswordFormData {
  email: string;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify-email';

interface LoginPageProps {
  onClose: () => void;
  initialMode?: AuthMode;
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    login, 
    register: authRegister, // keep a reference if useAuth exposes it, but we will use safeSignUp
    resetPassword, 
    resendVerification, 
    user,
    userProfile 
  } = useAuth();

  const loginForm = useForm<LoginFormData>();
  const registerForm = useForm<RegisterFormData>();
  const forgotPasswordForm = useForm<ForgotPasswordFormData>();

  const interestOptions = [
    'Engineering', 'Medical', 'Commerce', 'Arts', 'Science', 'Management',
    'Technology', 'Sports', 'Music', 'Travel', 'Reading', 'Photography'
  ];

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password, data.rememberMe);
      onClose();
    } catch (error) {
      // Error handled in useAuth hook (or show fallback)
      toast.error((error as any)?.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * NEW: register flow now uses safeSignUp (creates auth user + firestore doc, rolls back on failure)
   */
  const handleRegister = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    if (!data.agreeToTerms) {
      registerForm.setError('agreeToTerms', {
        type: 'manual',
        message: 'You must agree to the terms'
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await safeSignUp(data.email.trim(), data.password, {
        displayName: data.displayName?.trim(),
        phoneNumber: data.phoneNumber?.trim(),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        location: data.location,
        interests: Array.isArray(data.interests) ? data.interests : [],
        subscribeNewsletter: !!data.subscribeNewsletter,
        preferences: {
          notifications: true,
          newsletter: !!data.subscribeNewsletter,
          darkMode: false,
          language: 'en'
        }
      });

      if (!result.ok) {
        // handle common reasons
        if (result.reason === 'email_exists') {
          toast.error('An account already exists with this email. Try signing in or resetting password.');
          registerForm.setError('email', { type: 'manual', message: 'Email already in use' });
        } else if (result.reason === 'firestore_failed') {
          // Firestore write failed and we rolled back auth user
          toast.error('Failed to create account (server). Please try again later.');
        } else if (result.reason === 'firestore_failed_rollback_failed') {
          toast.error('Server error. Please contact support (cleanup required).');
          console.error('safeSignUp error:', result.error);
        } else {
          toast.error('Failed to create account. See console for details.');
          console.error('safeSignUp unknown error:', result);
        }
        setIsLoading(false);
        return;
      }

      // success — user and user doc created, verification email was sent
      toast.success('Account created. Verification email sent.');
      setMode('verify-email');
    } catch (err) {
      console.error('[LoginPage] register unexpected error:', err);
      toast.error('Unexpected error during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email);
      toast.success('Reset link sent (if the email exists).');
      setMode('login');
    } catch (error) {
      toast.error((error as any)?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await resendVerification();
      toast.success('Verification email resent.');
    } catch (error) {
      toast.error((error as any)?.message || 'Failed to resend verification');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const renderLoginForm = () => (
    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="email"
            {...loginForm.register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
            placeholder="Enter your email"
          />
        </div>
        {loginForm.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            {...loginForm.register('password', { required: 'Password is required' })}
            className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {loginForm.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            {...loginForm.register('rememberMe')}
            className="h-4 w-4 text-saffron-600 focus:ring-saffron-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => setMode('forgot-password')}
          className="text-sm text-saffron-600 hover:text-saffron-700 font-medium"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-saffron-600 hover:to-gold-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="text-center">
        <span className="text-gray-600">Don't have an account? </span>
        <button
          type="button"
          onClick={() => setMode('register')}
          className="text-saffron-600 hover:text-saffron-700 font-semibold"
        >
          Sign up
        </button>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              {...registerForm.register('displayName', { required: 'Full name is required' })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
              placeholder="Enter your full name"
            />
          </div>
          {registerForm.formState.errors.displayName && (
            <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.displayName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              {...registerForm.register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
              placeholder="Enter your email"
            />
          </div>
          {registerForm.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="tel"
              {...registerForm.register('phoneNumber')}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              {...registerForm.register('dateOfBirth')}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender
          </label>
          <select
            {...registerForm.register('gender')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              {...registerForm.register('location')}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
              placeholder="City, State"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Interests (Select multiple)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {interestOptions.map((interest) => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                value={interest}
                {...registerForm.register('interests')}
                className="h-4 w-4 text-saffron-600 focus:ring-saffron-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            {...registerForm.register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <PasswordStrengthIndicator 
          password={registerForm.watch('password') || ''} 
          strength={getPasswordStrength(registerForm.watch('password') || '')}
        />
        {registerForm.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            {...registerForm.register('confirmPassword', { required: 'Please confirm your password' })}
            className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {registerForm.formState.errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex items-start">
          <input
            type="checkbox"
            {...registerForm.register('agreeToTerms', { required: 'You must agree to the terms' })}
            className="h-4 w-4 text-saffron-600 focus:ring-saffron-500 border-gray-300 rounded mt-1"
          />
          <span className="ml-2 text-sm text-gray-600">
            I agree to the <a href="#" className="text-saffron-600 hover:text-saffron-700">Terms of Service</a> and{' '}
            <a href="#" className="text-saffron-600 hover:text-saffron-700">Privacy Policy</a>
          </span>
        </label>
        {registerForm.formState.errors.agreeToTerms && (
          <p className="text-sm text-red-600">{registerForm.formState.errors.agreeToTerms.message}</p>
        )}

        <label className="flex items-center">
          <input
            type="checkbox"
            {...registerForm.register('subscribeNewsletter')}
            className="h-4 w-4 text-saffron-600 focus:ring-saffron-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">
            Subscribe to our newsletter for updates and tips
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-saffron-600 hover:to-gold-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <div className="text-center">
        <span className="text-gray-600">Already have an account? </span>
        <button
          type="button"
          onClick={() => setMode('login')}
          className="text-saffron-600 hover:text-saffron-700 font-semibold"
        >
          Sign in
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="h-16 w-16 text-saffron-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Reset Your Password</h3>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="email"
            {...forgotPasswordForm.register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none transition-colors"
            placeholder="Enter your email"
          />
        </div>
        {forgotPasswordForm.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">{forgotPasswordForm.formState.errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-saffron-600 hover:to-gold-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Sending reset link...
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setMode('login')}
          className="flex items-center justify-center text-saffron-600 hover:text-saffron-700 font-medium mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </button>
      </div>
    </form>
  );

  const renderVerifyEmailForm = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Verify Your Email</h3>
        <p className="text-gray-600 mb-4">
          We've sent a verification email to <strong>{user?.email}</strong>. 
          Please check your inbox and click the verification link to activate your account.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
            <p className="text-sm text-amber-800">
              Didn't receive the email? Check your spam folder or click resend below.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleResendVerification}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-saffron-600 hover:to-gold-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Sending...
            </>
          ) : (
            'Resend Verification Email'
          )}
        </button>

        <button
          onClick={onClose}
          className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Your Account';
      case 'forgot-password': return 'Forgot Password';
      case 'verify-email': return 'Email Verification';
      default: return 'Welcome';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your UniWera account';
      case 'register': return 'Join thousands of students finding their perfect educational path';
      case 'forgot-password': return 'Reset your password securely';
      case 'verify-email': return 'Almost there! Just verify your email';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid lg:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="hidden lg:block bg-gradient-to-br from-saffron-500 to-gold-500 p-8 rounded-l-2xl">
            <div className="h-full flex flex-col justify-center text-white">
              <div className="mb-8">
                <h1 className="text-4xl font-display font-bold mb-4">UniWera</h1>
                <p className="text-xl opacity-90 mb-6">
                  Your gateway to the perfect educational journey in India
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3" />
                    <span>10,000+ Colleges Listed</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3" />
                    <span>50,000+ PG/Hostels</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3" />
                    <span>AI-Powered Recommendations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3" />
                    <span>Trusted by 2L+ Students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Forms */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
                <p className="text-gray-600 mt-1">{getSubtitle()}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {mode === 'login' && (
              <>
                <SocialLogin />
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>
                {renderLoginForm()}
              </>
            )}

            {mode === 'register' && (
              <>
                <SocialLogin isRegister />
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or register with email</span>
                  </div>
                </div>
                {renderRegisterForm()}
              </>
            )}

            {mode === 'forgot-password' && renderForgotPasswordForm()}
            {mode === 'verify-email' && renderVerifyEmailForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
