import { ref } from 'vue'
import type { Flight } from '@/interfaces/interfaces'



export const useFlights = () => {
    const error = ref<string | null>(null); 
    const loading = ref<boolean>(false);
    const flights = ref<Flight[]>([]);

    const fetchFlights = async (): Promise<void> => {
        loading.value = true;
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            console.log("ApiBaseUrl:", apiBaseUrl);
            const response = await fetch(`${apiBaseUrl}/flights`);
            if (!response.ok) {
                throw new Error('No data available');
            }
    
            const data: Flight[] = await response.json();
            flights.value = data;
            console.log("Flights fetched", flights.value);
        } catch (err) {
            error.value = (err as Error).message;
        } finally {
            loading.value = false;
        }
    };




    return {
        error,
         loading, 
         flights, 
         fetchFlights,
        };
};
