import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AudioPlayer from '../features/AudioPlayer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-secondary-50">
        <Outlet />
      </main>
      <Footer />
      <AudioPlayer />
    </div>
  );
}
