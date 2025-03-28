import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colorScheme === 'dark' ? '#121212' : '#F5F5F5' }
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
