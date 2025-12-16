import { Feather } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUserPosts, sendNotification } from '../../../redux/actions/index';
import { container, navbar, text, utils } from '../../styles';

function Save(props) {
    const [caption, setCaption] = useState("")
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(false)

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <Feather style={navbar.image} name="check" size={24} color="green" onPress={() => { uploadImage() }} />
            ),
        });
    }, [caption]);

    const uploadImage = async () => {
        if (uploading) {
            return;
        }
        setUploading(true)
        const auth = getAuth();
        let downloadURLStill = null
        let downloadURL = await SaveStorage(props.route.params.source, `post/${auth.currentUser.uid}/${Math.random().toString(36)}`)

        if (props.route.params.imageSource != null) {
            downloadURLStill = await SaveStorage(props.route.params.imageSource, `post/${auth.currentUser.uid}/${Math.random().toString(36)}`)
        }

        savePostData(downloadURL, downloadURLStill);
    }

    const SaveStorage = async (image, path) => {
        if (image == 'default') {
            return '';
        }

        const storage = getStorage();
        const storageRef = ref(storage, path);

        const response = await fetch(image);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    }

    const savePostData = (downloadURL, downloadURLStill) => {
        const auth = getAuth();
        const db = getFirestore();

        let object = {
            downloadURL,
            caption,
            likesCount: 0,
            commentsCount: 0,
            type: props.route.params.type,
            creation: serverTimestamp()
        }
        if (downloadURLStill != null) {
            object.downloadURLStill = downloadURLStill
        }

        const postsRef = collection(db, 'posts', auth.currentUser.uid, 'userPosts');
        addDoc(postsRef, object).then((result) => {
            props.fetchUserPosts()
            props.navigation.popToTop()
        }).catch((error) => {
            setUploading(false)
            setError(true)
        })

        var pattern = /\\B@[a-z0-9_-]+/gi;
        let array = caption.match(pattern);

        if (array !== null) {
            for (let i = 0; i < array.length; i++) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("username", "==", array[i].substring(1)));

                getDocs(q).then((snapshot) => {
                    snapshot.forEach((doc) => {
                        props.sendNotification(doc.data().notificationToken, "New tag", `${props.currentUser.name} Tagged you in a post`, { type: 0, user: auth.currentUser.uid })
                    });
                })
            }
        }
    }

    return (
        <View style={[container.container, utils.backgroundWhite]}>
            {uploading ? (
                <View style={[container.container, utils.justifyCenter, utils.alignItemsCenter]}>
                    <ActivityIndicator style={utils.marginBottom} size="large" />
                    <Text style={[text.bold, text.large]}>Upload in progress...</Text>
                </View>
            ) : (
                <View style={[container.container]}>
                    <View style={[container.container, utils.backgroundWhite, utils.padding15]}>
                        <View style={[{ marginBottom: 20, width: '100%' }]}>
                            <TextInput
                                style={{ borderColor: '#ebebeb', borderWidth: 1, padding: 5, fontSize: 15, width: '100%', minHeight: 30, maxHeight: 80 }}
                                placeholder="Write a caption..."
                                multiline={true}
                                value={caption}
                                onChangeText={setCaption}
                            />
                        </View>
                        <View>
                            {props.route.params.type ?
                                <Image
                                    style={container.image}
                                    source={{ uri: props.route.params.source }}
                                    style={{ aspectRatio: 1 / 1, backgroundColor: 'black' }}
                                />
                                :
                                <Video
                                    source={{ uri: props.route.params.source }}
                                    shouldPlay={true}
                                    isLooping={true}
                                    resizeMode="cover"
                                    style={{ aspectRatio: 1 / 1, backgroundColor: 'black' }}
                                />
                            }
                        </View>
                    </View>
                    <Snackbar
                        visible={error}
                        duration={2000}
                        onDismiss={() => setError(false)}>
                        Something Went Wrong!
                    </Snackbar>
                </View>
            )}
        </View>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
})

const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUserPosts, sendNotification }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Save);