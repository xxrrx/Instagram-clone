import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

import MainScreen from './Main';
import SaveScreen from './main/add/Save';
import ChatScreen from './main/chat/Chat';
import ChatListScreen from './main/chat/List';
import CommentScreen from './main/post/Comment';
import PostScreen from './main/post/Post';
import EditScreen from './main/profile/Edit';
import ProfileScreen from './main/profile/Profile';
import BlockedScreen from './main/random/Blocked';
import FollowersListScreen from './main/profile/FollowersList';
import FollowingListScreen from './main/profile/FollowingList';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { theme, isDarkMode } = useTheme();

    const screenOptions = {
        headerStyle: {
            backgroundColor: theme.card,
            shadowColor: theme.shadowColor,
            elevation: 4,
            borderBottomWidth: 0,
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

    const getMainScreenOptions = ({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Feed';

        const baseOptions = {
            ...screenOptions,
            headerStyle: {
                ...screenOptions.headerStyle,
            },
        };

        switch (routeName) {
            case 'Camera':
                return { ...baseOptions, headerTitle: 'Camera' };
            case 'chat':
                return { ...baseOptions, headerTitle: 'Chat' };
            case 'Profile':
                return { ...baseOptions, headerTitle: 'Profile' };
            case 'Search':
                return { ...baseOptions, headerTitle: 'Search' };
            case 'Feed':
            default:
                return { ...baseOptions, headerTitle: 'Instagram' };
        }
    };

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Main"
                screenOptions={screenOptions}
            >
                <Stack.Screen
                    name="Main"
                    component={MainScreen}
                    options={getMainScreenOptions}
                />
                <Stack.Screen name="Save" component={SaveScreen} />
                <Stack.Screen name="video" component={SaveScreen} />
                <Stack.Screen name="Post" component={PostScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="ChatList" component={ChatListScreen} />
                <Stack.Screen name="Edit" component={EditScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Comment" component={CommentScreen} />
                <Stack.Screen name="ProfileOther" component={ProfileScreen} />
                <Stack.Screen
                    name="Blocked"
                    component={BlockedScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="FollowersList"
                    component={FollowersListScreen}
                    options={{ headerTitle: 'Followers' }}
                />
                <Stack.Screen
                    name="FollowingList"
                    component={FollowingListScreen}
                    options={{ headerTitle: 'Following' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
