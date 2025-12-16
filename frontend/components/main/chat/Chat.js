

import { Feather, FontAwesome5 } from '@expo/vector-icons';




import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import CachedImage from 'react-native-expo-cached-image'; // Removed due to expo-crypto compatibility
import { Provider } from 'react-native-paper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchFeedPosts, fetchUserChats, sendNotification } from '../../../redux/actions/index';
import { container, text, utils, colors } from '../../styles';
import { timeDifference } from '../../utils';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../../../contexts/ThemeContext';



function Chat(props) {
    const { theme, isDarkMode } = useTheme();
    const [user, setUser] = useState(null)
    const [chat, setChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [textInput, setTextInput] = useState(null)
    const [flatList, setFlatList] = useState(null)
    const [initialFetch, setInitialFetch] = useState(false)

    useEffect(() => {
        if (props.route.params.notification) {
            getDoc(doc(getFirestore(), "users", props.route.params.user))
                .then((snapshot) => {
                    if (snapshot.exists) {
                        let user = snapshot.data();
                        user.uid = snapshot.id;

                        setUser(user)
                    }
                })
        }
        else {
            setUser(props.route.params.user)
        }

    }, [props.route.params.notification, props.route.params.user])


    useEffect(() => {
        if (user == null) {
            return;
        }
        if (initialFetch) {
            return;
        }

        const chat = props.chats.find(el => el.users.includes(user.uid));
        setChat(chat)


        props.navigation.setOptions({
            headerTitle: () => (
                <TouchableOpacity
                    style={[container.horizontal, utils.alignItemsCenter, { overflow: 'hidden' }]}
                    onPress={() => props.navigation.navigate("ProfileOther", { uid: user.uid, username: undefined })}
                >
                    {
                        user.image == 'default' ?
                            (
                                <View style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: '#9D4EDD',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 10
                                }}>
                                    <FontAwesome5
                                        name="user-circle" size={20} color="white" />
                                </View>

                            )
                            :
                            (
                                <Image
                                    style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                                    source={{
                                        uri: user.image
                                    }}
                                />
                            )
                    }
                    <Text style={[text.bold, { fontSize: 17, color: theme.text }]} numberOfLines={1} ellipsizeMode='tail'>
                        {user.name || user.username}
                    </Text>
                </TouchableOpacity>
            ),
            headerStyle: {
                backgroundColor: theme.card,
            },
            headerTintColor: theme.text,
        });
        if (chat !== undefined) {
            // Firebase v10: Listen to messages
            const messagesRef = collection(getFirestore(), "chats", chat.id, "messages");
            const messagesQuery = query(messagesRef, orderBy("creation", "asc"));

            const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                let messages = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                setMessages(messages)
            });

            // Firebase v10: Update chat read status
            const chatRef = doc(getFirestore(), 'chats', chat.id);
            updateDoc(chatRef, {
                [getAuth().currentUser.uid]: true,
            }).catch(error => console.error("Error updating chat status:", error));

            setInitialFetch(true)

            // Cleanup listener on unmount
            return () => unsubscribe();

        } else {
            createChat()
        }
    }, [user, props.chats])

    const createChat = () => {
        // Firebase v10: Create new chat
        const chatsRef = collection(getFirestore(), "chats");
        addDoc(chatsRef, {
            users: [getAuth().currentUser.uid, user.uid],
            lastMessage: 'Send the first message',
            lastMessageTimestamp: serverTimestamp()
        }).then(() => {
            props.fetchUserChats()
        }).catch(error => {
            console.error("Error creating chat:", error);
        });
    }
    const onSend = () => {
        const textToSend = input;
        if (chat == undefined) {
            return;
        }

        if (input.length == 0) {
            return;
        }
        setInput("")


        textInput.clear()

        // Firebase v10: Add message to chat
        const messagesRef = collection(getFirestore(), 'chats', chat.id, 'messages');
        addDoc(messagesRef, {
            creator: getAuth().currentUser.uid,
            text: textToSend,
            creation: serverTimestamp()
        }).catch(error => {
            console.error("Error sending message:", error);
        });

        // Firebase v10: Update chat metadata
        const chatRef = doc(getFirestore(), 'chats', chat.id);
        updateDoc(chatRef, {
            lastMessage: textToSend,
            lastMessageTimestamp: serverTimestamp(),
            [chat.users[0]]: false,
            [chat.users[1]]: false

        }).catch(error => {
            console.error("Error updating chat:", error);
        });

        props.sendNotification(user.notificationToken, "New Message", textToSend, { type: "chat", user: getAuth().currentUser.uid })


    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={90}
        >
            <LinearGradient
                colors={isDarkMode ? ['#1A1A1A', '#2D2D2D'] : ['#00F2EA', '#FF0050']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <View style={[container.container, container.alignItemsCenter, { backgroundColor: 'transparent' }]}>
                    <Provider>
                        <FlatList
                            numColumns={1}
                            horizontal={false}
                            data={messages}
                            ref={setFlatList}
                            style={{ width: '100%' }}
                            contentContainerStyle={{ paddingVertical: 10 }}
                            onContentSizeChange={() => { if (flatList != null) flatList.scrollToEnd({ animated: true }) }}

                            renderItem={({ item }) => (
                                <View style={[
                                    utils.padding10,
                                    container.container,
                                    item.creator == getAuth().currentUser.uid ? {
                                        ...container.chatRight,
                                        backgroundColor: '#00D4FF',
                                        marginLeft: 60,
                                        borderRadius: 20,
                                        borderBottomRightRadius: 4,
                                        shadowColor: '#00D4FF',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 4,
                                        elevation: 3
                                    } : {
                                        ...container.chatLeft,
                                        backgroundColor: 'white',
                                        marginRight: 60,
                                        borderRadius: 20,
                                        borderBottomLeftRadius: 4,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        elevation: 2
                                    }
                                ]}>
                                    {item.creator !== undefined && item.creation !== null ?
                                        <View style={container.horizontal}>
                                            <View>
                                                <Text style={[utils.margin5Bottom, {
                                                    color: item.creator == getAuth().currentUser.uid ? 'white' : '#2D2D2D',
                                                    fontSize: 15
                                                }]}>
                                                    {item.text}
                                                </Text>
                                                {item.post != null ?

                                                    <TouchableOpacity style={{ marginBottom: 20, marginTop: 10, borderRadius: 12, overflow: 'hidden' }} onPress={() => { props.navigation.navigate("Post", { item: item.post, user: item.post.user }) }}>
                                                        {item.post.type == 0 ?
                                                            <Image
                                                                style={{ aspectRatio: 1 / 1, width: 200 }}
                                                                source={{ uri: item.post.downloadURLStill }}
                                                            />
                                                            :

                                                            <Image
                                                                style={{ aspectRatio: 1 / 1, width: 200 }}
                                                                source={{ uri: item.post.downloadURL }}
                                                            />
                                                        }
                                                    </TouchableOpacity>
                                                    : null}
                                                <Text
                                                    style={[text.grey, text.small, utils.margin5Bottom, {
                                                        color: item.creator == getAuth().currentUser.uid ? 'rgba(255,255,255,0.8)' : '#9E9E9E',
                                                        fontSize: 11
                                                    }]}>
                                                    {timeDifference(new Date(), item.creation.toDate())}
                                                </Text>
                                            </View>
                                        </View>
                                        : null}
                                </View>
                            )}
                        />

                        <View style={[
                            {
                                paddingHorizontal: 15,
                                paddingVertical: 12,
                                backgroundColor: theme.card,
                                borderTopWidth: 1,
                                borderTopColor: theme.border,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 10
                            }
                        ]}>
                            <View style={[container.horizontal, utils.alignItemsCenter, { gap: 10 }]}>
                                {props.currentUser.image == 'default' ?
                                    (
                                        <FontAwesome5
                                            style={[utils.profileImageSmall, { marginRight: 0 }]}
                                            name="user-circle" size={35} color={colors.vibrantPurple} />
                                    )
                                    :
                                    (
                                        <Image
                                            style={[utils.profileImageSmall, { marginRight: 0 }]}
                                            source={{
                                                uri: props.currentUser.image
                                            }}
                                        />
                                    )
                                }

                                <View style={{
                                    flex: 1,
                                    backgroundColor: colors.offWhite,
                                    borderRadius: 20,
                                    paddingHorizontal: 15,
                                    paddingVertical: 8,
                                    minHeight: 40,
                                    justifyContent: 'center'
                                }}>
                                    <TextInput
                                        ref={input => { setTextInput(input) }}
                                        value={input}
                                        multiline={true}
                                        style={[{
                                            fontSize: 15,
                                            color: colors.dark,
                                            maxHeight: 100
                                        }]}
                                        placeholder='Type a message...'
                                        placeholderTextColor={colors.gray}
                                        onChangeText={(input) => setInput(input)}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={() => onSend()}
                                    style={{
                                        backgroundColor: colors.electricBlue,
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: colors.electricBlue,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.4,
                                        shadowRadius: 8,
                                        elevation: 6
                                    }}
                                >
                                    <Feather name="send" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Provider>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    chats: store.userState.chats,
    following: store.userState.following,
    feed: store.usersState.feed,

})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUserChats, sendNotification, fetchFeedPosts }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Chat);
