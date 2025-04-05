import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { api } from '../services/api';

const schema = yup.object({
  to_code: yup
    .string()
    .matches(/^[a-fA-F0-9]{8}$/, 'Código inválido (8 caracteres hexadecimais)')
    .required('Código obrigatório'),
  content: yup.string().min(1, 'Mensagem obrigatória'),
});

export default function SendMessageScreen() {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await api.post('/messages', {
        to_code: data.to_code,
        content: data.content,
      });
      Alert.alert('Sucesso', 'Mensagem enviada!');
      navigation.navigate('Dashboard');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      if (err.response?.status === 404) {
        Alert.alert('Erro', 'Falha ao enviar a mensagem, o usuário pode ter rotacionado o código público dele.');
        return;
      }
      Alert.alert('Erro', 'Falha ao enviar a mensagem.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 justify-center">
          <Text className="text-2xl font-bold text-blue-600 mb-6">Enviar Mensagem</Text>

          <Text className="text-sm mb-1 text-gray-700">Código público do destinatário:</Text>
          <Controller
            control={control}
            name="to_code"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 mb-1"
                  placeholder="Ex: f5ff86b2"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                />
                {errors.to_code && (
                  <Text className="text-red-500 text-sm mb-3">{errors.to_code.message}</Text>
                )}
              </>
            )}
          />

          <Text className="text-sm mb-1 text-gray-700">Mensagem:</Text>
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  multiline
                  className="border border-gray-300 rounded-xl px-4 py-3 h-32 mb-1 text-gray-700"
                  placeholder="Digite sua mensagem..."
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
            className="bg-blue-600 py-3 rounded-xl mb-4"
            onPress={handleSubmit(onSubmit)}
          >
            <Text className="text-white text-center font-semibold">Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-center text-gray-500">Voltar sem enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
