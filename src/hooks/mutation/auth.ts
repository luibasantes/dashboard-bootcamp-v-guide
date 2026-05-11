import DataRepo from '#/api/datasource';
import { useAppStore } from '#/store';
import type {
  EmailAndPasswordLoginType,
  EmailAndPasswordRegisterFormType,
  UserType,
} from '#/types/auth';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const setEmail = useAppStore((s) => s.setEmail);
  return useMutation({
    mutationFn: async (params: EmailAndPasswordRegisterFormType) => {
      return await DataRepo.registerWithEmailAndPassword(params);
    },
    onSuccess: (data) => {
      setEmail(data.email);
      navigate({
        to: '/candidates',
      });
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: error.message || 'Error al crear usuario',
      });
    },
  });
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setEmail = useAppStore((s) => s.setEmail);
  return useMutation({
    mutationFn: async (params: EmailAndPasswordLoginType) => {
      return await DataRepo.loginWithEmailAndPassword(params);
    },
    onSuccess: (data) => {
      setEmail(data.email);
      navigate({
        to: '/candidates',
      });
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: error.message || 'Error al iniciar sesión',
      });
    },
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const setEmail = useAppStore((s) => s.setEmail);
  return useMutation({
    mutationFn: async () => {
      return await DataRepo.logout();
    },
    onSuccess: () => {
      setEmail(undefined);
      navigate({
        to: '/',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Error al cerrar sesión',
      });
    },
  });
};

export const useGetUser = () => {
  const [user, setUser] = React.useState<UserType | null>(null);
  const email = useAppStore((s) => s.email);

  React.useEffect(() => {
    let cancelled = false;
    DataRepo.getCurrentUser().then((current) => {
      if (!cancelled) setUser(current);
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  return user;
};
