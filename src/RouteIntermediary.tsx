import { Route, Routes } from "react-router-dom";
import App from "./App";
import View from "./View";

export default function Intermediary() {
    return (
        <Routes>
            <Route path='/:id' element={<View/>} />
            <Route path='/' element={<App/>} />
        </Routes>
    )
}