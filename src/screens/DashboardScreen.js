import { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { faker } from '@faker-js/faker';
import { formatDistanceToNow } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ptBR } from 'date-fns/locale';

import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

export default function DashboardScreen() {
  const { logout } = useContext(AuthContext);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [code, setCode] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCodeAndMessages = async () => {
    try {
      const res = await api.get('/code/my');
      setCode(res.data.public_code);

      const msgRes = await api.get('/messages/my');
      const messagesWithNames = msgRes.data.map((message) => ({
        ...message,
        name: faker.person.fullName(),
      }));
      setMessages(messagesWithNames);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const rotateCode = async () => {
    try {
      setRotating(true);
      const res = await api.put('/code/rotate');
      setCode(res.data.new_public_code);
    } catch (err) {
      console.error('Erro ao rotacionar código:', err);
    } finally {
      setRotating(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCodeAndMessages();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchCodeAndMessages();
  }, [isFocused]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-6 px-6">
      <View className="items-end mb-4">
        <TouchableOpacity
          onPress={logout}
          className="bg-red-500 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">Sair</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-2">Seu código público:</Text>

        <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-6">
          <Text className="text-lg font-mono flex-1">{code}</Text>

          <TouchableOpacity onPress={handleCopy} className="ml-4">
            <MaterialIcons name={copied ? 'check' : 'content-copy'} size={24} color={copied ? 'green' : 'black'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={rotateCode}
            disabled={rotating}
            className="bg-blue-600 px-4 py-2 rounded-xl ml-4"
          >
            <Text className="text-white font-semibold">
              {rotating ? '...' : 'Rotacionar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-lg font-semibold mb-2">Mensagens recebidas:</Text>

      <FlatList
        className="flex-1"
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('MessageView', { id: item.id })}>
            <View className="border-b border-gray-200 py-3">
              <Text className="text-gray-700 font-medium">{item.name}</Text>
              <Text className="text-gray-400 italic">
                {item.read_at ? 'Mensagem lida' : 'Nova mensagem!'}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
