import {ref} from 'vue';
import type { User } from '@/interfaces/interfaces';
const API_URL = import.meta.env.VITE_API_URL;
import { state } from '../globalStates/state';

export const useUsers = () => {
    const token = ref<string | null>(null);
   /*  const isLoggedIn = ref<boolean>(false); */
    const error = ref<string | null>(null);
    const user = ref< User | null>(null);

    const name = ref<string>('');
    const email = ref<string>('');
    const phone = ref<string>('');
    const password = ref<string>('');
    const dateOfBirth = ref<Date>(new Date());
    const isAdmin = ref<boolean>(false);

    const fetchToken = async( email: string, password: string): Promise<void> => {
        try{
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            console.log("ApiBaseUrl:", apiBaseUrl);
            const response = await fetch(`${apiBaseUrl}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('lsToken') || ''
            },
            body: JSON.stringify({email, password})
            })

            if (!response.ok) {
                const errorResponse = await response.json()
                console.log(errorResponse.error || 'Error')
                throw new Error('An error occurred');
            }

            const authResponse = await response.json();
            token.value = authResponse.data.token;
            user.value = authResponse.data.user;
            state.isLoggedIn = true;

            localStorage.setItem('lsToken', authResponse.data.token);
            localStorage.setItem('userIDToken', authResponse.data.userId);
            console.log('user is logged in', authResponse);
            console.log('token', token.value);
        }

        catch (err) {
            error.value = (err as Error).message || 'An error occurred';
            state.isLoggedIn = false;
        }

    }






    // register user

    const registerUser = async( 
        name: string, 
        email: string,
        phone: string,
        password: string,
        dateOfBirth: Date,
        isAdmin: boolean ): Promise<void> => {
        try{
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            console.log("ApiBaseUrl:", apiBaseUrl);
            const response = await fetch(`${apiBaseUrl}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name, email, phone, password, dateOfBirth, isAdmin})
            })

            if (!response.ok) {
                throw new Error('An error occurred');
            }

            const authResponse = await response.json();
            token.value = authResponse.data.token;
            user.value = authResponse.data.user;

            localStorage.setItem('lsToken', authResponse.data.token);
            console.log('user is registered in', authResponse);

        }

        catch (err) {
            error.value = (err as Error).message || 'An error occurred';

        }

    }



    const logout = () => {
        token.value = null;
        user.value = null;
        state.isLoggedIn = false;
        localStorage.removeItem('lsToken'); 
        console.log('user is logged out');
    }
       

    return {
        token,
        isLoggedIn: state.isLoggedIn,
        error,
        user,
        name,
        email,
        phone,
        password,
        dateOfBirth,
        isAdmin,
        fetchToken,
        registerUser,
        logout
    }

}