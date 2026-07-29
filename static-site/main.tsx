import { createRoot } from "react-dom/client";
import FightGame from "../app/FightGame";
import "../app/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento raiz do Fight Turn não encontrado.");
}

createRoot(rootElement).render(<FightGame />);
