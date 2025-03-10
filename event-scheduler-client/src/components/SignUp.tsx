import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { clearError, registerUser } from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const actionResult = await dispatch(registerUser(formData));
            if (registerUser.fulfilled.match(actionResult)) {
                navigate('/sign-in');
            }
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Sign Up</h2>
                {error && <div className="text-red-500 text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            required
                            className="w-full px-3 py-2 border rounded"
                            onChange={handleChange}
                            value={formData.name}
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                            className="w-full px-3 py-2 border rounded"
                            onChange={handleChange}
                            value={formData.email}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            className="w-full px-3 py-2 border rounded"
                            onChange={handleChange}
                            value={formData.password}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>
                <p className="text-center">
                    Already have an account?{' '}
                    <Link to="/sign-in" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
