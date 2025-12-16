import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Snackbar } from 'react-native-paper';
import { container, form, text, utils, colors } from '../styles';

export default function Register(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [isValid, setIsValid] = useState(true);

    const onRegister = () => {
        if (name.lenght == 0 || username.lenght == 0 || email.length == 0 || password.length == 0) {
            setIsValid({ bool: true, boolSnack: true, message: "Please fill out everything" })
            return;
        }
        if (password.length < 6) {
            setIsValid({ bool: true, boolSnack: true, message: "passwords must be at least 6 characters" })
            return;
        }

        const db = getFirestore();
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));

        getDocs(q)
            .then((snapshot) => {
                if (!snapshot.exist) {
                    const auth = getAuth();
                    createUserWithEmailAndPassword(auth, email, password)
                        .then(() => {
                            if (snapshot.exist) {
                                return
                            }
                            const userDoc = doc(db, "users", auth.currentUser.uid);
                            setDoc(userDoc, {
                                name,
                                email,
                                username,
                                image: 'default',
                                followingCount: 0,
                                followersCount: 0,
                            })
                        })
                        .catch(() => {
                            setIsValid({ bool: true, boolSnack: true, message: "Something went wrong" })
                        })
                }
            }).catch(() => {
                setIsValid({ bool: true, boolSnack: true, message: "Something went wrong" })
            })

    }

    return (
        <LinearGradient
            colors={['#9D4EDD', '#FF1493', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[container.center]}
        >
            <View style={container.formCenter}>
                <View style={[utils.card, { padding: 30 }]}>
                    <Text style={[text.bold, { fontSize: 28, color: '#2D2D2D', marginBottom: 10, textAlign: 'center' }]}>Create Account 🎉</Text>
                    <Text style={[text.grey, { fontSize: 15, marginBottom: 30, textAlign: 'center', color: '#757575' }]}>Join us today!</Text>
                    
                    <TextInput
                        style={[form.textInput, { 
                            backgroundColor: '#F5F5F5',
                            borderColor: '#E0E0E0',
                            borderRadius: 12,
                            fontSize: 15,
                            paddingHorizontal: 15,
                            paddingVertical: 12
                        }]}
                        placeholder="Username"
                        placeholderTextColor="#9E9E9E"
                        value={username}
                        keyboardType="twitter"
                        autoCapitalize="none"
                        onChangeText={(username) => setUsername(username.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').replace(/[^a-z0-9]/gi, ''))}
                    />
                    <TextInput
                        style={[form.textInput, { 
                            backgroundColor: '#F5F5F5',
                            borderColor: '#E0E0E0',
                            borderRadius: 12,
                            fontSize: 15,
                            paddingHorizontal: 15,
                            paddingVertical: 12
                        }]}
                        placeholder="Name"
                        placeholderTextColor="#9E9E9E"
                        onChangeText={(name) => setName(name)}
                    />
                    <TextInput
                        style={[form.textInput, { 
                            backgroundColor: '#F5F5F5',
                            borderColor: '#E0E0E0',
                            borderRadius: 12,
                            fontSize: 15,
                            paddingHorizontal: 15,
                            paddingVertical: 12
                        }]}
                        placeholder="Email"
                        placeholderTextColor="#9E9E9E"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={(email) => setEmail(email)}
                    />
                    <TextInput
                        style={[form.textInput, { 
                            backgroundColor: '#F5F5F5',
                            borderColor: '#E0E0E0',
                            borderRadius: 12,
                            fontSize: 15,
                            paddingHorizontal: 15,
                            paddingVertical: 12
                        }]}
                        placeholder="Password"
                        placeholderTextColor="#9E9E9E"
                        secureTextEntry={true}
                        onChangeText={(password) => setPassword(password)}
                    />

                    <TouchableOpacity
                        style={[utils.buttonPurple, { marginTop: 10 }]}
                        onPress={() => onRegister()}>
                        <Text style={[text.bold, text.center, { color: '#FFFFFF', fontSize: 16 }]}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[form.bottomButton, { borderTopWidth: 0, paddingTop: 20 }]} >
                <Text style={{ fontSize: 15, color: '#FFFFFF', textAlign: 'center' }}>
                    Already have an account?{' '}
                    <Text
                        style={{ color: '#FFFFFF', fontWeight: '700', textDecorationLine: 'underline' }}
                        onPress={() => props.navigation.navigate("Login")} >
                        Sign In
                    </Text>
                </Text>
            </View>
            <Snackbar
                visible={isValid.boolSnack}
                duration={2000}
                onDismiss={() => { setIsValid({ boolSnack: false }) }}>
                {isValid.message}
            </Snackbar>
        </LinearGradient>

    )
}
