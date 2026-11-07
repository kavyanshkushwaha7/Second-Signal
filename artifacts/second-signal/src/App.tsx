import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { AppStoreProvider } from '@/context/AppStore';
import { AppLayout } from '@/layouts/AppLayout';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import { BuyPage, GiveAwayPage, BorrowPage, SellPage, ExchangePage } from '@/pages/TypePages';
import ItemDetail from '@/pages/ItemDetail';
import RequestPage from '@/pages/RequestPage';
import CreateListing from '@/pages/CreateListing';
import WantList from '@/pages/WantList';
import Friends from '@/pages/Friends';
import Profile from '@/pages/Profile';
import Messages from '@/pages/Messages';
import Notifications from '@/pages/Notifications';
import MyRequests from '@/pages/MyRequests';
import Saved from '@/pages/Saved';
import { Communities, CommunityDetail } from '@/pages/Communities';
import Matches from '@/pages/Matches';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Info from '@/pages/Info';

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/explore" component={Explore} />
          <Route path="/buy" component={BuyPage} />
          <Route path="/give-away" component={GiveAwayPage} />
          <Route path="/borrow" component={BorrowPage} />
          <Route path="/sell" component={SellPage} />
          <Route path="/exchange" component={ExchangePage} />
          <Route path="/want-list" component={WantList} />
          <Route path="/friends" component={Friends} />
          <Route path="/messages" component={Messages} />
          <Route path="/messages/:convId" component={Messages} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/my-requests" component={MyRequests} />
          <Route path="/saved" component={Saved} />
          <Route path="/communities" component={Communities} />
          <Route path="/community/:id" component={CommunityDetail} />
          <Route path="/profile" component={Profile} />
          <Route path="/profile/:userId" component={Profile} />
          <Route path="/item/:itemId" component={ItemDetail} />
          <Route path="/request/:itemId" component={RequestPage} />
          <Route path="/create-listing" component={CreateListing} />
          <Route path="/edit-listing/:id" component={CreateListing} />
          <Route path="/matches" component={Matches} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/settings" component={Settings} />
          <Route path="/info/:slug" component={Info} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </AppLayout>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppStoreProvider>
            <Router />
          </AppStoreProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
