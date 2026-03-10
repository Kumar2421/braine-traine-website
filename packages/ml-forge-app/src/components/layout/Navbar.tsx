import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../data/mockData';
import './Navbar.css';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [location]);

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo */}
                <NavLink to="/" className="navbar-logo">
                    <img src="/ml-forge-icon.png" alt="ML Forge" className="logo-image" />
                    <span className="logo-text">ML Forge</span>
                </NavLink>

                {/* Desktop Links */}
                <div className="nav-menu">
                    {NAV_LINKS.map((link) => (
                        <div
                            key={link.label}
                            className="nav-item-wrapper"
                            onMouseEnter={() => setActiveDropdown(link.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                {link.label}
                            </NavLink>

                            {link.dropdown && activeDropdown === link.label && (
                                <div className="mega-menu">
                                    <div className="mega-menu-content">
                                        <div className="mega-menu-left">
                                            <h4 className="mega-title">{link.label}</h4>
                                            <p className="mega-desc">Our platform and solutions integrate into core business processes so teams can build, operate and govern AI at scale.</p>
                                        </div>
                                        <div className="mega-menu-grid">
                                            <div className="mega-column">
                                                <span className="mega-col-title">AI PLATFORM</span>
                                                {link.dropdown.map(sub => (
                                                    <NavLink key={sub.path} to={sub.path} className="mega-item">
                                                        {sub.label}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="nav-actions">
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">language</span>
                    </button>
                    <NavLink to="/login" className="action-btn-ghost">Log In</NavLink>
                    <NavLink to="/signup" className="action-btn-outline">Try ML Forge</NavLink>
                    <NavLink to="/contact" className="action-btn-primary">Request a Demo</NavLink>

                    <button
                        className="mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined">
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    <div className="mobile-search">
                        <span className="material-symbols-outlined">search</span>
                        <input type="text" placeholder="Search" />
                    </div>
                    <div className="mobile-links">
                        {NAV_LINKS.map(link => (
                            <div key={link.label} className="mobile-nav-item">
                                <div className="mobile-nav-header">
                                    <NavLink to={link.path}>{link.label}</NavLink>
                                    {link.dropdown && <span className="material-symbols-outlined">expand_more</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mobile-footer">
                        <NavLink to="/contact" className="action-btn-primary w-full text-center">Request a Demo</NavLink>
                    </div>
                </div>
            )}
        </nav>
    );
}
