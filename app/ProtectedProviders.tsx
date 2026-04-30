

import { ExpandedDatesProvider } from "@/context/ExpandedDatesContext";
import { TasksProvider } from "@/context/TasksContext";
import UsersProvider from "@/context/UsersContext";

export default function ProtectedProviders({ children }: { children: React.ReactNode }) {
  return (
    <UsersProvider>
      <TasksProvider>
        <ExpandedDatesProvider>
          { children }
        </ExpandedDatesProvider>
      </TasksProvider>
    </UsersProvider>
  )
}