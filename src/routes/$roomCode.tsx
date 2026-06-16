import { createFileRoute } from "@tanstack/react-router";
import { Game } from "../pages/Game";

export const Route = createFileRoute("/$roomCode")({
  component: Game,
});
