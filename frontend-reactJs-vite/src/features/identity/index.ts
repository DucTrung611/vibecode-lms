export { identityRoutes } from './pages/identity.routes';
export { useCurrentUser } from './hooks/useCurrentUser';
export { useLogin } from './hooks/useLogin';
export { useLogout } from './hooks/useLogout';
export { useRegister } from './hooks/useRegister';
export { useUpdateProfile } from './hooks/useUpdateProfile';
export type {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from './types/identity.types';
