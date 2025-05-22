import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useCookies } from 'react-cookie';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [cookies, removeCookie] = useCookies(['token']); // Replace 'authToken' with your cookie name

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = () => {
            try {
                const token = cookies.token || "";
                if (!token || token === "undefined") {
                    return false;
                }

                const decodedToken = jwtDecode(token);

                // Check if token has expired
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    console.log("Token expired");
                    removeCookie('token');
                    return false;
                }

                // Token is valid, set user
                setUser(decodedToken);
                return true;
            } catch (error) {
                console.error("Token verification error:", error);
                removeCookie('token');
                return false;
            }
        };

        verifyToken();
        setLoading(false);
    }, [cookies.token, removeCookie]);

    const login = (token) => {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
    };

    const logout = () => {
        setUser(null);
        removeCookie('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    return React.useContext(AuthContext);
};

export { AuthProvider, useAuth };