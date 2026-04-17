

import { ExpandedDatesProvider } from "@/context/ExpandedDatesContext";
import { TasksProvider } from "@/context/TasksContext";

export default function ProtectedProviders({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <ExpandedDatesProvider>
        { children }
      </ExpandedDatesProvider>
    </TasksProvider>
  )
}