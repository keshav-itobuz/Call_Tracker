import React, { useState, useRef, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { LoginStyle } from './LoginStyle';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { setUserData } = useUser();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailShakeAnimation = useRef(new Animated.Value(0)).current;
  const passwordShakeAnimation = useRef(new Animated.Value(0)).current;

  // Shake animation function
  const triggerShake = (animation: Animated.Value) => {
    animation.setValue(0);
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Trigger shake when errors change
  useEffect(() => {
    if (errors.email) {
      triggerShake(emailShakeAnimation);
    }
    if (errors.password) {
      triggerShake(passwordShakeAnimation);
    }
  }, [errors.email, errors.password]);

  // Register fields
  React.useEffect(() => {
    register('email', {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    });
    register('password', {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters',
      },
    });
  }, [register]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/users/login`,
        data,
      );
      const userId = response.data.user.id;
      const userName = response.data.user.name;
      const userEmail = response.data.user.email;
      const token = response.data.token;
      const refreshToken = response.data.refreshToken;

      // Store tokens
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      // Set user in context (this will trigger navigation)
      setUserData({
        id: userId,
        email: userEmail,
        name: userName,
      });
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password');
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={LoginStyle.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={LoginStyle.keyboardView}
      >
        <View style={LoginStyle.content}>
          <View style={LoginStyle.header}>
            <Text style={LoginStyle.title}>Call Tracker</Text>
            <Text style={LoginStyle.subtitle}>Sign in to continue</Text>
          </View>

          <View style={LoginStyle.form}>
            <View style={LoginStyle.inputContainer}>
              <Text style={LoginStyle.label}>Email</Text>
              <Animated.View
                style={{
                  transform: [{ translateX: emailShakeAnimation }],
                }}
              >
                <TextInput
                  style={[
                    LoginStyle.input,
                    errors.email && LoginStyle.inputError,
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  onChangeText={text => setValue('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Animated.View>
              <Text style={LoginStyle.errorText}>
                {errors.email?.message || ' '}
              </Text>
            </View>

            <View style={LoginStyle.inputContainer}>
              <Text style={LoginStyle.label}>Password</Text>
              <Animated.View
                style={{
                  transform: [{ translateX: passwordShakeAnimation }],
                }}
              >
                <View style={LoginStyle.passwordInputWrapper}>
                  <TextInput
                    style={[
                      LoginStyle.passwordInput,
                      errors.password && LoginStyle.inputError,
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    onChangeText={text => setValue('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={LoginStyle.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={LoginStyle.eyeIcon}>
                      <Icon
                        name={showPassword ? 'eye' : 'eye-slash'}
                        size={20}
                        color="#999"
                      />
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
              <Text style={LoginStyle.errorText}>
                {errors.password?.message || ' '}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                LoginStyle.loginButton,
                loading && LoginStyle.loginButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text style={LoginStyle.loginButtonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
