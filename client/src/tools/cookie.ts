export const getCookie = (name: string, source?: string): string | null => {
    const _name = name + '=';
    const decodedCookie = decodeURIComponent(source ?? document.cookie);
    const cookiesCollection = decodedCookie.split(';');
    for (let i = 0; i < cookiesCollection.length; i++) {
        let c = cookiesCollection[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(_name) === 0) {
            return c.substring(_name.length, c.length);
        }
    }
    return null;
};

export const setCookie = (name: string, value: string, expiresInDays: number) => {
    const now = new Date();
    now.setTime(now.getTime() + (expiresInDays * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + now.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
};
