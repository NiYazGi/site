import { AppProvider, useApp } from '@/store/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/screens/Dashboard';
import { AddAction } from '@/screens/AddAction';
import { Analysis } from '@/screens/Analysis';
import { History } from '@/screens/History';
import { Impact } from '@/screens/Impact';

function MainContent() {
  const { screen } = useApp();

  return (
    <div className="grid-pattern min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-5xl mx-auto w-full">
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'add-action' && <AddAction />}
        {screen === 'analysis' && <Analysis />}
        {screen === 'history' && <History />}
        {screen === 'impact' && <Impact />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
