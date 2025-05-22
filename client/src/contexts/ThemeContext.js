import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useCookies } from 'react-cookie';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('darkMode');
        if (theme && theme !== "undefined") {
            setDarkMode(true);
        }

    }, []);


    const darkModeActivate = (darkmode) => {
        setDarkMode(!darkMode)
        localStorage.setItem("darkMode", !darkMode)
    };

    return (
        <ThemeContext.Provider value={{ darkModeActivate, darkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => {
    return React.useContext(ThemeContext);
};

export { ThemeProvider, useTheme };