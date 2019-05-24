import { AxiosError } from 'axios';

export const errorHandler = (error: AxiosError): any => {
    if (error.response && error.response.data && error.response.data.error) {
        console.error(`${new Date().toLocaleString()} - Error: ${error.response.data.error}`);
    } else {
        console.error(`${new Date().toLocaleString()} - Error: ${error.response.status} - ${error.response.statusText}`);
    }

    return error;
};
