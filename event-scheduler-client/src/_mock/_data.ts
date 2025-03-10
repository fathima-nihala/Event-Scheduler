import { useDispatch, useSelector } from 'react-redux';
import {
  _id,
  // _price,
  _times,
  _company,
  _boolean,
  _fullName,
  _taskNames,
  _postTitles,
  _description,
} from './_mock';
import { AppDispatch, RootState } from '../redux/store';
import { useEffect } from 'react';
import { getUserProfile } from '../slices/authSlice';

// ----------------------------------------------------------------------

// export const _myAccount = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const user = useSelector((state: RootState) => state.auth.user);
  
//   useEffect(() => {
//     dispatch(getUserProfile());
//   }, [dispatch])
//   return {
//     displayName: user?.name || 'Guest User',
//     email: user?.email || 'guest@example.com',
//     photoURL: '/assets/images/avatar/default-avatar.webp',
//   };
// };

export const useMyAccount = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  return {
    displayName: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    photoURL: '/assets/images/avatar/default-avatar.webp',
  };
};



// ----------------------------------------------------------------------

export const _users = [...Array(24)].map((_, index) => ({
  id: _id(index),
  name: _fullName(index),
  company: _company(index),
  isVerified: _boolean(index),
  avatarUrl: `/assets/images/avatar/avatar-${index + 1}.webp`,
  status: index % 4 ? 'active' : 'banned',
  role:
    [
      'Leader',
      'Hr Manager',
      'UI Designer',
      'UX Designer',
      'UI/UX Designer',
      'Project Manager',
      'Backend Developer',
      'Full Stack Designer',
      'Front End Developer',
      'Full Stack Developer',
    ][index] || 'UI Designer',
}));

// ----------------------------------------------------------------------

export const _posts = [...Array(23)].map((_, index) => ({
  id: _id(index),
  title: _postTitles(index),
  description: _description(index),
  coverUrl: `/assets/images/cover/cover-${index + 1}.webp`,
  totalViews: 8829,
  totalComments: 7977,
  totalShares: 8556,
  totalFavorites: 8870,
  postedAt: _times(index),
  author: {
    name: _fullName(index),
    avatarUrl: `/assets/images/avatar/avatar-${index + 1}.webp`,
  },
}));

// ----------------------------------------------------------------------


// ----------------------------------------------------------------------

export const _timeline = [...Array(5)].map((_, index) => ({
  id: _id(index),
  title: [
    '1983, orders, $4220',
    '12 Invoices have been paid',
    'Order #37745 from September',
    'New order placed #XF-2356',
    'New order placed #XF-2346',
  ][index],
  type: `order${index + 1}`,
  time: _times(index),
}));

// ----------------------------------------------------------------------

export const _tasks = [...Array(5)].map((_, index) => ({
  id: _id(index),
  name: _taskNames(index),
}));

// ----------------------------------------------------------------------


