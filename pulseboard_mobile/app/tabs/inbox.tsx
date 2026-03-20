import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    ImageBackground,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, RefreshCw, AlertCircle } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import api from '../../src/api/client';
import { router } from 'expo-router';

const BG_IMAGE = require('../../assets/roll.jpg');

interface EmailData {
    id: string;
    snippet: string;
    subject: string;
    from: string;
    date: string;
}

export default function InboxScreen() {
    const [emails, setEmails] = useState<EmailData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmails = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        setError(null);
        try {
            const response = await api.get('/users/emails');
            if (response.data && response.data.emails) {
                setEmails(response.data.emails);
            } else {
                setEmails([]);
            }
        } catch (err: any) {
            console.error('Error fetching emails:', err);
            // Check if it's because no google access token
            const errorMessage = err.response?.data?.message || 'Failed to fetch emails.';
            setError(errorMessage);
            if (err.response?.status === 400 && errorMessage.includes('token')) {
                Alert.alert(
                    'Authentication Required',
                    'Please sign in with Google again to view your emails.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Login', onPress: () => router.push('/auth/login') }
                    ]
                );
            }
        } finally {
            setLoading(false);
            if (isRefreshing) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchEmails(true);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        ) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const renderEmailItem = ({ item }: { item: EmailData }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            style={{
                backgroundColor: '#1a1a1a',
                padding: wp('4%'),
                marginBottom: hp('1.5%'),
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#333',
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp('0.5%') }}>
                <Text style={{ color: '#CCF900', fontWeight: 'bold', fontSize: hp('1.8%'), flex: 1 }} numberOfLines={1}>
                    {item.from}
                </Text>
                <Text style={{ color: '#888', fontSize: hp('1.4%') }}>{formatDate(item.date)}</Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: hp('1.6%'), marginBottom: hp('0.5%') }} numberOfLines={1}>
                {item.subject}
            </Text>
            <Text style={{ color: '#aaa', fontSize: hp('1.4%') }} numberOfLines={2}>
                {item.snippet}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#050505' }}>
            <StatusBar hidden={true} />
            <ImageBackground
                source={BG_IMAGE}
                style={{ flex: 1 }}
                resizeMode="cover"
                imageStyle={{ opacity: 0.2 }}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(5, 5, 5, 0.8)', '#050505']}
                    locations={[0, 0.4, 0.8]}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                />

                <SafeAreaView style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={{ paddingHorizontal: wp('5%'), paddingTop: hp('2%'), paddingBottom: hp('2%'), borderBottomWidth: 1, borderBottomColor: '#222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ color: '#CCF900', fontFamily: 'monospace', fontSize: hp('1.4%'), letterSpacing: 2, marginBottom: hp('0.5%') }}>
                                GMAIL INTEGRATION
                            </Text>
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: hp('3%'), letterSpacing: 1 }}>
                                My Inbox
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => fetchEmails(false)} disabled={loading}>
                            <RefreshCw color={loading ? '#555' : '#CCF900'} size={wp('6%')} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1, paddingHorizontal: wp('5%'), paddingTop: hp('2%') }}>
                        {loading && !refreshing ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#CCF900" />
                                <Text style={{ color: '#888', marginTop: hp('2%'), fontFamily: 'monospace' }}>Syncing emails...</Text>
                            </View>
                        ) : error ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp('10%') }}>
                                <AlertCircle color="#ff4444" size={hp('6%')} style={{ marginBottom: hp('2%') }} />
                                <Text style={{ color: 'white', textAlign: 'center', fontSize: hp('1.8%'), marginBottom: hp('2%') }}>
                                    {error}
                                </Text>
                                {error.includes('token') && (
                                    <TouchableOpacity
                                        style={{ backgroundColor: '#CCF900', paddingVertical: hp('1.5%'), paddingHorizontal: wp('6%'), borderRadius: 4 }}
                                        onPress={() => router.push('/auth/login')}
                                    >
                                        <Text style={{ color: 'black', fontWeight: 'bold' }}>SIGN IN AGAIN</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : emails.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Mail color="#444" size={hp('8%')} style={{ marginBottom: hp('2%') }} />
                                <Text style={{ color: '#888', fontSize: hp('1.8%') }}>Your inbox is empty.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={emails}
                                keyExtractor={(item) => item.id}
                                renderItem={renderEmailItem}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: hp('4%') }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        tintColor="#CCF900"
                                        colors={['#CCF900']}
                                    />
                                }
                            />
                        )}
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
