import { useNavigate } from "react-router-dom";
import SettingsDrawer from "../../components/Settings/SettingsDrawer";

export default function Settings() {

    const navigate = useNavigate();

    return <SettingsDrawer onClose={() => navigate("/chat")} />;

}
