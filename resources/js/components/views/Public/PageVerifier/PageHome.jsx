import { useState } from 'react';
import { Layout } from 'antd';

// Import modular components
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Academics from './components/Academics';
import Calendar from './components/Calendar';
import Announcements from './components/Announcements';
import Contact from './components/Contact';
import Footer from './components/Footer';

const { Content } = Layout;

export default function PageHome() {
    const [activeMenu, setActiveMenu] = useState('home');

    const handleSearch = (value) => {
        console.log('Search:', value);
        // Implement search functionality
    };

    const handleMenuChange = (menuKey) => {
        setActiveMenu(menuKey);
    };

    const renderContent = () => {
        switch (activeMenu) {
            case 'home':
                return <Home />;
            case 'about':
                return <About />;
            case 'academics':
                return <Academics />;
            case 'calendar':
                return <Calendar />;
            case 'announcements':
                return <Announcements />;
            case 'contact':
                return <Contact />;
            default:
                return <Home />;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Header 
                activeMenu={activeMenu}
                onMenuChange={handleMenuChange}
                onSearch={handleSearch}
            />
            
            <Content style={{ 
                padding: '24px', 
                maxWidth: '1200px', 
                margin: '0 auto', 
                width: '100%',
                flex: 1
            }}>
                {renderContent()}
            </Content>
            
            <Footer />
        </Layout>
    );
}