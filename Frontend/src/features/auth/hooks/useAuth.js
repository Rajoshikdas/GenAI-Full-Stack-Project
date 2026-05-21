import { useContext } from 'react';
import { AuthContext } from '../auth.context';
import { login, register, logout } from '../services/auth.api';

export function useAuth() {

   const context = useContext(AuthContext)
   if (!context) {
     throw new Error("useAuth must be used within an AuthProvider");
   }
   const { user, setUser, loading, setLoading } = context


   const handleLogin = async ({email, password}) => {
        setLoading(true)
        try {
            const data = await login({email, password})
            setUser(data.user)
            setLoading(false)
            return data
        } catch(error) {
            setLoading(false)
            throw error
        }
   }

   const handleRegister = async ({username, email, password}) => {
        setLoading(true)
        try {
            const data = await register({username, email, password})
            setUser(data.user)
            setLoading(false)
            return data
        } catch(error) {
            setLoading(false)
            throw error
        }
   }

   const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch(error) {
            // handle error
        } finally {
            setLoading(false)
        }
   }

   return { user, loading, handleLogin, handleRegister, handleLogout }
}