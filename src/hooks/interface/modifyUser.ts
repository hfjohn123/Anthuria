import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const useUpdateUser = (route: string, queryClient: any) => {
  const { mutate, ...rest } = useMutation({
    mutationFn: (user: any) => {
      return axios.put(`${route}/user`, user);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', route],
      });
    },
  });

  return { mutate, ...rest };
};

export default useUpdateUser;
