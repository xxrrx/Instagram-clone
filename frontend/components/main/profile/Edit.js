import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Button, Image, Text, TextInput, TouchableOpacity, View, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateUserFeedPosts } from '../../../redux/actions/index';
import { container, form, navbar, text, utils, colors, gradients } from '../../styles';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../../../contexts/ThemeContext';

function Edit(props) {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [name, setName] = useState(props.currentUser.name);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(props.currentUser.image);
    const [imageChanged, setImageChanged] = useState(false);
    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

    const onLogout = async () => {
        getAuth().signOut();
        Updates.reloadAsync()
    }

    useEffect(() => {
        (async () => {
            if (props.currentUser.description !== undefined) {
                setDescription(props.currentUser.description)
            }
        })();
    }, []);

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 15, backgroundColor: colors.freshGreen, padding: 10, borderRadius: 20 }}
                    onPress={() => { console.log({ name, description }); Save() }}
                >
                    <Feather name="check" size={20} color="white" />
                </TouchableOpacity>
            ),
        });
    }, [props.navigation, name, description, image, imageChanged]);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            console.log('ImagePicker result:', result);

            // SDK 51 uses 'canceled' not 'cancelled'
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
                setImageChanged(true);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const Save = async () => {
        if (imageChanged) {
            const uri = image;
            const childPath = `profile/${getAuth().currentUser.uid}`;

            try {
                const response = await fetch(uri);
                const blob = await response.blob();

                // Firebase v10 Storage upload
                const storageRef = ref(getStorage(), childPath);
                await uploadBytes(storageRef, blob);
                const downloadURL = await getDownloadURL(storageRef);

                // Firebase v10 Firestore update
                await updateDoc(doc(getFirestore(), "users", getAuth().currentUser.uid), {
                    name,
                    description,
                    image: downloadURL,
                });

                props.updateUserFeedPosts();
                props.navigation.goBack();
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        } else {
            saveData({
                name,
                description,
            })
        }
    }

    const saveData = async (data) => {
        try {
            await updateDoc(doc(getFirestore(), "users", getAuth().currentUser.uid), data);
            props.updateUserFeedPosts();
            props.navigation.goBack();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    }

    return (
        <LinearGradient
            colors={isDarkMode ? theme.gradients.purple : ['#E1306C', '#FD1D1D', '#FCAF45']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                <View style={{
                    backgroundColor: theme.card,
                    borderRadius: 24,
                    padding: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.2,
                    shadowRadius: 20,
                    elevation: 10
                }}>
                    <TouchableOpacity
                        style={[utils.centerHorizontal, { marginBottom: 30 }]}
                        onPress={() => pickImage()}
                    >
                        <View style={{ position: 'relative' }}>
                            {image == 'default' ?
                                (
                                    <FontAwesome5
                                        style={[utils.profileImageBig, utils.marginBottomSmall, { borderWidth: 4, borderColor: colors.electricBlue }]}
                                        name="user-circle" size={100} color={colors.vibrantPurple} />
                                )
                                :
                                (
                                    <Image
                                        style={[{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: colors.electricBlue, marginBottom: 10 }]}
                                        source={{
                                            uri: image
                                        }}
                                    />
                                )
                            }
                            <View style={{
                                position: 'absolute',
                                bottom: 10,
                                right: 0,
                                backgroundColor: colors.electricBlue,
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 3,
                                borderColor: 'white'
                            }}>
                                <Feather name="camera" size={18} color="white" />
                            </View>
                        </View>
                        <Text style={[text.bold, { color: colors.electricBlue, fontSize: 16, marginTop: 5 }]}>
                            Change Profile Photo
                        </Text>
                    </TouchableOpacity>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textLabel, marginBottom: 8 }}>
                            Name
                        </Text>
                        <TextInput
                            value={name}
                            style={{
                                backgroundColor: theme.inputBackground,
                                borderRadius: 16,
                                padding: 16,
                                fontSize: 16,
                                borderWidth: 2,
                                borderColor: 'transparent',
                                color: theme.inputText
                            }}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.inputPlaceholder}
                            onChangeText={(name) => setName(name)}
                        />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textLabel, marginBottom: 8 }}>
                            Description
                        </Text>
                        <TextInput
                            value={description}
                            style={{
                                backgroundColor: theme.inputBackground,
                                borderRadius: 16,
                                padding: 16,
                                fontSize: 16,
                                borderWidth: 2,
                                borderColor: 'transparent',
                                minHeight: 100,
                                textAlignVertical: 'top',
                                color: theme.inputText
                            }}
                            multiline
                            numberOfLines={4}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor={theme.inputPlaceholder}
                            onChangeText={(description) => { setDescription(description); }}
                        />
                    </View>

                    <View style={{
                        marginBottom: 30,
                        backgroundColor: theme.backgroundTertiary,
                        borderRadius: 16,
                        padding: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: isDarkMode ? '#FFD700' : '#9D4EDD',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 12
                            }}>
                                {isDarkMode ? (
                                    <Ionicons name="moon" size={22} color="#000" />
                                ) : (
                                    <Ionicons name="sunny" size={22} color="#FFF" />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 2 }}>
                                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                                </Text>
                                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                                    {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#D0D0D0', true: '#9D4EDD' }}
                            thumbColor={isDarkMode ? '#FFD700' : '#f4f3f4'}
                            ios_backgroundColor="#D0D0D0"
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.coralRed,
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: 'center',
                            shadowColor: colors.coralRed,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                            elevation: 8
                        }}
                        onPress={() => onLogout()}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="log-out" size={20} color="white" style={{ marginRight: 10 }} />
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                                Logout
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
})

const mapDispatchProps = (dispatch) => bindActionCreators({ updateUserFeedPosts }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Edit);
