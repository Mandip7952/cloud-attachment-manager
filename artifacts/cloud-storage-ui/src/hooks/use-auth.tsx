import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetMe, useLogin, useRegister, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      staleTime: Infinity,
    }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        setLocation("/files");
      },
      onError: (err) => {
        toast({
          title: "Login failed",
          description: err.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        setLocation("/files");
      },
      onError: (err) => {
        toast({
          title: "Registration failed",
          description: err.message || "An error occurred during registration",
          variant: "destructive",
        });
      }
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/login");
      },
      onError: () => {
        toast({
          title: "Logout failed",
          description: "An error occurred during logout",
          variant: "destructive",
        });
      }
    }
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
