import { createLazyFileRoute } from "@tanstack/react-router";
import { CharacterCreationPage } from "../pages/CharacterCreationPage";

export const Route = createLazyFileRoute("/character-creation")({
  component: CharacterCreationPage,
});
