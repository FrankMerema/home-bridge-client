import { AxiosError } from 'axios';

export const errorHandler = (error: AxiosError) => {
    if (error.response && error.response.data) {
        console.error(`Error: ${error.response.data.error}`);
    } else {
        console.error(`Error: ${error.message}`);
    }
};
