import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { useEffect } from 'react';
import { getUserProfile } from '../slices/authSlice';


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



