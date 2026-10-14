import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/api';

const AuthModal = ({ onLoginSuccess, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'farmer',
        phoneNumber: '',
        location: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            let data;
            if (isLogin) {
                data = await loginUser({ email: formData.email, password: formData.password });
            } else {
                data = await registerUser(formData);
            }

            // Save token and user in browser localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            onLoginSuccess(data.user);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="auth-modal-overlay">
            <div className="auth-card relative">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-xl cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                        ✕
                    </button>
                )}
                <h2>{isLogin ? '🔑 User Login' : '📝 Create Account'}</h2>

                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="farmer">🌱 Farmer</option>
                                <option value="supplier">📦 Supplier</option>
                                <option value="customer">🛒 Customer</option>
                            </select>
                            <input
                                type="text"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="location"
                                placeholder="Location (e.g. Matara)"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="btn btn-auth">
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <p className="auth-toggle">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn-link">
                        {isLogin ? 'Register Here' : 'Login Here'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;