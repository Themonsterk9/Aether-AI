import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {

    const [loading, setLoading] = useState(false);

    return (
        <AppContext.Provider
            value={{
                loading,
                setLoading
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);