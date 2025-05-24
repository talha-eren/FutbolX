import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#F5F7FA';
  
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: backgroundColor }
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
