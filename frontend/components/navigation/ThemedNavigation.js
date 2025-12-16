import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// This component provides theme-aware screen options for navigation
export const useThemedScreenOptions = () => {
    const { theme, isDarkMode } = useTheme();

    return {
        headerStyle: {
            backgroundColor: theme.card,
            shadowColor: theme.shadowColor,
            elevation: 4,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
            color: theme.text,
        },
        cardStyle: {
            backgroundColor: theme.background,
        },
    };
};

// HOC to wrap navigation with themed options
export const withThemedNavigation = (WrappedComponent) => {
    return function ThemedNavigationWrapper(props) {
        const { theme, isDarkMode } = useTheme();

        const screenOptions = {
            headerStyle: {
                backgroundColor: theme.card,
                shadowColor: theme.shadowColor,
                elevation: 4,
            },
            headerTintColor: theme.text,
            headerTitleStyle: {
                fontWeight: '700',
                fontSize: 18,
                color: theme.text,
            },
            cardStyle: {
                backgroundColor: theme.background,
            },
        };

        return <WrappedComponent {...props} screenOptions={screenOptions} theme={theme} isDarkMode={isDarkMode} />;
    };
};
