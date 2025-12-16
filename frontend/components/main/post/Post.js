import { Entypo, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Video } from 'expo-av';
// import VideoPlayer from 'expo-video-player'; // Incompatible with Expo SDK 51




import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
// import BottomSheet from 'react-native-bottomsheet-reanimated'; // Incompatible with Expo SDK 51
import { Divider, Snackbar } from 'react-native-paper';
// import ParsedText from 'react-native-parsed-text'; // Incompatible with Expo SDK 51
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { deletePost, fetchUserPosts, sendNotification } from '../../../redux/actions/index';
import { container, text, utils } from '../../styles';
import { timeDifference } from '../../utils';
import CachedImage from '../random/CachedImage';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, increment } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ImageView from 'react-native-image-viewing';




const WINDOW_WIDTH = Dimensions.get("window").width;

function Post(props) {
    const [item, setItem] = useState(props.route.params.item)
    const [user, setUser] = useState(props.route.params.user)
    const [currentUserLike, setCurrentUserLike] = useState(false)
    const [unmutted, setUnmutted] = useState(true)
    const [videoref, setvideoref] = useState(null)
    const [sheetRef, setSheetRef] = useState(useRef(null))
    const [modalShow, setModalShow] = useState({ visible: false, item: null })
    const [isValid, setIsValid] = useState(true);
    const [exists, setExists] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [imageViewVisible, setImageViewVisible] = useState(false);

    const isFocused = useIsFocused();
    useEffect(() => {

        if (props.route.params.notification != undefined) {

            getDoc(doc(getFirestore(), "users", props.route.params.user))
                .then((snapshot) => {
                    if (snapshot.exists) {
                        let user = snapshot.data();
                        user.uid = snapshot.id;

                        setUser(user)
                    }
                })

            // Listen to post changes for real-time updates
            const unsubscribePost = onSnapshot(
                doc(getFirestore(), "posts", props.route.params.user, "userPosts", props.route.params.item),
                (snapshot) => {
                    if (snapshot.exists()) {
                        let post = snapshot.data();
                        post.id = snapshot.id;

                        setItem(post)
                        setLoaded(true)
                        setExists(true)
                    }
                }
            );

            const unsubscribeLike = onSnapshot(
                doc(getFirestore(), "posts", props.route.params.user, "userPosts", props.route.params.item, "likes", getAuth().currentUser.uid),
                (snapshot) => {
                    let currentUserLike = false;
                    if (snapshot.exists()) {
                        currentUserLike = true;
                    }
                    setCurrentUserLike(currentUserLike)
                }
            );

            return () => {
                unsubscribePost();
                unsubscribeLike();
            };

        }
        else {
            // Listen to post changes for real-time updates
            const unsubscribePost = onSnapshot(
                doc(getFirestore(), "posts", props.route.params.user.uid, "userPosts", props.route.params.item.id),
                (snapshot) => {
                    if (snapshot.exists()) {
                        let post = snapshot.data();
                        post.id = snapshot.id;
                        setItem(post)
                    }
                }
            );

            const unsubscribeLike = onSnapshot(
                doc(getFirestore(), "posts", props.route.params.user.uid, "userPosts", props.route.params.item.id, "likes", getAuth().currentUser.uid),
                (snapshot) => {
                    let currentUserLike = false;
                    if (snapshot.exists()) {
                        currentUserLike = true;
                    }
                    setCurrentUserLike(currentUserLike)
                }
            );

            setUser(props.route.params.user)
            setLoaded(true)
            setExists(true)

            return () => {
                unsubscribePost();
                unsubscribeLike();
            };
        }

    }, [props.route.params.notification, props.route.params.item])

    useEffect(() => {
        if (videoref !== null) {
            videoref.setIsMutedAsync(props.route.params.unmutted)
        }
        setUnmutted(props.route.params.unmutted)
    }, [props.route.params.unmutted])

    useEffect(() => {
        if (videoref !== null) {
            if (isFocused) {
                videoref.playAsync()
            } else {
                videoref.stopAsync()

            }
        }

    }, [props.route.params.index, props.route.params.inViewPort])

    const onUsernamePress = (username, matchIndex) => {
        props.navigation.navigate("ProfileOther", { username, uid: undefined })
    }

    const onLikePress = (userId, postId, item) => {
        setCurrentUserLike(true)
        // Add like document
        setDoc(doc(getFirestore(), "posts", userId, "userPosts", postId, "likes", getAuth().currentUser.uid), {})
        // Increment likesCount
        updateDoc(doc(getFirestore(), "posts", userId, "userPosts", postId), {
            likesCount: increment(1)
        }).catch(error => console.error("Error incrementing likes:", error))

        props.sendNotification(user.notificationToken, "New Like", `${props.currentUser.name} liked your post`, { type: 0, postId, user: getAuth().currentUser.uid })
    }

    const onDislikePress = (userId, postId, item) => {
        setCurrentUserLike(false)
        // Remove like document
        deleteDoc(doc(getFirestore(), "posts", userId, "userPosts", postId, "likes", getAuth().currentUser.uid))
        // Decrement likesCount
        updateDoc(doc(getFirestore(), "posts", userId, "userPosts", postId), {
            likesCount: increment(-1)
        }).catch(error => console.error("Error decrementing likes:", error))
    }
    if (!exists && loaded) {
        return (
            <View style={{ height: '100%', justifyContent: 'center', margin: 'auto' }}>
                <FontAwesome5 style={{ alignSelf: 'center', marginBottom: 20 }} name="dizzy" size={40} color="black" />
                <Text style={[text.notAvailable]}>Post does not exist</Text>
            </View>
        )
    }
    if (!loaded) {
        return (<View></View>)

    }
    if (user == undefined) {
        return (<View></View>)
    }
    if (item == null) {
        return (<View />)
    }

    const _handleVideoRef = (component) => {
        setvideoref(component);

        if (component !== null) {
            component.setIsMutedAsync(props.route.params.unmutted)
        }
    }

    if (videoref !== null) {
        videoref.setIsMutedAsync(unmutted)
        if (isFocused && props.route.params.index == props.route.params.inViewPort) {
            videoref.playAsync()
        } else {
            videoref.stopAsync()

        }
    }


    if (sheetRef.current !== null && !props.route.params.feed) {
        if (modalShow.visible) {
            sheetRef.snapTo(0)
        } else {
            sheetRef.snapTo(1)
        }
    }

    return (
        <View style={[container.container, utils.backgroundWhite]}>

            <View>
                <View style={[container.horizontal, { alignItems: 'center', padding: 10 }]}>
                    <TouchableOpacity
                        style={[container.horizontal, { alignItems: 'center' }]}
                        onPress={() => props.navigation.navigate("ProfileOther", { uid: user.uid, username: undefined })}>

                        {user.image == 'default' ?
                            (
                                <FontAwesome5
                                    style={[utils.profileImageSmall]}
                                    name="user-circle" size={35} color="black" />

                            )
                            :
                            (
                                <Image
                                    style={[utils.profileImageSmall]}
                                    source={{
                                        uri: user.image
                                    }}
                                />
                            )
                        }
                        <View style={{ alignSelf: 'center' }}>
                            <Text style={[text.bold, text.medium, { marginBottom: 0 }]} >{user.name}</Text>
                        </View>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[{ marginLeft: 'auto' }]}
                        onPress={() => setModalShow({ visible: true, item })}
                    >
                        <Feather
                            name="more-vertical" size={20} color="black" />
                    </TouchableOpacity>
                </View>
                {item.type == 0 ?
                    <View>
                        {props.route.params.index == props.route.params.inViewPort && isFocused ?
                            <View>
                                <VideoPlayer
                                    videoProps={{
                                        isLooping: true,
                                        shouldPlay: true,
                                        resizeMode: Video.RESIZE_MODE_COVER,
                                        source: {
                                            uri: item.downloadURL,
                                        },
                                        videoRef: _handleVideoRef,
                                    }}
                                    inFullscreen={false}
                                    showControlsOnLoad={true}
                                    showFullscreenButton={false}
                                    height={WINDOW_WIDTH}
                                    width={WINDOW_WIDTH}
                                    shouldPlay={true}
                                    isLooping={true}
                                    style={{
                                        aspectRatio: 1 / 1, height: WINDOW_WIDTH,
                                        width: WINDOW_WIDTH, backgroundColor: 'black'
                                    }}
                                />

                                <TouchableOpacity
                                    style={{ position: 'absolute', borderRadius: 500, backgroundColor: 'black', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', margin: 10, right: 0 }}
                                    activeOpacity={1}
                                    onPress={() => {
                                        if (videoref == null) {
                                            return;
                                        }
                                        if (unmutted) {
                                            if (props.route.params.setUnmuttedMain == undefined) {
                                                setUnmutted(false)
                                            } else {
                                                props.route.params.setUnmuttedMain(false)

                                            }

                                        } else {
                                            if (props.route.params.setUnmuttedMain == undefined) {
                                                setUnmutted(true)
                                            } else {
                                                props.route.params.setUnmuttedMain(true)

                                            }

                                        }

                                    }}>
                                    {!unmutted ?

                                        <Feather name="volume-2" size={20} color="white" />
                                        :
                                        <Feather name="volume-x" size={20} color="white" />
                                    }
                                </TouchableOpacity>

                            </View>

                            :
                            <View style={{ marginTop: 4 }}>

                                <CachedImage
                                    cacheKey={item.id}
                                    style={[container.image]}
                                    source={{ uri: item.downloadURLStill }}
                                />
                            </View>
                        }

                    </View>

                    :

                    <TouchableOpacity activeOpacity={0.9} onPress={() => setImageViewVisible(true)}>
                        <CachedImage
                            cacheKey={item.id}
                            style={container.image}
                            source={{ uri: item.downloadURL }}
                        />
                    </TouchableOpacity>
                }

                <View style={[utils.padding10, container.horizontal]}>
                    {currentUserLike ?
                        (
                            <Entypo name="heart" size={30} color="red" onPress={() => onDislikePress(user.uid, item.id, item)} />
                        )
                        :
                        (
                            <Feather name="heart" size={30} color="black" onPress={() => onLikePress(user.uid, item.id, item)} />

                        )
                    }
                    <Feather style={utils.margin15Left} name="message-square" size={30} color="black" onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: user.uid, user })} />
                    <Feather style={utils.margin15Left} name="share" size={26} color="black" onPress={() => props.navigation.navigate('ChatList', { postId: item.id, post: { ...item, user: user }, share: true })} />


                </View>
                <View style={[container.container, utils.padding10Sides]}>
                    <Text style={[text.bold, text.medium]}>
                        {item.likesCount || 0} likes
                    </Text>
                    <Text style={[utils.margin15Right, utils.margin5Bottom]}>
                        <Text style={[text.bold]}
                            onPress={() => props.navigation.navigate("ProfileOther", { uid: user.uid, username: undefined })}>
                            {user.name}
                        </Text>

                        <Text>    </Text>
                        <Text>{item.caption}</Text>

                    </Text>
                    <Text
                        style={[text.grey, utils.margin5Bottom]} onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: user.uid, user })}>
                        View all {item.commentsCount || 0} Comments
                    </Text>
                    <Text
                        style={[text.grey, text.small, utils.margin5Bottom]}>
                        {timeDifference(new Date(), item.creation.toDate())}
                    </Text>
                </View>
            </View>

            <Modal
                visible={modalShow.visible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalShow({ visible: false, item: null })}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                    activeOpacity={1}
                    onPress={() => setModalShow({ visible: false, item: null })}
                >
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 }}>
                        {modalShow.item != null ?
                            <View>
                                <TouchableOpacity
                                    style={{ padding: 20 }}
                                    onPress={() => {
                                        props.navigation.navigate("ProfileOther", { uid: user.uid, username: undefined });
                                        setModalShow({ visible: false, item: null });
                                    }}
                                >
                                    <Text style={{ fontSize: 16 }}>View Profile</Text>
                                </TouchableOpacity>
                                <Divider />
                                {user.uid == getAuth().currentUser.uid ?
                                    <TouchableOpacity
                                        style={{ padding: 20 }}
                                        onPress={() => {
                                            props.deletePost(modalShow.item).then(() => {
                                                props.fetchUserPosts()
                                                props.navigation.popToTop()
                                            })
                                            setModalShow({ visible: false, item: null });
                                        }}
                                    >
                                        <Text style={{ fontSize: 16, color: 'red' }}>Delete Post</Text>
                                    </TouchableOpacity>
                                    : null}
                                <Divider />
                                <TouchableOpacity
                                    style={{ padding: 20 }}
                                    onPress={() => setModalShow({ visible: false, item: null })}
                                >
                                    <Text style={{ fontSize: 16 }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                            : null}
                    </View>
                </TouchableOpacity>
            </Modal>
            <Snackbar
                visible={isValid.boolSnack}
                duration={2000}
                onDismiss={() => { setIsValid({ boolSnack: false }) }}>
                {isValid.message}
            </Snackbar>

            <ImageView
                images={[{ uri: item.downloadURL }]}
                imageIndex={0}
                visible={imageViewVisible}
                onRequestClose={() => setImageViewVisible(false)}
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    following: store.userState.following,
    feed: store.usersState.feed,
    usersFollowingLoaded: store.usersState.usersFollowingLoaded,
})

const mapDispatchProps = (dispatch) => bindActionCreators({ sendNotification, fetchUserPosts, deletePost }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Post);

