import { useApp as useAppContext } from "../context/AppContext";

export default function useApp() {
    return useAppContext();
}