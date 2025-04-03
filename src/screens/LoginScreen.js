import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useContext } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthContext } from '../context/AuthContext';

const schema = yup.object({
  email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
  password: yup.string().required('Senha obrigatória'),
});

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { login } = useContext(AuthContext);

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (!success) {
      alert('E-mail ou senha inválidos!');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-blue-600 mb-10">OneView</Text>

      {/* Email */}
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

      <TouchableOpacity
        className="w-full bg-blue-600 py-3 rounded-xl mb-4"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-white text-center font-semibold">Entrar</Text>
      </TouchableOpacity>

      <Text className="text-sm text-gray-500">Esqueceu sua senha?</Text>
    </View>
  );
}
