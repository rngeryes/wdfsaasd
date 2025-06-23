import { useEffect, useState } from 'react';

declare global {
    interface Window {
        Telegram: {
            WebApp: any;
        };
    }
}

export const useTelegram = () => {
    const [tg, setTg] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const webApp = window.Telegram.WebApp;
            webApp.expand();
            setTg(webApp);
        }
    }, []);

    return { tg };
};