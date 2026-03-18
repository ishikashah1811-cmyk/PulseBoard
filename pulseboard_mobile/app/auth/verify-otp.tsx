import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  StatusBar, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ShieldCheck, RefreshCw, Zap } from 'lucide-react-native';
import { verifyOtpUser, resendOtpUser } from '../../src/services/auth.service';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// --- Theme Constants ---
const LN_VOLT = '#CCF900';
const BG_IMAGE = require('../../assets/disc.jpg');
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the shield icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow single digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Auto-submit when all digits entered
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Move back on backspace if current field is empty
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Incomplete Code', 'Please enter the full 6-digit code.');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please go back and register again.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtpUser({ email, otp: code });
      Alert.alert('Verified! ⚡', 'Your email has been verified successfully.', [
        { 
          text: 'Continue', 
          onPress: () => {
            const clubEmails = [
              'quantclub@iitj.ac.in', 'devluplabs@iitj.ac.in', 'raid@iitj.ac.in',
              'inside@iitj.ac.in', 'theproductcub@iitj.ac.in', 'theproductclub@iitj.ac.in',
              'psoc@iitj.ac.in', 'tgt@iitj.ac.in', 'shutterbugs@iitj.ac.in',
              'atelier@iitj.ac.in', 'framex@iitj.ac.in', 'designerds@iitj.ac.in',
              'dramebaaz@iitj.ac.in', 'ecell@iitj.ac.in', 'nexus@iitj.ac.in', 'respawn@iitj.ac.in'
            ];

            if (clubEmails.includes(email.toLowerCase().trim())) {
              router.replace('/club_tabs/home');
            } else {
              router.replace('/tabs/home');
            }
          }
        }
      ]);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Verification failed. Please try again.';
      Alert.alert('Verification Failed', errorMsg);
      
      // Clear inputs on error
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    setResending(true);
    try {
      await resendOtpUser(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert('Code Sent! 📧', 'A new verification code has been sent to your email.');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to resend code.';
      Alert.alert('Resend Failed', errorMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <View className="flex-1 bg-[#050505]">
      <StatusBar hidden={true} />

      <ImageBackground 
        source={BG_IMAGE} 
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0.25 }} 
      >
        <LinearGradient
          colors={['transparent', 'rgba(5, 5, 5, 0.85)', '#050505']}
          locations={[0, 0.35, 0.85]}
          className="absolute w-full h-full"
        />

        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ paddingHorizontal: wp('6%') }}
          >
            {/* Back Button */}
            <View style={{ marginTop: hp('2%'), marginBottom: hp('3%') }}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="bg-[#121212]/80 border border-neutral-800 rounded-full justify-center items-center"
                style={{ 
                  width: wp('12%'), 
                  height: wp('12%'), 
                }}
              >
                <ChevronLeft color="white" size={wp('6%')} />
              </TouchableOpacity>
            </View>

            {/* Shield Icon */}
            <View style={{ alignItems: 'center', marginBottom: hp('3%') }}>
              <Animated.View 
                style={{ 
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: 'rgba(204, 249, 0, 0.08)',
                  borderRadius: 999,
                  padding: wp('5%'),
                  borderWidth: 1.5,
                  borderColor: 'rgba(204, 249, 0, 0.25)',
                }}
              >
                <ShieldCheck color={LN_VOLT} size={hp('5%')} />
              </Animated.View>
            </View>

            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: hp('1.5%') }}>
              <View className="flex-row items-center space-x-2 mb-2">
                <View className="rounded-full" style={{ width: wp('2%'), height: wp('2%'), backgroundColor: '#CCF900' }} />
                <Text 
                  className="text-[#CCF900] font-mono uppercase"
                  style={{ fontSize: hp('1.4%'), letterSpacing: 3 }}
                >
                  Verification
                </Text>
              </View>

              <Text 
                className="text-white font-black italic tracking-tighter uppercase text-center"
                style={{ fontSize: hp('4.5%'), lineHeight: hp('5%'), marginBottom: hp('1.5%') }}
              >
                Enter<Text className="text-[#CCF900]">.</Text>{"\n"}Code
              </Text>

              <Text 
                className="text-neutral-400 font-medium text-center"
                style={{ fontSize: hp('1.7%'), lineHeight: hp('2.4%'), maxWidth: wp('80%') }}
              >
                We sent a 6-digit verification code to
              </Text>
              <Text 
                className="text-[#CCF900] font-bold text-center"
                style={{ fontSize: hp('1.6%'), marginTop: hp('0.5%') }}
              >
                {email || 'your email'}
              </Text>
            </View>

            {/* OTP Input Boxes */}
            <View 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'center', 
                gap: wp('2.5%'),
                marginTop: hp('4%'),
                marginBottom: hp('3%'),
              }}
            >
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: wp('13%'),
                    height: hp('7.5%'),
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: focusedIndex === index 
                      ? LN_VOLT 
                      : otp[index] 
                        ? 'rgba(204, 249, 0, 0.4)' 
                        : '#333',
                    backgroundColor: focusedIndex === index 
                      ? 'rgba(204, 249, 0, 0.05)' 
                      : '#121212',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={{
                      fontSize: hp('3.2%'),
                      fontWeight: '900',
                      color: otp[index] ? LN_VOLT : '#fff',
                      textAlign: 'center',
                      width: '100%',
                      height: '100%',
                      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                    }}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={otp[index]}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    selectionColor={LN_VOLT}
                    caretHidden
                  />
                </View>
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              className={`bg-[#CCF900] justify-center items-center ${loading ? 'opacity-70' : ''}`}
              onPress={() => handleVerify()}
              disabled={loading}
              activeOpacity={0.9}
              style={{ 
                height: hp('6.5%'), 
                marginTop: hp('1%'),
                transform: [{ skewX: '-12deg' }], 
                borderRadius: 4 
              }}
            >
              {loading ? (
                <View style={{ transform: [{ skewX: '12deg' }] }}>
                  <ActivityIndicator color="black" />
                </View>
              ) : (
                <View className="flex-row items-center" style={{ transform: [{ skewX: '12deg' }] }}>
                  <Text 
                    className="text-black font-black uppercase mr-2"
                    style={{ fontSize: hp('2%'), letterSpacing: 2 }}
                  >
                    VERIFY CODE
                  </Text>
                  <Zap color="black" size={hp('2.5%')} fill="black" />
                </View>
              )}
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={{ paddingVertical: hp('3%'), alignItems: 'center' }}>
              <View className="flex-row items-center">
                <Text 
                  className="text-neutral-400 font-medium mr-2"
                  style={{ fontSize: hp('1.6%') }}
                >
                  Didn't receive the code?
                </Text>
                <TouchableOpacity 
                  onPress={handleResend}
                  disabled={cooldown > 0 || resending}
                >
                  {resending ? (
                    <ActivityIndicator color={LN_VOLT} size="small" />
                  ) : (
                    <View className="flex-row items-center">
                      <RefreshCw 
                        color={cooldown > 0 ? '#555' : LN_VOLT} 
                        size={hp('1.8%')} 
                        style={{ marginRight: 4 }}
                      />
                      <Text 
                        className="font-black uppercase border-b"
                        style={{ 
                          fontSize: hp('1.6%'), 
                          letterSpacing: 1,
                          color: cooldown > 0 ? '#555' : '#fff',
                          borderBottomColor: cooldown > 0 ? '#555' : LN_VOLT,
                        }}
                      >
                        {cooldown > 0 ? `RESEND (${cooldown}s)` : 'RESEND'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Help text */}
            <View style={{ alignItems: 'center', marginTop: hp('1%') }}>
              <Text 
                className="text-neutral-600 text-center"
                style={{ fontSize: hp('1.3%'), lineHeight: hp('1.9%') }}
              >
                Check your spam folder if you don't see the email.{'\n'}
                The code expires in 10 minutes.
              </Text>
            </View>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
