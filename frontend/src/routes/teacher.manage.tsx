import { createFileRoute } from "@tanstack/react-router";
import { TeacherManagement } from "@/pages/TeacherManagement";

export const Route = createFileRoute("/teacher/manage")({
  component: TeacherManagement,
});
