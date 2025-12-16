import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('@theme_preference');
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            await AsyncStorage.setItem('@theme_preference', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const theme = {
        // Background Colors
        background: isDarkMode ? '#000000' : '#FFFFFF',
        backgroundSecondary: isDarkMode ? '#1A1A1A' : '#FAFAFA',
        backgroundTertiary: isDarkMode ? '#2D2D2D' : '#F5F5F5',

        // Card Colors
        card: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        cardBorder: isDarkMode ? '#2D2D2D' : '#F0F0F0',

        // Text Colors - improved for dark mode visibility
        text: isDarkMode ? '#FFFFFF' : '#2D2D2D',
        textSecondary: isDarkMode ? '#E0E0E0' : '#757575',
        textTertiary: isDarkMode ? '#B0B0B0' : '#9E9E9E',
        textLabel: isDarkMode ? '#00D4FF' : '#757575',

        // Input Colors - improved for dark mode
        inputBackground: isDarkMode ? '#2D2D2D' : '#F5F5F5',
        inputBorder: isDarkMode ? '#3D3D3D' : '#E0E0E0',
        inputText: isDarkMode ? '#FFFFFF' : '#2D2D2D',
        inputPlaceholder: isDarkMode ? '#A0A0A0' : '#9E9E9E',

        // Accent Colors (stay same in both themes)
        primary: '#00D4FF',
        secondary: '#9D4EDD',
        accent: '#FF1493',
        success: '#06FFA5',
        error: '#FF6B6B',
        warning: '#FFD700',

        // Chat Colors
        chatBubbleOwn: isDarkMode ? '#00D4FF' : '#00D4FF',
        chatBubbleOther: isDarkMode ? '#2D2D2D' : '#FFFFFF',
        chatTextOwn: '#FFFFFF',
        chatTextOther: isDarkMode ? '#FFFFFF' : '#2D2D2D',

        // Border & Divider
        border: isDarkMode ? '#2D2D2D' : '#E8E8E8',
        divider: isDarkMode ? '#2D2D2D' : '#F0F0F0',

        // Shadow (for cards)
        shadowColor: isDarkMode ? '#000000' : '#000000',
        shadowOpacity: isDarkMode ? 0.5 : 0.1,

        // Gradient colors
        gradients: {
            instagram: isDarkMode
                ? ['#E1306C', '#C13584', '#833AB4']
                : ['#E1306C', '#FD1D1D', '#FCAF45'],
            tiktok: isDarkMode
                ? ['#00F2EA', '#FF0050', '#000000']
                : ['#00F2EA', '#FF0050'],
            purple: isDarkMode
                ? ['#9D4EDD', '#7209B7']
                : ['#9D4EDD', '#FF1493'],
            blue: isDarkMode
                ? ['#00D4FF', '#0066FF']
                : ['#00D4FF', '#9D4EDD'],
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
