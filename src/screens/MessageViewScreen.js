import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { api } from '../services/api';

const schema = yup.object({
  content: yup.string().min(1, 'Mensagem obrigatória'),
});

export default function MessageViewScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const messageId = params?.id;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessage = async () => {
    try {
      const res = await api.get(`/messages/${messageId}`);
      setMessage(res.data);
    } catch (err) {
      console.error('Erro ao buscar mensagem:', err);
      Alert.alert('Erro', 'Mensagem não encontrada ou expirada.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (data) => {
    try {
      setSending(true);
      await api.post('/messages', {
        to_code: message.sender_code,
        content: data.content,
      });
      Alert.alert('Sucesso', 'Resposta enviada com sucesso!');
    } catch (err) {
      console.error('Erro ao enviar resposta:', err);
      Alert.alert('Erro', 'Falha ao enviar a resposta.');
    } finally {
      setSending(false);
      navigation.goBack();
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.sender_code);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  if (loading || !message) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <View className="flex-1 bg-white p-6">
        <Text className="text-lg font-bold mb-2">Mensagem recebida:</Text>
        <Text className="text-base text-gray-800 mb-6">{message.message}</Text>

        <Text className="text-sm font-semibold text-gray-700 mb-1">Código público do remetente:</Text>
        <View className="flex-row items-center justify-between bg-gray-100 p-3 rounded-xl mb-6">
          <Text className="text-base font-mono flex-1">{message.sender_code}</Text>
          <TouchableOpacity onPress={handleCopy} className="ml-3">
            <MaterialIcons
              name={copyStatus ? 'check' : 'content-copy'}
              size={22}
              color={copyStatus ? 'green' : 'black'}
            />
          </TouchableOpacity>
        </View>

        <Text className="text-sm text-yellow-600 italic mb-4">
          ⚠️ O remetente pode ter rotacionado o código e não receber esta resposta.
        </Text>

        <Text className="text-sm font-semibold mb-1">Escreva uma resposta:</Text>
        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                multiline
                className="border border-gray-300 rounded-xl px-4 py-3 h-32 mb-1 text-gray-700"
                placeholder="Digite sua resposta..."
                value={value}
                onChangeText={onChange}
              />
              {errors.content && (
                <Text className="text-red-500 text-sm mb-3">{errors.content.message}</Text>
              )}
            </>
          )}
        />

        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-xl"
          onPress={handleSubmit(sendReply)}
          disabled={sending}
        >
          <Text className="text-white text-center font-semibold">
            {sending ? 'Enviando...' : 'Enviar resposta'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-4"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-center text-gray-500">Voltar sem responder</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
