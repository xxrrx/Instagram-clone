import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { container, form, text, utils, colors } from '../styles';

export default function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSignUp = () => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
    }

    return (
        <LinearGradient
            colors={['#00D4FF', '#9D4EDD', '#FF1493']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[container.center]}
        >
            <View style={container.formCenter}>
                <View style={[utils.card, { padding: 30 }]}>
                    <Text style={[text.bold, { fontSize: 28, color: '#2D2D2D', marginBottom: 10, textAlign: 'center' }]}>Welcome Back! 👋</Text>
                    <Text style={[text.grey, { fontSize: 15, marginBottom: 30, textAlign: 'center', color: '#757575' }]}>Sign in to continue</Text>
                    
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
                        style={[utils.buttonBlue, { marginTop: 10 }]}
                        onPress={() => onSignUp()}>
                        <Text style={[text.bold, text.center, { color: '#FFFFFF', fontSize: 16 }]}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>


            <View style={[form.bottomButton, { borderTopWidth: 0, paddingTop: 20 }]} >
                <Text style={{ fontSize: 15, color: '#FFFFFF', textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <Text
                        style={{ color: '#FFFFFF', fontWeight: '700', textDecorationLine: 'underline' }}
                        onPress={() => props.navigation.navigate("Register")} >
                        Sign Up
                    </Text>
                </Text>
            </View>
        </LinearGradient>
    )
}

