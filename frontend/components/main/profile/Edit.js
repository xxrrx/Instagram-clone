import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Button, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateUserFeedPosts } from '../../../redux/actions/index';
import { container, form, navbar, text, utils } from '../../styles';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Edit(props) {
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
                <Feather style={navbar.image} name="check" size={24} color="green" onPress={() => { console.log({ name, description }); Save() }} />
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
        <View style={container.form}>

            <TouchableOpacity style={[utils.centerHorizontal, utils.marginBottom]} onPress={() => pickImage()} >
                {image == 'default' ?
                    (
                        <FontAwesome5
                            style={[utils.profileImageBig, utils.marginBottomSmall]}
                            name="user-circle" size={80} color="black" />
                    )
                    :
                    (
                        <Image
                            style={[utils.profileImageBig, utils.marginBottomSmall]}
                            source={{
                                uri: image
                            }}
                        />
                    )
                }
                <Text style={text.changePhoto}>Change Profile Photo</Text>
            </TouchableOpacity>

            <TextInput
                value={name}
                style={form.textInput}
                placeholder="Name"
                onChangeText={(name) => setName(name)}
            />
            <TextInput
                value={description}
                style={[form.textInput]}
                placeholderTextColor={"#e8e8e8"}
                placeholder="Description"
                onChangeText={(description) => { setDescription(description); }}
            />
            <Button
                title="Logout"
                onPress={() => onLogout()} />
        </View>

    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
})

const mapDispatchProps = (dispatch) => bindActionCreators({ updateUserFeedPosts }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Edit);
