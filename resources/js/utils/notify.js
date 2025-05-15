import { toast } from 'react-toastify';

const notify = {
    success: (message) => {
        toast.success(message, {
            position: 'top-right',
            autoClose: 3000,
        });
    },
    error: (message) => {
        toast.error(message, {
            position: 'top-right',
            autoClose: 3000,
        });
    },
    info: (message) => {
        toast.info(message, {
            position: 'top-right',
            autoClose: 3000,
        });
    },
    warning: (message) => {
        toast.warn(message, {
            position: 'top-right',
            autoClose: 3000,
        });
    },
};

export default notify;
