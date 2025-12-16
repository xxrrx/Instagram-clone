import React, { useEffect, useRef, useState } from 'react'
import { FlatList, RefreshControl, Text, View } from 'react-native'
// import BottomSheet from 'react-native-bottomsheet-reanimated' // Incompatible with Expo SDK 51
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Divider, Snackbar } from 'react-native-paper'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deletePost, fetchFeedPosts, reload, sendNotification } from '../../../redux/actions/index'
import { container, text, utils } from '../../styles'
import Post from './Post'
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../../../contexts/ThemeContext';


function Feed(props) {
    const { theme, isDarkMode } = useTheme();
    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false)
    const [unmutted, setUnmutted] = useState(null)
    const [inViewPort, setInViewPort] = useState(0)
    const [sheetRef, setSheetRef] = useState(useRef(null))
    const [modalShow, setModalShow] = useState({ visible: false, item: null })
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        if (props.usersFollowingLoaded == props.following.length && props.following.length !== 0) {
            props.feed.sort(function (x, y) {
                return y.creation.toDate() - x.creation.toDate();
            })

            setPosts(props.feed);
            setRefreshing(false)
            for (let i = 0; i < props.feed.length; i++) {
                if (props.feed[i].type == 0) {
                    setUnmutted(i)
                    return;
                }
            }
        }
        props.navigation.setParams({ param: "value" })

    }, [props.usersFollowingLoaded, props.feed])

    const onViewableItemsChanged = useRef(({ viewableItems, changed }) => {
        if (changed && changed.length > 0) {
            setInViewPort(changed[0].index);
        }
    })




    if (posts.length == 0) {
        return (
            <View style={[container.container, container.center, { padding: 30, backgroundColor: theme.background }]}>
                <View style={[utils.card, { alignItems: 'center', padding: 40, backgroundColor: theme.card }]}>
                    <Text style={[text.bold, text.large, { marginBottom: 15, fontSize: 24, color: theme.text }]}>Welcome! 🎉</Text>
                    <Text style={[text.grey, text.center, { fontSize: 16, lineHeight: 24, color: theme.textSecondary }]}>
                        Follow people to see their posts here.
                    </Text>
                    <Text style={[text.center, { marginTop: 15, color: theme.primary, fontSize: 16, fontWeight: '600' }]}>
                        Go to Search tab to find people! 🔍
                    </Text>
                </View>
            </View>
        )
    }

    if (sheetRef.current !== null) {
        if (modalShow.visible) {
            sheetRef.snapTo(0)
        } else {
            sheetRef.snapTo(1)
        }
    }
    return (
        <View style={[container.container, { backgroundColor: theme.background }]}>

            <FlatList
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            props.reload()
                        }}
                    />
                }
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={{
                    waitForInteraction: false,
                    viewAreaCoveragePercentThreshold: 70
                }}
                numColumns={1}
                horizontal={false}
                data={posts}
                keyExtractor={(item, index) => index.toString()}

                renderItem={({ item, index }) => (
                    <View key={index}>
                        <Post route={{ params: { user: item.user, item, index, unmutted, inViewPort, setUnmuttedMain: setUnmutted, setModalShow, feed: true } }} navigation={props.navigation} />
                    </View>
                )}
            />

            {/* BottomSheet incompatible with SDK 51
            <BottomSheet
                bottomSheerColor="#FFFFFF"
                ref={setSheetRef}
                initialPosition={0} //200, 300
                snapPoints={[300, 0]}
                isBackDrop={true}
                isBackDropDismissByPress={true}
                isRoundBorderWithTipHeader={true}
                backDropColor="black"
                isModal
                containerStyle={{ backgroundColor: "white" }}
                tipStyle={{ backgroundColor: "white" }}
                headerStyle={{ backgroundColor: "white", flex: 1 }}
                bodyStyle={{ backgroundColor: "white", flex: 1, borderRadius: 20 }}
                body={

                    <View>

                        {modalShow.item != null ?
                            <View>
                                <TouchableOpacity style={{ padding: 20 }}
                                    onPress={() => {
                                        props.navigation.navigate("ProfileOther", { uid: modalShow.item.user.uid, username: undefined });
                                        setModalShow({ visible: false, item: null });
                                    }}>
                                    <Text >Profile</Text>
                                </TouchableOpacity>
                                <Divider />
                                {modalShow.item.creator == getAuth().currentUser.uid ?
                                    <TouchableOpacity style={{ padding: 20 }}
                                        onPress={() => {
                                            props.deletePost(modalShow.item).then(() => {
                                                setRefreshing(true);
                                                props.reload()
                                            })
                                            setModalShow({ visible: false, item: null });
                                        }}>
                                        <Text >Delete</Text>
                                    </TouchableOpacity>
                                    : null}

                                <Divider />
                                <TouchableOpacity style={{ padding: 20 }} onPress={() => setModalShow({ visible: false, item: null })}>
                                    <Text >Cancel</Text>
                                </TouchableOpacity>
                            </View>
                            : null}

                    </View>
                }
            />
            */}
            <Snackbar
                visible={isValid.boolSnack}
                duration={2000}
                onDismiss={() => { setIsValid({ boolSnack: false }) }}>
                {isValid.message}
            </Snackbar>
        </View>

    )
}


const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    following: store.userState.following,
    feed: store.usersState.feed,
    usersFollowingLoaded: store.usersState.usersFollowingLoaded,


})

const mapDispatchProps = (dispatch) => bindActionCreators({ reload, sendNotification, fetchFeedPosts, deletePost }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Feed);
