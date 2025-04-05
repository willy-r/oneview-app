import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import * as yup from 'yup';
import { api } from '../services/api';

const schema = yup.object({
  email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
  password: yup
  .string()
  .required('Senha obrigatória')
  .min(8, 'Mínimo 8 caracteres')
  .test('is-strong', 'A senha deve conter ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial (!@#~$%^&*()+|_)', (value) => {
    if (!value) return false;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#~$%^&*()+|_]/.test(value);
    return hasUpper && hasLower && hasNumber && hasSpecial;
  }),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Senhas não coincidem')
    .required('Confirme a senha'),
});

export default function RegisterScreen() {
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await api.post('/register', {
        email: data.email,
        password: data.password,
      });
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao cadastrar:', error?.response?.data || error.message);
      if (error.response?.status === 409) {
        Alert.alert('Erro', 'E-mail já cadastrado!');
        return;
      }
      Alert.alert('Erro', 'Erro ao cadastrar');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="flex-1 justify-center px-6 py-12">        
        <Text className="text-3xl font-bold text-blue-600 mb-8 text-center">Criar Conta</Text>

        {/* E-mail */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-1"
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mb-3">{errors.email.message}</Text>
              )}
            </>
          )}
        />

        {/* Senha */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-1"
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mb-3">{errors.password.message}</Text>
              )}
            </>
          )}
        />

        {/* Confirmar Senha */}
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-1"
                placeholder="Confirmar senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mb-3">{errors.confirmPassword.message}</Text>
              )}
            </>
          )}
        />

        <TouchableOpacity
          className="w-full bg-blue-600 py-3 rounded-xl mt-2"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-white text-center font-semibold">Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4" onPress={() => navigation.navigate('Login')}>
          <Text className="text-center text-blue-500">Já tem uma conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
