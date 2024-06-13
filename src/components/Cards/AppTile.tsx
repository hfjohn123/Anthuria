import {useContext} from 'react';
import star_icon from '../../images/icon/icon_star.svg';
import star_yellow_icon from '../../images/icon/icon_star_yellow.svg';
import {Link} from 'react-router-dom';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import {AuthContext} from '../AuthWrapper.tsx';

interface AppTileProps {
  title: string;
  stars: string[];
  link: string;
  icon?: string;
  id: string;
}

export function AppTile({title, stars, link, icon, id}: AppTileProps) {
  const queryClient = useQueryClient();
  const {route} = useContext(AuthContext);

  const deleteStar = useMutation({
    mutationFn: (id: string) => {
      return axios.delete(`${route}/user_stars`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          application_id: id,
        },
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({queryKey: ['user_stars', route]});
      const previousStars = queryClient.getQueryData<string[]>([
        'user_stars',
        route,
      ]);
      if (previousStars) {
        queryClient.setQueryData(
          ['user_stars', route],
          [...previousStars.filter((star) => star !== id)],
        );
      }
      return {previousStars};
    },
    onError: (_error, _id, context) => {
      if (context?.previousStars) {
        queryClient.setQueryData(['user_stars', route], context.previousStars);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['user_stars', route]});
    },
  });

  const addStar = useMutation({
    mutationFn: (id: string) => {
      return axios.put(`${route}/user_stars`, {
        application_id: id,
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({queryKey: ['user_stars', route]});
      const previousStars = queryClient.getQueryData<string[]>([
        'user_stars',
        route,
      ]);
      if (previousStars) {
        queryClient.setQueryData(['user_stars', route], [...previousStars, id]);
      }
      return {previousStars};
    },
    onError: (_error, _id, context) => {
      if (context?.previousStars) {
        queryClient.setQueryData(['user_stars', route], context.previousStars);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['user_stars', route]});
    },
  });
  return (
    <Link reloadDocument
          className = "select-none z-10 relative rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark flex flex-col justify-center items-center"
          to = {link}
    >
      {stars.includes(id) ? (
        <img
          src = {star_yellow_icon}
          className = "size-5 absolute top-2 right-2 z-50"
          alt = "Star"
          onClick = {(event) => {
            deleteStar.mutate(id);
            event.stopPropagation();
            event.preventDefault()
          }}
        />
      ) : (
        <img
          src = {star_icon}
          className = "size-5 absolute top-2 right-2"
          alt = "Star"
          onClick = {(event) => {
            addStar.mutate(id);
            event.stopPropagation();
            event.preventDefault()
          }}
        />
      )}
      {icon ? (
        <div
          className = "flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"
          dangerouslySetInnerHTML = {{__html: icon}}
        />
      ) : (
        <div
          className = "flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 font-bold">
          {title[0].toUpperCase()}
        </div>
      )}

      <div className = "mt-4 flex items-end justify-between">
        <span className = "text-sm font-medium text-center">{title}</span>
      </div>
    </Link>
  );
}
