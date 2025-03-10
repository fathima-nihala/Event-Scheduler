import { SvgColor } from '../../src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Tasks',
    path: '/tasks',
    icon: icon('ic-blog'),
  },
  {
    title: 'Events',
    path: '/sign-in',
    icon: icon('ic-lock'),
  },
 
];
