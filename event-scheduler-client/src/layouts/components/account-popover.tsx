import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { useRouter, usePathname } from '../../routes/hooks';
import { useMyAccount } from '../../_mock';
import { logoutUser } from '../../slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';


// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const account = useMyAccount();
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleClosePopover();
      router.push(path);
    },
    [handleClosePopover, router]
  );

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser());
      handleClosePopover();
      enqueueSnackbar('Logged out successfully!', {
        variant: 'success', 
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);
      enqueueSnackbar('Logout failed. Please try again.', {
        variant: 'error', 
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
    }
  }, [dispatch, router, handleClosePopover, enqueueSnackbar]);

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            // `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          `conic-gradient(${theme.palette.primary.light}, ${theme.palette.warning.light}, ${theme.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar src={account.photoURL} alt={account.displayName} sx={{ width: 1, height: 1 }}>
          {account.displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {account?.displayName}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {account?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList
          disablePadding
          sx={{
            p: 1,
            gap: 0.5,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
              [`&.${menuItemClasses.selected}`]: {
                color: 'text.primary',
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.label}
              selected={option.href === pathname}
              onClick={() => handleClickItem(option.href)}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth color="error" size="medium" variant="text" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Popover>
    </>
  );
}
