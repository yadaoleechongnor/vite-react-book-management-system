import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { login as authLogin, getAuthToken } from '../utils/auth'; // Fix import to use getAuthToken instead of getToken
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, userRole, getRedirectPath } = useAuth();
  const { t, i18n } = useTranslation();
  const { toggleLanguage } = useLanguage();

  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(getRedirectPath());
    }
  }, [isAuthenticated, userRole, navigate, getRedirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const result = await authLogin(email, password);

      if (result && result.success) {
        const token = result.data?.token || (result.data?.data?.token || '');

        let role;
        if (result.data?.user?.role) {
          role = result.data.user.role;
        } else if (result.data?.data?.user?.role) {
          role = result.data.data.user.role;
        } else if (result.data?.role) {
          role = result.data.role;
        } else {
          role = determineUserRole(email);
        }

        if (!token) {
          throw new Error('Authentication successful but no token received');
        }

        let redirectPath;
        switch (role.toLowerCase()) {
          case 'admin':
            redirectPath = '/admin/dashboard';
            break;
          case 'teacher':
            redirectPath = '/teacher/dashboard';
            break;
          case 'student':
            redirectPath = '/student/bookpage';
            break;
          default:
            redirectPath = '/';
        }

        login(token, role);

        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome back! Logged in as ${role}...`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate(redirectPath);
        });
      } else {
        setError(result?.error || 'Login failed. Please check your credentials.');
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: result?.error || 'Please check your credentials and try again.',
        });
      }
    } catch (err) {
      let errorMessage = 'An error occurred. Please try again later.';

      if (err.message.includes('correctPassword')) {
        errorMessage = 'Authentication method error. Please contact support.';
      } else if (err.message.includes('400')) {
        errorMessage = 'Invalid login credentials. Please check your email and password.';
      }

      setError(errorMessage);

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const determineUserRole = (email) => {
    const emailLower = email.toLowerCase();

    if (emailLower.includes('admin')) {
      return 'admin';
    } else if (
      emailLower.includes('teacher') ||
      emailLower.includes('lecturer') ||
      emailLower.includes('professor') ||
      emailLower.includes('instructor')
    ) {
      return 'teacher';
    } else {
      return 'student';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            {i18n.language === 'en' ? 'ພາສາລາວ' : 'English'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 border border-sky-500">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{t('login.title')}</h2>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="appearance-none border border-sky-500 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-colors"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="appearance-none border border-sky-500 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-colors"
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>
          <div className="mb-6 items-center">
            <a
              href="/requestotp"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {t('login.forgotPassword')}
            </a>
          </div>

          <div className="mb-6">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
              disabled={loading}
            >
              {loading ? t('login.loggingIn') : t('login.loginButton')}
            </button>
          </div>

          {error && <div className="mb-6 text-red-500 text-sm">{error}</div>}

          <div className="text-center mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
              <a
                href="/"
                className="text-blue-600 flex items-center gap-1 hover:text-blue-800 font-medium mb-2 sm:mb-0 transition-colors"
              >
                <IoIosArrowRoundBack /> {t('login.backToHome')}
              </a>
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-800 font-medium mb-2 sm:mb-0 transition-colors"
              >
                {t('login.signUp')}
              </a>
            </div>
          </div>
        </form>
        <p className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} {t('login.footer')}
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
