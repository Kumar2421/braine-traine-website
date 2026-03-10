import './Footer.css';
import { NavLink } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="logo-icon white">
                                <div className="bar bar-1"></div>
                                <div className="bar bar-2"></div>
                                <div className="bar bar-3"></div>
                            </div>
                            <span className="logo-text">ML Forge</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="footer-links-group">
                        <div className="footer-col">
                            <h4 className="footer-title">Platform</h4>
                            <ul>
                                <li><NavLink to="/workflow">Workflow</NavLink></li>
                                <li><NavLink to="/agentic">Agentic AI</NavLink></li>
                                <li><NavLink to="/vector-db">Vector DB</NavLink></li>
                                <li><NavLink to="/landing">Predictive AI</NavLink></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="footer-title">Resources</h4>
                            <ul>
                                <li><NavLink to="/docs">Documentation</NavLink></li>
                                <li><NavLink to="/pricing">Pricing</NavLink></li>
                                <li><NavLink to="/usecase">Use Cases</NavLink></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="footer-title">Legal</h4>
                            <ul>
                                <li><NavLink to="/terms">Terms of Service</NavLink></li>
                                <li><NavLink to="/privacy">Privacy Policy</NavLink></li>
                                <li><NavLink to="/guarantees1">Guarantees</NavLink></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="footer-title">Company</h4>
                            <ul>
                                <li><NavLink to="/contact">About Us</NavLink></li>
                                <li><NavLink to="/contact">Careers</NavLink></li>
                                <li><NavLink to="/contact">Contact</NavLink></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-info">
                        <p>© 2026 ML Forge, Inc. - All Rights Reserved</p>
                        <div className="footer-legal-links">
                            <a href="#">Security</a>
                            <a href="#">Trust</a>
                            <a href="#">Status</a>
                        </div>
                    </div>
                    <div className="footer-social">
                        <a href="#" className="social-icon">LinkedIn</a>
                        <a href="#" className="social-icon">Twitter</a>
                        <a href="#" className="social-icon">YouTube</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
