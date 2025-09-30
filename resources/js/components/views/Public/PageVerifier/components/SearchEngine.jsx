import { Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-regular-svg-icons';

const { Search } = Input;

export default function SearchEngine({ onSearch, placeholder = "Search documents, announcements, or information..." }) {
    const handleSearch = (value) => {
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <div 
            style={{
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
                const searchInput = e.currentTarget.querySelector('.ant-input-search');
                if (searchInput) {
                    searchInput.style.boxShadow = '0 8px 25px rgba(30, 64, 175, 0.15)';
                    searchInput.style.transform = 'translateY(-1px)';
                }
            }}
            onMouseLeave={(e) => {
                const searchInput = e.currentTarget.querySelector('.ant-input-search');
                if (searchInput) {
                    searchInput.style.boxShadow = 'none';
                    searchInput.style.transform = 'translateY(0)';
                }
            }}
        >
            <Search
                placeholder={placeholder}
                allowClear
                enterButton={<FontAwesomeIcon icon={faSearch} />}
                size="large"
                onSearch={handleSearch}
                style={{ 
                    width: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="elegant-search"
            />
            <style jsx>{`
                .elegant-search .ant-input-search {
                    border-radius: 0.75rem !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                .elegant-search .ant-input-search:hover {
                    border-color: #3b82f6 !important;
                }
                
                .elegant-search .ant-input-search-button {
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
                    border-color: #1e40af !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                .elegant-search .ant-input-search-button:hover {
                    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%) !important;
                    transform: scale(1.05) !important;
                }
            `}</style>
        </div>
    );
}
