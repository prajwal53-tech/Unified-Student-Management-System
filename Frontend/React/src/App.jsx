import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "@/components/ui/toast";

function App() {
    return (
        <>
            <AppRoutes />
            <Toaster />
        </>
    );
}

export default App;