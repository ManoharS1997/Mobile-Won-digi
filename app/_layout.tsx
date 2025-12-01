import { Stack, useRouter } from "expo-router";
import "./global.css";
import { AuthProvider } from "@/context/AuthContext";
import { InteractionManager } from "react-native";
import * as Linking from "expo-linking";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    Linking.addEventListener("url", ({ url }) => {
      const parsed = Linking.parse(url);

      if (
        parsed.hostname === "register" ||
        parsed.path?.startsWith("register")
      ) {
        const segments = parsed.path?.split("/") || [];
        const [_, user, id] = segments;

        if (user && id) {
          InteractionManager.runAfterInteractions(() => {
            router.push(`/auth/register/${user}/${id}`);
          });
        }
      }
    });
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
