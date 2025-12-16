import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';



import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUsersData, sendNotification } from '../../../redux/actions/index';
import { container, text, utils } from '../../styles';
import { timeDifference } from '../../utils';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../../../contexts/ThemeContext';




function Comment(props) {
    const { theme, isDarkMode } = useTheme();
    const [comments, setComments] = useState([])
    const [postId, setPostId] = useState("")
    const [input, setInput] = useState("")
    const [refresh, setRefresh] = useState(false)
    const [textInput, setTextInput] = useState(null)
    const postUser = props.route.params.user;

    // Set custom header with post owner info
    useEffect(() => {
        if (postUser) {
            props.navigation.setOptions({
                headerTitle: () => (
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => props.navigation.navigate("ProfileOther", { uid: postUser.uid, username: undefined })}
                    >
                        {postUser.image == 'default' ? (
                            <View style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: '#9D4EDD',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 10
                            }}>
                                <FontAwesome5 name="user-circle" size={20} color="white" />
                            </View>
                        ) : (
                            <Image
                                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                                source={{ uri: postUser.image }}
                            />
                        )}
                        <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>
                            {postUser.name}'s Post
                        </Text>
                    </TouchableOpacity>
                ),
                headerStyle: {
                    backgroundColor: theme.card,
                },
                headerTintColor: theme.text,
            });
        }
    }, [postUser, theme]);

    useEffect(() => {
        getComments();
    }, [props.route.params.postId, props.users, refresh])

    const matchUserToComment = (comments) => {
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].hasOwnProperty('user')) {
                continue;
            }

            const user = props.users.find(x => x.uid === comments[i].creator)
            if (user == undefined) {
                props.fetchUsersData(comments[i].creator, false)
            } else {
                comments[i].user = user
            }
        }
        setComments(comments)
        setRefresh(false)
    }
    const getComments = () => {
        if (props.route.params.postId !== postId || refresh) {
            getDocs(query(collection(getFirestore(), 'posts', props.route.params.uid, 'userPosts', props.route.params.postId, 'comments'), orderBy('creation', 'desc')))
                .then((snapshot) => {
                    let comments = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    matchUserToComment(comments)
                })
            setPostId(props.route.params.postId)
        } else {
            matchUserToComment(comments)
        }
    }
    const onCommentSend = () => {
        const textToSend = input;

        if (input.length == 0) {
            return;
        }
        setInput("")

        textInput.clear()
        addDoc(collection(getFirestore(), 'posts', props.route.params.uid, 'userPosts', props.route.params.postId, 'comments'), {
            creator: getAuth().currentUser.uid,
            text: textToSend,
            creation: serverTimestamp()
        }).then(() => {
            setRefresh(true)
            // Cloud Functions will auto-increment commentsCount
        })

        getDoc(doc(getFirestore(), "users", props.route.params.uid))
            .then((snapshot) => {
                props.sendNotification(snapshot.data().notificationToken, "New Comment", `${props.currentUser.name} Commented on your post`, { type: 0, user: getAuth().currentUser.uid })
            })


    }

    return (
        <LinearGradient
            colors={isDarkMode ? ['#1A1A1A', '#000000'] : ['#FAFAFA', '#FFFFFF']}
            style={{ flex: 1 }}
        >
            <View style={[container.container, container.alignItemsCenter, { backgroundColor: 'transparent' }]}>
                <FlatList
                    numColumns={1}
                    horizontal={false}
                    data={comments}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    renderItem={({ item }) => (
                        <View style={[utils.cardSmall, { marginHorizontal: 12, backgroundColor: theme.card }]}>
                            {item.user !== undefined ?
                                <View style={container.horizontal}>
                                    <TouchableOpacity onPress={() => props.navigation.navigate("Profile", { uid: item.user.uid, username: undefined })}>
                                        {item.user.image == 'default' ?
                                            (
                                                <FontAwesome5
                                                    style={[utils.profileImageSmall]}
                                                    name="user-circle" size={35} color="#9D4EDD" />


                                            )
                                            :
                                            (
                                                <Image
                                                    style={[utils.profileImageSmall]}
                                                    source={{
                                                        uri: item.user.image
                                                    }} />

                                            )
                                        }
                                    </TouchableOpacity>
                                    <View style={{ marginRight: 30, flex: 1 }}>
                                        <Text style={[utils.margin15Right, utils.margin5Bottom, { flexWrap: 'wrap', lineHeight: 20 }]}>

                                            <Text style={[text.bold, { fontSize: 15, color: theme.text }]}
                                                onPress={() => props.navigation.navigate("Profile", { uid: item.user.uid, username: undefined })}>
                                                {item.user.name}
                                            </Text>
                                            <Text style={{ fontSize: 15, color: theme.text }}>{" "}  {item.text}</Text>
                                        </Text>
                                        <Text
                                            style={[text.grey, text.small, utils.margin5Bottom, { fontSize: 12, color: theme.textSecondary }]}>
                                            {timeDifference(new Date(), item.creation.toDate())}
                                        </Text>
                                    </View>


                                </View>
                                : null}


                        </View>
                    )}
                />
                <View style={[utils.borderTopGray, {
                    backgroundColor: theme.card,
                    paddingHorizontal: 15,
                    paddingVertical: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: theme.shadowOpacity,
                    shadowRadius: 8,
                    elevation: 10,
                    borderTopColor: theme.border
                }]}>
                    <View style={[container.horizontal, utils.alignItemsCenter, { gap: 10 }]}>
                        {
                            props.currentUser.image == 'default' ?
                                (
                                    <FontAwesome5
                                        style={[utils.profileImageSmall, { marginRight: 0 }]}
                                        name="user-circle" size={35} color="#9D4EDD" />

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
                            backgroundColor: theme.inputBackground,
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
                                style={{
                                    fontSize: 15,
                                    color: theme.inputText,
                                    maxHeight: 100
                                }}
                                placeholder='Add a comment...'
                                placeholderTextColor={theme.inputPlaceholder}
                                onChangeText={(input) => setInput(input)}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => onCommentSend()}
                            style={{
                                backgroundColor: theme.secondary,
                                paddingHorizontal: 20,
                                paddingVertical: 12,
                                borderRadius: 20,
                                shadowColor: theme.secondary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.4,
                                shadowRadius: 8,
                                elevation: 6,
                                minWidth: 70,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    )
}


const mapStateToProps = (store) => ({
    users: store.usersState.users,
    currentUser: store.userState.currentUser
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData, sendNotification }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);
